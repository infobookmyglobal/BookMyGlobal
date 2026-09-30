import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/ses";

const TYPES = [
  "GENERAL", "RETREAT", "ATTESTATION", "VISA", "FLIGHT", "HOTEL",
  "TOURS", "CRUISE", "BUS", "COMMUNITY",
] as const;

const schema = z.object({
  type: z.enum(TYPES).default("GENERAL"),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(5).max(4000),
  meta: z.record(z.string(), z.any()).optional(),
  // honeypot: real users never fill this in
  website: z.string().max(0).optional(),
});

// Tiny in-memory rate limit (per server instance) to blunt form spam.
const hits = new Map<string, { count: number; reset: number }>();
function rateLimited(key: string, limit = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }
  const { website: _hp, meta, ...data } = parsed.data;

  const enquiry = await prisma.enquiry.create({
    data: { ...data, meta: meta ? JSON.stringify(meta) : null },
  });

  // Notify the team (never fail the request if email is down)
  try {
    const to = process.env.ADMIN_EMAIL;
    if (to) {
      const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
      await sendEmail(
        to,
        `New ${data.type.toLowerCase()} enquiry from ${data.name}`,
        `<p><strong>${esc(data.name)}</strong> (${esc(data.email)}${data.phone ? `, ${esc(data.phone)}` : ""}) sent a <strong>${data.type}</strong> enquiry:</p><p>${esc(data.message).replace(/\n/g, "<br/>")}</p>`
      );
    }
  } catch (err) {
    console.error("Enquiry notification failed:", err);
  }

  return NextResponse.json({ success: true, id: enquiry.id }, { status: 201 });
}
