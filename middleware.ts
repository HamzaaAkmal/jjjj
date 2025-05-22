// middleware.ts - TEMPORARY DEBUGGING
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge, UserTokenPayload } from "./lib/auth-edge";

// Define path constants
const adminDashboardPaths = ["/admin/dashboard", "/admin/settings", "/admin/users"]; // Added more examples
const clientDashboardPaths = ["/client/dashboard", "/client/profile", "/client/payment-history"]; // Added more examples
const adminLoginPath = "/admin/login";
const clientLoginPath = "/client/login";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log("[Middleware] Path:", pathname);

  // Placeholder for checking auth status (e.g., via a cookie set after Firebase login)
  // For now, this will be a conceptual check. We assume false to simulate unauthenticated.
  // In a real scenario with Firebase, this would likely involve checking a custom cookie
  // set upon successful Firebase client-side login, as direct Firebase SDK auth state
  // is not easily available in edge middleware.
  const isAuthenticatedAdmin = false; // TODO: Replace with actual check
  const isAuthenticatedClient = false; // TODO: Replace with actual check

  console.log(`[Middleware] Current path: ${pathname}, isAuthenticatedAdmin: ${isAuthenticatedAdmin}, isAuthenticatedClient: ${isAuthenticatedClient}`);

  // Redirect authenticated users from login pages
  if (isAuthenticatedAdmin && pathname === adminLoginPath) {
    console.log("[Middleware] CONCEPT: Authenticated admin on admin login page. Would redirect to admin dashboard.");
    // return NextResponse.redirect(new URL(adminDashboardPaths[0], request.url));
  } else if (isAuthenticatedClient && pathname === clientLoginPath) {
    console.log("[Middleware] CONCEPT: Authenticated client on client login page. Would redirect to client dashboard.");
    // return NextResponse.redirect(new URL(clientDashboardPaths[0], request.url));
  }
  // Redirect unauthenticated users from dashboard pages
  else if (!isAuthenticatedAdmin && adminDashboardPaths.some(p => pathname.startsWith(p))) {
    console.log(`[Middleware] CONCEPT: Unauthenticated access attempt to admin path ${pathname}. Would redirect to admin login.`);
    // return NextResponse.redirect(new URL(adminLoginPath, request.url));
  } else if (!isAuthenticatedClient && clientDashboardPaths.some(p => pathname.startsWith(p))) {
    console.log(`[Middleware] CONCEPT: Unauthenticated access attempt to client path ${pathname}. Would redirect to client login.`);
    // return NextResponse.redirect(new URL(clientLoginPath, request.url));
  } else {
    console.log("[Middleware] No redirect conditions met, proceeding to requested path.");
  }

  return NextResponse.next(); // Allow all requests through by default or if no conditions met
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth/login|api/auth/register).*)",
  ],
};