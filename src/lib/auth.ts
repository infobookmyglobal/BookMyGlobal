import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { User } from "@prisma/client";
import { prisma } from "./prisma";

export type Role = "ADMIN" | "PARTNER" | "USER";

/** Comma-separated list in ADMIN_EMAIL becomes the set of auto-promoted admins. */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  return !!email && getAdminEmails().includes(email.toLowerCase());
}

/**
 * Resolves the signed-in Clerk user to a row in our own `User` table.
 * - Links a Clerk id to a pre-existing record with the same email.
 * - Auto-provisions new users (and promotes emails listed in ADMIN_EMAIL).
 * Returns null when nobody is signed in.
 */
export async function getCurrentDbUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        user = await prisma.user.update({
          where: { id: existing.id },
          data: { clerkId: userId },
        });
      }
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name:
            `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
            "User",
          role: isAdminEmail(email) ? "ADMIN" : "USER",
        },
      });

      try {
        const { sendAdminNewUserRegistrationNotificationEmail } = await import("./ses");
        await sendAdminNewUserRegistrationNotificationEmail({
          name: user.name,
          email: user.email,
          phone: user.phone,
          country: user.country,
        });
      } catch (err) {
        console.error("[auth] Failed to notify admin of new user:", err);
      }
    }
  }

  // Auto-promote when the email is in ADMIN_EMAIL
  if (user.role !== "ADMIN" && isAdminEmail(user.email)) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });
  }

  return user;
}

/** For server components / layouts: redirects away unless the user has `role`. */
export async function requireRole(role: Role) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getCurrentDbUser();
  if (!user || user.role !== role) {
    redirect(role === "USER" ? "/" : "/dashboard");
  }
  return user;
}

/** For API routes: true only when the caller is signed in with `role`. */
export async function checkRoleApi(role: Role): Promise<boolean> {
  const user = await getCurrentDbUser();
  return !!user && user.role === role;
}
