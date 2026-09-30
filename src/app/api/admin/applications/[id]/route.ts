import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getS3KeyFromUrl } from "@/lib/s3";

const putSchema = z
  .object({
    fullName: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().max(25),
    country: z.string().trim().max(80),
    destinationCountry: z.string().trim().max(80),
    address: z.string().trim().max(500),
    shippingAddress: z.string().trim().max(500),
    passportUrl: z.string().max(1000),
    licenseUrl: z.string().max(1000),
    profilePhotoUrl: z.string().max(1000),
    // Fee quote. `baseAmount` is what the customer will be asked to pay.
    baseAmount: z.number().min(0).max(100000000),
    currency: z.string().trim().length(3),
  })
  .partial();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = putSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid fields", details: parsed.error.flatten() }, { status: 400 });
    }
    const { shippingAddress, baseAmount, currency, ...fields } = parsed.data;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { payment: true },
    });
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = { ...fields };

    for (const k of ["passportUrl", "licenseUrl", "profilePhotoUrl"] as const) {
      const v = fields[k];
      if (typeof v === "string") data[k] = v ? getS3KeyFromUrl(v) : null;
    }

    // Keep the shipping address inside the admin notes, as the review panel expects.
    if (shippingAddress !== undefined) {
      let notes = application.adminNotes || "";
      const shippingRegex = /([\s|]*SHIPPING ADDRESS:\s*)([^\n|]*)/i;
      if (shippingRegex.test(notes)) {
        notes = notes.replace(shippingRegex, (_m, prefix) => `${prefix}${shippingAddress}`);
      } else if (shippingAddress) {
        notes = notes ? `${notes} | SHIPPING ADDRESS: ${shippingAddress}` : `SHIPPING ADDRESS: ${shippingAddress}`;
      }
      data.adminNotes = notes;
    }

    // Quote changes are not allowed once the customer has paid.
    if (baseAmount !== undefined || currency !== undefined) {
      if (application.payment?.status === "COMPLETED") {
        return NextResponse.json({ error: "This request has already been paid; the fee can't be changed." }, { status: 409 });
      }
      if (baseAmount !== undefined) {
        data.baseAmount = baseAmount;
        data.finalAmount = baseAmount;
        data.discountAmount = 0;
        data.couponCode = null;
      }
      if (currency !== undefined) data.currency = currency.toUpperCase();
    }

    await prisma.application.update({ where: { id }, data });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Failed to update application:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update application" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Find the payment associated with the application to delete any commissions
    const payment = await prisma.payment.findUnique({
      where: { applicationId: id },
    });

    if (payment) {
      // Delete associated commissions
      await prisma.commission.deleteMany({
        where: { paymentId: payment.id },
      });
    }

    // 2. Delete associated shipment
    await prisma.shipment.deleteMany({
      where: { applicationId: id },
    });

    // 3. Delete associated payment
    await prisma.payment.deleteMany({
      where: { applicationId: id },
    });

    // 4. Delete the application
    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Application deleted successfully" });
  } catch (error: unknown) {
    console.error("Failed to delete application:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete application" },
      { status: 500 }
    );
  }
}

