import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, applicationApprovedEmail } from "@/lib/ses";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkRoleApi("ADMIN"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.application.findUnique({
    where: { id },
    include: { payment: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const application = await prisma.application.update({
    where: { id },
    data: { status: "APPROVED", rejectionReason: null },
  });

  // If a fee has been quoted and is still unpaid, the email carries a pay link.
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  const needsPayment = application.finalAmount > 0 && existing.payment?.status !== "COMPLETED";
  try {
    await sendEmail(
      application.email,
      "Your BookMyGlobal request is confirmed",
      applicationApprovedEmail(application, needsPayment ? `${appUrl}/dashboard/applications/${id}/pay` : undefined)
    );
  } catch (emailErr) {
    console.error("Approval email failed (application is still approved):", emailErr);
  }

  return NextResponse.json({ success: true });
}
