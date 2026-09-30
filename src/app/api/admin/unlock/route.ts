import { NextRequest, NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import {
  ADMIN_UNLOCK_COOKIE,
  UNLOCK_COOKIE_MAX_AGE,
  createUnlockToken,
  passwordMatches,
} from "@/lib/admin-lock";

export async function POST(req: NextRequest) {
  const user = await getCurrentDbUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { password } = await req.json().catch(() => ({ password: "" }));
  if (typeof password !== "string" || !passwordMatches(password)) {
    return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 403 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_UNLOCK_COOKIE, createUnlockToken(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: UNLOCK_COOKIE_MAX_AGE,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(ADMIN_UNLOCK_COOKIE);
  return res;
}
