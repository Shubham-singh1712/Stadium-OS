import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const roleCookie = request.cookies.get('user_role')?.value;
  const sessionCookie = request.cookies.get('session_user')?.value;
  
  const path = request.nextUrl.pathname;
  
  const protectedRoutes = ['/fan', '/volunteer', '/security', '/operations'];
  
  const isProtected = protectedRoutes.some(route => path.startsWith(route));

  if (isProtected) {
    if (!roleCookie || !sessionCookie) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Validate role matches path
    const requiredRole = path.split('/')[1];
    if (roleCookie !== requiredRole) {
      return NextResponse.redirect(new URL(`/${roleCookie}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/fan/:path*', '/volunteer/:path*', '/security/:path*', '/operations/:path*'],
}
