import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('accessToken')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  // 1. Agar login qilmagan bo'lsa va login sahifasida bo'lmasa -> Loginga haydash
  if (!token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Agar login qilgan bo'lsa va login sahifasiga yoki "/" ga kirmoqchi bo'lsa -> Roliga qarab haydash
  if (token && (pathname === '/login' || pathname === '/')) {
    const target = role ? `/${role}` : '/login'; 
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};