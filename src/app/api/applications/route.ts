import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  sendEmail,
  applicationReceivedEmail,
  sendAdminNewApplicationNotificationEmail,
} from "@/lib/ses";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ applications: [] });

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { payment: true, shipment: true },
  });

  return NextResponse.json({ applications });
}

// The customer only describes the request. The fee is quoted later, by an admin.
const createSchema = z.object({
  service: z.enum(["VISA", "ATTESTATION"]),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(7).max(25),
  country: z.string().trim().min(2).max(80),
  destinationCountry: z.string().trim().max(80).optional(),
  note: z.string().trim().max(1500).optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Please sign in to submit a request." }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the details you entered.", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    user = await prisma.user.upsert({
      where: { email: d.email },
      update: { clerkId: userId },
      create: { clerkId: userId, email: d.email, name: d.fullName, phone: d.phone, country: d.country },
    });
  }

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      productType: d.service,
      status: "PENDING",
      fullName: d.fullName,
      email: d.email,
      phone: d.phone,
      country: d.country,
      destinationCountry: d.destinationCountry || null,
      adminNotes: d.note ? `Customer note: ${d.note}` : null,
      currency: "INR",
      baseAmount: 0,
      finalAmount: 0,
    },
  });

  // Best-effort emails; never fail the request because of them.
  try {
    await sendEmail(application.email, "We've received your BookMyGlobal request", applicationReceivedEmail(application));
    await sendAdminNewApplicationNotificationEmail(application);
  } catch (err) {
    console.error("Application emails failed:", err);
  }

  return NextResponse.json({ application: { id: application.id } }, { status: 201 });
}
