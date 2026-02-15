import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isPublicOrgRoute = createRouteMatcher(["/select-org", "/create-org"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth().protect();
    
    const { orgId } = auth();
    if (!orgId) {
      const selectOrgUrl = new URL("/select-org", req.url);
      return NextResponse.redirect(selectOrgUrl);
    }
  }

  if (isAuthRoute(req)) {
    const { userId, orgId } = auth();
    if (userId) {
      const destination = orgId ? "/dashboard" : "/select-org";
      const redirectUrl = new URL(destination, req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isPublicOrgRoute(req)) {
    const { userId, orgId } = auth();
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    }
    if (orgId) {
      const dashboardUrl = new URL("/dashboard", req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};