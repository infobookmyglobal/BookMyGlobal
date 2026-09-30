import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, applicationRejectedEmail } from "@/lib/ses";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkRoleApi("ADMIN"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { reason } = await req.json().catch(() => ({ reason: "" }));

  if (typeof reason !== "string" || !reason.trim()) {
    return NextResponse.json({ error: "A rejection reason is required" }, { status: 400 });
  }

  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  const app = await prisma.application.update({
    where: { id },
    data: { status: "REJECTED", rejectionReason: reason.trim() },
  });

  try {
    await sendEmail(app.email, "An update on your BookMyGlobal request", applicationRejectedEmail(app));
  } catch (err) {
    console.error("Rejection email failed:", err);
  }

  return NextResponse.json({ success: true });
}
