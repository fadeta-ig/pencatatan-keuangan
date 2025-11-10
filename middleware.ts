import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/terms', '/privacy'];

// Define auth routes that should redirect to dashboard if already logged in
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  const isAuthRoute = authRoutes.some(route => pathname === route);

  // Get session token from cookies (Firebase sets this)
  // Note: For a more robust solution, you'd verify the token on the server
  const sessionCookie = request.cookies.get('session');

  // If accessing auth routes (login/register) and already has session, redirect to dashboard
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If accessing protected routes without session, redirect to login
  if (!isPublicRoute && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
