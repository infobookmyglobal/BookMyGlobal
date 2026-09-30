import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getS3KeyFromUrl } from "@/lib/s3";
import { sendEmail, documentReceivedEmail } from "@/lib/ses";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const application = await prisma.application.findUnique({
    where: { id },
    include: { payment: true, shipment: true },
  });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (application.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ application });
}

// Customers may only touch their own request, only while it is still open, and only these fields.
// Fees, status (other than "submit my documents") and admin data can never be set from here.
const patchSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(7).max(25),
    country: z.string().trim().min(2).max(80),
    destinationCountry: z.string().trim().max(80),
    address: z.string().trim().max(500),
    passportUrl: z.string().max(1000),
    licenseUrl: z.string().max(1000),
    profilePhotoUrl: z.string().max(1000),
    status: z.literal("UNDER_REVIEW"),
  })
  .partial()
  .strict();

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const application = await prisma.application.findUnique({ where: { id } });
  if (!application || application.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (application.status !== "PENDING" && application.status !== "UNDER_REVIEW") {
    return NextResponse.json({ error: "This request can no longer be edited." }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid fields" }, { status: 400 });

  const data: Record<string, unknown> = { ...parsed.data };
  for (const k of ["passportUrl", "licenseUrl", "profilePhotoUrl"] as const) {
    const v = parsed.data[k];
    if (typeof v === "string" && v) data[k] = getS3KeyFromUrl(v);
  }

  const updated = await prisma.application.update({ where: { id }, data });

  if (parsed.data.status === "UNDER_REVIEW" && application.status === "PENDING") {
    try {
      await sendEmail(updated.email, "Documents received — BookMyGlobal", documentReceivedEmail(updated));
    } catch (err) {
      console.error("Documents-received email failed:", err);
    }
  }

  return NextResponse.json({ application: updated });
}
