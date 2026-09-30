import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkRoleApi("ADMIN"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    await prisma.partnerRequest.update({ where: { id }, data: { status: "DECLINED" } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Partner request not found" }, { status: 404 });
  }
}
