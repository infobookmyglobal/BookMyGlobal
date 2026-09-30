import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendFormEditRequestEmail } from "@/lib/ses";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkRoleApi("ADMIN"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { notes } = await req.json().catch(() => ({ notes: "" }));

  if (typeof notes !== "string" || !notes.trim()) {
    return NextResponse.json({ error: "Please describe what needs to be corrected" }, { status: 400 });
  }

  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  const app = await prisma.application.update({
    where: { id },
    data: {
      status: "PENDING",
      adminNotes: [existing.adminNotes, `EDIT REQUESTED: ${notes.trim()}`].filter(Boolean).join(" | "),
    },
  });

  try {
    await sendFormEditRequestEmail(app, notes.trim());
  } catch (err) {
    console.error("Edit request email failed:", err);
    return NextResponse.json({ error: "Saved, but the email could not be sent" }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
