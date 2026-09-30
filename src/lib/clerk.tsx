"use client";

/**
 * Thin re-export layer over @clerk/nextjs so the rest of the app imports
 * Clerk from one place ("@/lib/clerk").
 *
 * Unlike the IDP project there is NO development mock and NO localhost bypass:
 * every environment talks to a real Clerk instance, so what you test locally is
 * what runs in production.
 */
export {
  // ClerkProvider is intentionally NOT re-exported here. Import it from "@clerk/nextjs" in a server component (see app/layout.tsx).
  useAuth,
  useUser,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
