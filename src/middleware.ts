import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Protect dashboard routes
        if (pathname.startsWith('/dashboard')) {
          return !!token;
        }
        
        // Protect admin routes
        if (pathname.startsWith('/admin')) {
          return !!token && token.email === process.env.ADMIN_EMAIL;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
};