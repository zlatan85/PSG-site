import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin/agent')) {
    return NextResponse.next();
  }

  const expected = process.env.ADMIN_TOKEN || '';
  const token = request.nextUrl.searchParams.get('token') || '';

  if (!expected || token !== expected) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/agent/:path*'],
};
