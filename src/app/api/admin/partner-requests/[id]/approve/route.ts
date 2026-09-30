import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { randomBytes } from "crypto";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRandomPassword } from "@/lib/userCreation";
import { sendPartnerWelcomeEmail } from "@/lib/ses";

function makeReferralCode(name: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4).padEnd(4, "X");
  return `${prefix}${randomBytes(2).toString("hex").toUpperCase()}`;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkRoleApi("ADMIN"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const request = await prisma.partnerRequest.findUnique({ where: { id } });
  if (!request) return NextResponse.json({ error: "Partner request not found" }, { status: 404 });
  if (request.status !== "PENDING") {
    return NextResponse.json({ error: `Request already ${request.status.toLowerCase()}` }, { status: 400 });
  }

  try {
    // 1. Clerk account (create if needed) --------------------------------------------------
    const client = await clerkClient();
    const existing = await client.users.getUserList({ emailAddress: [request.email] });
    let clerkId: string;
    let temporaryPassword: string | undefined;

    if (existing.data.length > 0) {
      clerkId = existing.data[0].id;
      await client.users.updateUserMetadata(clerkId, { publicMetadata: { role: "partner" } });
    } else {
      temporaryPassword = generateRandomPassword();
      const [firstName, ...rest] = request.name.trim().split(/\s+/);
      const created = await client.users.createUser({
        emailAddress: [request.email],
        password: temporaryPassword,
        firstName: firstName || "Partner",
        lastName: rest.join(" ") || undefined,
        publicMetadata: { role: "partner" },
      });
      clerkId = created.id;
    }

    // 2. Local user -> PARTNER ---------------------------------------------------------------
    const user = await prisma.user.upsert({
      where: { email: request.email },
      update: { role: "PARTNER", clerkId, name: request.name, phone: request.phone },
      create: { clerkId, email: request.email, name: request.name, phone: request.phone, role: "PARTNER" },
    });

    // 3. Partner profile + matching checkout coupon ---------------------------------------------
    let partner = await prisma.partner.findUnique({ where: { userId: user.id } });
    if (!partner) {
      let referralCode = makeReferralCode(request.name);
      while (await prisma.partner.findUnique({ where: { referralCode } })) {
        referralCode = makeReferralCode(request.name);
      }
      partner = await prisma.partner.create({
        data: { userId: user.id, referralCode },
      });
    }

    const couponExists = await prisma.coupon.findFirst({ where: { partnerId: partner.id } });
    if (!couponExists) {
      const discount = parseFloat(
        (await prisma.setting.findUnique({ where: { key: "partner_coupon_discount_percent" } }))?.value ?? "0"
      );
      await prisma.coupon.create({
        data: {
          code: partner.referralCode,
          discountType: "PERCENT",
          discountValue: Number.isFinite(discount) ? discount : 0,
          partnerId: partner.id,
          commissionRate: partner.commissionRate,
        },
      });
    }

    await prisma.partnerRequest.update({ where: { id }, data: { status: "APPROVED" } });

    try {
      await sendPartnerWelcomeEmail(partner, user, temporaryPassword);
    } catch (err) {
      console.error("Partner welcome email failed:", err);
    }

    return NextResponse.json({ success: true, referralCode: partner.referralCode });
  } catch (error: any) {
    console.error("Partner approval failed:", error);
    return NextResponse.json(
      { error: error?.errors?.[0]?.longMessage || error?.message || "Failed to approve partner request" },
      { status: 500 }
    );
  }
}
