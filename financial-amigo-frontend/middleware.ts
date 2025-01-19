import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Protect dashboard routes, redirect to login if not authenticated
export default withAuth(
  function middleware(req) {
    const isAuthPage = req.nextUrl.pathname === "/login";
    const isAuthenticated = !!req.nextauth.token;

    // If user is authenticated and trying to access login page,
    // redirect them to dashboard
    if (isAuthPage && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // For all other routes, let NextAuth handle the auth check
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page
        if (req.nextUrl.pathname === "/login") {
          return true;
        }
        // For all other routes, require authentication
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/transactions/:path*",
    "/login",
  ],
};
