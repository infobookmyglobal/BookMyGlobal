import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createShipment } from "@/lib/shipglobal";
import { sendEmail, shippingDispatchedEmail } from "@/lib/ses";

export async function POST(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { applicationId, address, recipientName, recipientPhone } = await req.json();
    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { shipment: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const finalAddress = address || application.address || "";
    const finalName = recipientName || application.fullName;
    const finalPhone = recipientPhone || application.phone;

    if (!finalAddress) {
      return NextResponse.json({ error: "Delivery address is required" }, { status: 400 });
    }

    // Call ShipGlobal API
    const res = await createShipment({
      fullName: finalName,
      phone: finalPhone,
      email: application.email,
      address: finalAddress,
      country: application.country,
    });

    // Save Shipment record
    const shipment = await prisma.shipment.create({
      data: {
        applicationId: application.id,
        awbNumber: res.awb_number,
        trackingUrl: res.tracking_url,
        status: "dispatched",
        recipientName: finalName,
        recipientPhone: finalPhone,
        recipientAddress: finalAddress,
        dispatchedAt: new Date(),
      },
    });

    // Update Application to COMPLETED
    await prisma.application.update({
      where: { id: application.id },
      data: {
        status: "COMPLETED",
      },
    });

    // Send dispatch email
    try {
      await sendEmail(
        application.email,
        "Your documents have been dispatched",
        shippingDispatchedEmail(application, {
          awbNumber: shipment.awbNumber,
          trackingUrl: shipment.trackingUrl,
          recipientName: shipment.recipientName,
        })
      );
    } catch (err) {
      console.error("Failed to send shipping email:", err);
    }

    return NextResponse.json({
      success: true,
      awbNumber: shipment.awbNumber,
      trackingUrl: shipment.trackingUrl,
    });
  } catch (error: any) {
    console.error("Create shipment route failed:", error);
    return NextResponse.json({ error: error.message || "Failed to create shipment" }, { status: 500 });
  }
}
