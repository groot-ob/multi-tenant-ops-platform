// import { type NextRequest, NextResponse } from "next/server";

// export const config = {
// 	matcher: [
// 		/*
// 		 * Match all request paths except for the ones starting with:
// 		 * - api (API routes)
// 		 * - _next/static (static files)
// 		 * - _next/image (image optimization files)
// 		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
// 		 */
// 		"/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
// 	],
// };
// interface RouteMatch {
// 	isOrgRoute: boolean;
// 	uniqueOrganizationId?: string;
// }

// export const RESERVED_PATHS = new Set([
// 	"api",
// 	"_next",
// 	"favicon.ico",
// 	"sitemap.xml",
// 	"robots.txt",
// 	"organizations",
// 	"auth",
// ]);

// function matchOrganizationRoute(pathname: string): RouteMatch {
// 	// Skip static and api routes immediately
// 	if (
// 		pathname.startsWith("/_next") ||
// 		pathname.startsWith("/api") ||
// 		pathname === "/" ||
// 		pathname === ""
// 	) {
// 		return { isOrgRoute: false };
// 	}

// 	// Get the first path segment
// 	const segments = pathname.split("/").filter(Boolean);
// 	const firstSegment = segments[0];

// 	if (!firstSegment) return { isOrgRoute: false };

// 	// Check if it's a reserved path
// 	if (RESERVED_PATHS.has(firstSegment.toLowerCase())) {
// 		return { isOrgRoute: false };
// 	}

// 	// If we get here, it's potentially an organization route
// 	return {
// 		isOrgRoute: true,
// 		uniqueOrganizationId: firstSegment,
// 	};
// }

// export default async function middleware(request: NextRequest) {
// 	const pathname = request.nextUrl.pathname;

// 	const routeMatch = matchOrganizationRoute(pathname);

// 	const requestHeaders = new Headers(request.headers);

// 	if (routeMatch.uniqueOrganizationId) {
// 		requestHeaders.set("x-unique-org-id", routeMatch.uniqueOrganizationId);
// 	}

// 	return NextResponse.next({
// 		request: {
// 			headers: requestHeaders,
// 		},
// 	});
// }

// import { withAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";

// export default withAuth(
//   function middleware(req) {
//     const hostname = req.headers.get("host");
//     const session = req.nextauth.token;

//     // 1. Extract the tenant slug from the hostname
//     // Example: 'acme.localhost:3000' -> 'acme'
//     const currentSlug = hostname?.split(".")[0];

//     // 2. If we are on the main domain (e.g., localhost:3000), let them pass
//     if (currentSlug === "localhost" || !currentSlug) {
//       return NextResponse.next();
//     }

//     // 3. Check if the user has a membership for this specific slug
//     const hasAccess = session?.memberships?.some(
//       (m: any) => m.slug === currentSlug
//     );

//     if (!hasAccess) {
//       // Redirect to an "Unauthorized" or "Select Organization" page
//       return NextResponse.redirect(new URL("/unauthorized", req.url));
//     }

//     return NextResponse.next();
//   },
//   {
//     callbacks: {
//       authorized: ({ token }) => !!token, // Only run if the user is logged in
//     },
//   }
// );

// export const config = {
//   // Protect all routes except the login page and static files
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
// };

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    
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