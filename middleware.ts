import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('[MIDDLEWARE] Request to:', pathname);

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Check for Supabase auth cookies set by the browser
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;

    console.log('[MIDDLEWARE] Dashboard access check:', {
      pathname,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length,
      refreshTokenLength: refreshToken?.length
    });

    if (!accessToken && !refreshToken) {
      console.log('[MIDDLEWARE] No auth cookies found, allowing dashboard render for client-side auth check');
      return NextResponse.next();
    }

    console.log('[MIDDLEWARE] Auth cookies found, allowing access');
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
