// middleware.ts - TEMPORARY DEBUGGING
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge, UserTokenPayload } from "./lib/auth-edge";

export async function middleware(request: NextRequest) {
  const tokenValue = request.cookies.get("auth_token")?.value;
  console.log("[Middleware] Path:", request.nextUrl.pathname);
  console.log("[Middleware] Token from cookie:", tokenValue);

  if (tokenValue) {
    const user = verifyTokenEdge(tokenValue);
    console.log("[Middleware] User from token verification:", user);
    if (user) {
      console.log("[Middleware] User authenticated with role:", user.role);
      // If you want to test going to dashboard directly
      // if (request.nextUrl.pathname === "/client/login" && user.role === "client") {
      //   return NextResponse.redirect(new URL("/client/dashboard", request.url));
      // }
    } else {
      console.log("[Middleware] Token verification FAILED or token invalid.");
    }
  } else {
    console.log("[Middleware] No auth_token cookie found.");
  }
  return NextResponse.next(); // Allow all requests through for now
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth/login|api/auth/register).*)",
  ],
};