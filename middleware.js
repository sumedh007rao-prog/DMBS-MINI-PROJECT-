import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
  const token = req.cookies.get('token')?.value;
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return NextResponse.next();
  } catch {
    if (req.nextUrl.pathname.startsWith('/api'))
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/jobs/:path*', '/applications/:path*', '/interviews/:path*',
            '/candidates/:path*', '/profile/:path*', '/match/:path*', '/api/((?!auth).*)'],
};
