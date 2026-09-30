import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ role: z.enum(["USER", "PARTNER", "ADMIN"]) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentDbUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  const { role } = parsed.data;

  if (id === admin.id && role !== "ADMIN") {
    return NextResponse.json({ error: "You cannot remove your own admin access" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const user = await prisma.user.update({ where: { id }, data: { role } });

  if (role === "PARTNER") {
    const existing = await prisma.partner.findUnique({ where: { userId: id } });
    if (!existing) {
      let referralCode = "";
      do {
        const prefix = (user.name || "PART").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4).padEnd(4, "X");
        referralCode = `${prefix}${randomBytes(2).toString("hex").toUpperCase()}`;
      } while (await prisma.partner.findUnique({ where: { referralCode } }));
      await prisma.partner.create({ data: { userId: id, referralCode } });
    }
  }

  // Keep Clerk metadata in step (used by the dashboard sidebar to show the Partner link)
  try {
    if (!user.clerkId.startsWith("dev_")) {
      const client = await clerkClient();
      await client.users.updateUserMetadata(user.clerkId, { publicMetadata: { role: role.toLowerCase() } });
    }
  } catch (err) {
    console.error("Clerk metadata sync failed:", err);
  }

  return NextResponse.json({ success: true, user: { id: user.id, role: user.role } });
}
