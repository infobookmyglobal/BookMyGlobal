import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkRoleApi("ADMIN"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { notes } = await req.json().catch(() => ({ notes: "" }));

  try {
    await prisma.application.update({
      where: { id },
      data: { adminNotes: typeof notes === "string" ? notes : "" },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }
}
