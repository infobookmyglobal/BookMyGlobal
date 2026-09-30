import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await checkRoleApi("ADMIN"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return NextResponse.json(enquiries);
}

export async function PUT(req: NextRequest) {
  if (!(await checkRoleApi("ADMIN"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = await req.json().catch(() => ({}));
  if (!id || !["NEW", "CONTACTED", "CLOSED"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const updated = await prisma.enquiry.update({ where: { id }, data: { status } });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  if (!(await checkRoleApi("ADMIN"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  await prisma.enquiry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
