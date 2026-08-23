import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Role-based route guard for sensitive admin areas if needed
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Always public routes
        if (
          pathname === '/' ||
          pathname === '/login' ||
          pathname === '/signup' ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/fonts') ||
          pathname === '/favicon.ico' ||
          pathname === '/logo.svg'
        ) {
          return true;
        }

        // Must have valid session token for protected routes
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'shieldsense-production-secret-auth-key-2025',
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.svg
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
};
