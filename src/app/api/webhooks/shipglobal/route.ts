import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail, shippingDispatchedEmail } from "@/lib/ses";

export async function POST(req: NextRequest) {
  const secret = process.env.SHIPGLOBAL_WEBHOOK_SECRET;
  const rawBody = await req.text();

  // Fail closed: without a configured secret nothing can be trusted.
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }
  const signature = req.headers.get("x-shipglobal-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
  }
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(digest);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const payload = JSON.parse(rawBody);
    const { event, awb_number, timestamp } = payload;

    if (!awb_number) {
      return NextResponse.json({ error: "Missing awb_number" }, { status: 400 });
    }

    const shipment = await prisma.shipment.findFirst({
      where: { awbNumber: awb_number },
      include: { application: true },
    });

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    const date = timestamp ? new Date(timestamp) : new Date();

    if (event === "dispatched") {
      await prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          status: "dispatched",
          dispatchedAt: date,
        },
      });

      // Send dispatch notification email
      try {
        await sendEmail(
          shipment.application.email,
          "Your documents are on the way",
          shippingDispatchedEmail(shipment.application, {
            awbNumber: shipment.awbNumber,
            trackingUrl: shipment.trackingUrl,
            recipientName: shipment.recipientName,
          })
        );
      } catch (err) {
        console.error("Failed to send webhook dispatch email:", err);
      }
    } else if (event === "delivered") {
      await prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          status: "delivered",
          deliveredAt: date,
        },
      });

      await prisma.application.update({
        where: { id: shipment.applicationId },
        data: {
          status: "COMPLETED",
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("ShipGlobal Webhook failed:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}
