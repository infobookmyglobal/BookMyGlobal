import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendEmail,
  applicationReceivedEmail,
  applicationApprovedEmail,
  applicationRejectedEmail,
  shippingDispatchedEmail,
} from "@/lib/ses";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkRoleApi("ADMIN"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { emailType } = await req.json().catch(() => ({ emailType: "" }));

  const app = await prisma.application.findUnique({
    where: { id },
    include: { shipment: true, payment: true },
  });
  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");

  try {
    switch (emailType) {
      case "confirmation":
        await sendEmail(app.email, "We've received your BookMyGlobal request", applicationReceivedEmail(app));
        break;
      case "approved": {
        if (app.status !== "APPROVED" && app.status !== "COMPLETED") {
          return NextResponse.json({ error: "Application is not approved yet" }, { status: 400 });
        }
        const needsPayment = app.finalAmount > 0 && app.payment?.status !== "COMPLETED";
        await sendEmail(
          app.email,
          "Your BookMyGlobal request is confirmed",
          applicationApprovedEmail(app, needsPayment ? `${appUrl}/dashboard/applications/${app.id}/pay` : undefined)
        );
        break;
      }
      case "rejected":
        await sendEmail(app.email, "An update on your BookMyGlobal request", applicationRejectedEmail(app));
        break;
      case "shipping":
        if (!app.shipment?.awbNumber) {
          return NextResponse.json({ error: "No shipment with an AWB number yet" }, { status: 400 });
        }
        await sendEmail(
          app.email,
          "Your documents are on the way",
          shippingDispatchedEmail(app, {
            awbNumber: app.shipment.awbNumber,
            trackingUrl: app.shipment.trackingUrl,
            recipientName: app.shipment.recipientName,
          })
        );
        break;
      default:
        return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Resend email failed:", err);
    return NextResponse.json({ error: err?.message || "Email sending failed" }, { status: 500 });
  }
}
