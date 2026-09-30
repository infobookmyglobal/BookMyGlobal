import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/partner(.*)",
  "/dashboard(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
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

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
