import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Returns the signed-in user's role so the public header can show the right link.
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ role: null });
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });
  return NextResponse.json({ role: user?.role ?? "USER" });
}
