import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(160),
  phone: z.string().trim().min(6).max(30),
  address: z.string().trim().min(3).max(400),
});

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Please fill in name, email, phone and address correctly." }, { status: 400 });
    }
    const { name, email, phone, address } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email }, select: { role: true } });
    if (existingUser?.role === "PARTNER") {
      return NextResponse.json({ error: "This email is already registered as a partner." }, { status: 400 });
    }

    const existing = await prisma.partnerRequest.findUnique({ where: { email }, select: { status: true } });
    if (existing?.status === "PENDING") {
      return NextResponse.json({ error: "You already have a pending request. Please wait for admin approval." }, { status: 400 });
    }
    if (existing?.status === "APPROVED") {
      return NextResponse.json({ error: "This email has already been approved. Check your inbox for login details." }, { status: 400 });
    }

    // A declined applicant may re-apply.
    await prisma.partnerRequest.upsert({
      where: { email },
      update: { name, phone, address, status: "PENDING" },
      create: { name, email, phone, address, status: "PENDING" },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Partner application error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
