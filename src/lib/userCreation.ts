import { randomInt } from "crypto";

/** Random 12-character password (crypto-secure), without ambiguous characters. Used for partner accounts. */
export function generateRandomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let pwd = "";
  for (let i = 0; i < 12; i++) pwd += chars.charAt(randomInt(chars.length));
  return pwd;
}
