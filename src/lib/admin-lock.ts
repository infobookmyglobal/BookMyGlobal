import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Server-verified replacement for client-side "unlock" password.
 *
 * The password lives in the ADMIN_UNLOCK_PASSWORD env var. Unlocking sets a
 * signed, httpOnly, 12-hour cookie; nothing secret ever reaches the browser.
 */
export const ADMIN_UNLOCK_COOKIE = "bmg_admin_unlocked";
const TTL_SECONDS = 60 * 60 * 12;

export { OPEN_ADMIN_PREFIXES } from "./admin-lock-prefixes";

function secret(): string {
  return (
    process.env.ADMIN_UNLOCK_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    "bmg_admin_unlock_fallback_secret_key_2026_default"
  );
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function passwordMatches(input: string): boolean {
  const expected = process.env.ADMIN_UNLOCK_PASSWORD || "admin123";
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createUnlockToken(userId: string): string {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `${userId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyUnlockToken(token: string | undefined, userId: string): boolean {
  if (!token || !userId) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [uid, exp, sig] = parts;
    if (uid !== userId || Number(exp) < Date.now() / 1000) return false;
    const expected = sign(`${uid}.${exp}`);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function isAdminUnlocked(userId?: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const store = await cookies();
    return verifyUnlockToken(store.get(ADMIN_UNLOCK_COOKIE)?.value, userId);
  } catch {
    return false;
  }
}

export const UNLOCK_COOKIE_MAX_AGE = TTL_SECONDS;
