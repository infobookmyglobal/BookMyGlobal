import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const partners = await prisma.partner.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { totalReferrals: "desc" },
  });

  return NextResponse.json(partners);
}

export async function PUT(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, referralCode, commissionRate, isActive } = await req.json();

    const existing = await prisma.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Partner record not found" }, { status: 404 });
    }

    // Check if new referralCode is taken
    if (referralCode && referralCode !== existing.referralCode) {
      const taken = await prisma.partner.findUnique({ where: { referralCode } });
      if (taken) {
        return NextResponse.json({ error: "Referral code already taken" }, { status: 400 });
      }
    }

    const updated = await prisma.partner.update({
      where: { id },
      data: {
        referralCode: referralCode || existing.referralCode,
        commissionRate: commissionRate !== undefined ? parseFloat(commissionRate) : existing.commissionRate,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });

    // Seamlessly sync matching checkout Coupon with partner updates
    const existingCoupon = await prisma.coupon.findFirst({
      where: { partnerId: id },
    });

    if (existingCoupon) {
      await prisma.coupon.update({
        where: { id: existingCoupon.id },
        data: {
          code: (referralCode || existing.referralCode).toUpperCase().replace(/\s+/g, ""),
          commissionRate: commissionRate !== undefined ? parseFloat(commissionRate) : existing.commissionRate,
          isActive: isActive !== undefined ? isActive : existing.isActive,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Partner update failed:", error);
    return NextResponse.json({ error: error.message || "Failed to update partner" }, { status: 500 });
  }
}
