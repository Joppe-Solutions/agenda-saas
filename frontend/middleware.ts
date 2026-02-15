import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = auth();

  if (isProtectedRoute(req)) {
    await auth().protect();
  }

  if (isAuthRoute(req)) {
    if (userId) {
      const dashboard = new URL("/dashboard", req.url);
      return NextResponse.redirect(dashboard);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};