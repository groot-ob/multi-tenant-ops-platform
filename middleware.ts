import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const lru = new Map<string, { count: number; lastReset: number }>();

function isRateLimited(ip: string, limit: number, windowMs: number) {
  const now = Date.now();
  const userData = lru.get(ip) || { count: 0, lastReset: now };

  if (now - userData.lastReset > windowMs) {
    userData.count = 0;
    userData.lastReset = now;
  }

  userData.count++;
  lru.set(ip, userData);

  return userData.count > limit;
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const ip = req.ip ?? "127.0.0.1";
    
    // Allow these paths to always pass through
    if (
      pathname === "/" || 
      pathname === "/login" || 
      pathname === "/unauthorized" ||
      pathname.startsWith("/api/auth")
    ) {
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // If this returns true, the middleware function above runs
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // Only run middleware on tenant routes and dashboard
  matcher: ["/t/:path*", "/dashboard/:path*"],
};