import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReuploadRequestEmail } from "@/lib/ses";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkRoleApi("ADMIN"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { passport, license, profile, notes } = await req.json().catch(() => ({}));

  const docs: string[] = [];
  if (passport) docs.push("Passport");
  if (license) docs.push("Supporting document");
  if (profile) docs.push("Photograph");
  if (docs.length === 0) {
    return NextResponse.json({ error: "Select at least one document" }, { status: 400 });
  }

  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  // Move back to PENDING so the customer's upload portal (and presign check) is open again
  const app = await prisma.application.update({
    where: { id },
    data: {
      status: "PENDING",
      adminNotes: [existing.adminNotes, `RE-UPLOAD REQUESTED (${docs.join(", ")})${notes ? `: ${notes}` : ""}`]
        .filter(Boolean)
        .join(" | "),
    },
  });

  try {
    await sendReuploadRequestEmail(app, docs, typeof notes === "string" ? notes : undefined);
  } catch (err) {
    console.error("Re-upload email failed:", err);
    return NextResponse.json({ error: "Saved, but the email could not be sent" }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
