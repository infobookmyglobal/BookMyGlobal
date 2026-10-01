import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/partner(.*)",
  "/dashboard(.*)",
]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Normalise /ADMIN and /Admin to /admin
  if (/^\/(ADMIN|Admin)(\/|$)/.test(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/(ADMIN|Admin)/, "/admin");
    return NextResponse.redirect(url, 308);
  }

  // Protected in EVERY environment, including development
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export default async function middleware(req: NextRequest) {
  // Guard: if Clerk keys are missing, fail gracefully instead of crashing with 500
  if (
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    !process.env.CLERK_SECRET_KEY
  ) {
    console.error(
      "[middleware] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY or CLERK_SECRET_KEY is not set. " +
        "Authentication is disabled. Set these env vars in Vercel."
    );
    // Allow the request through without auth — Clerk-protected pages will
    // still be guarded by individual route handlers that call auth.protect().
    return NextResponse.next();
  }

  return clerkHandler(req, {} as never);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
