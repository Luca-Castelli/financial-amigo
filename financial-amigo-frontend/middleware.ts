import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Protect dashboard routes, redirect to login if not authenticated
export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token?.email;
    const isAuthPage =
      req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register";
    const isEmailCallback = req.nextUrl.pathname.startsWith(
      "/api/auth/callback/email"
    );

    if (isEmailCallback) {
      return null; // Allow email verification callback to proceed
    }

    if (req.nextUrl.pathname === "/verify-request") {
      return null; // Allow access to verify-request page
    }

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    // Only redirect to login for non-auth pages when user is not authenticated
    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(from)}`, req.url)
      );
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow the middleware to run but let the middleware function handle the logic
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/verify-request",
    "/api/auth/callback/email",
  ],
};
