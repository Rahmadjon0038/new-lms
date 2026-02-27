import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('accessToken')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;
  const roleHomeRedirectMap = {
    admin: '/admin/attendance',
    teacher: '/teacher/attendance',
    student: '/student',
    super_admin: '/super_admin',
  };
  const roleBaseMap = {
    admin: '/admin',
    teacher: '/teacher',
    student: '/student',
    super_admin: '/super_admin',
  };

  // 1. Agar login qilmagan bo'lsa va login sahifasida bo'lmasa -> Loginga haydash
  if (!token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Agar login qilgan bo'lsa va login sahifasiga yoki "/" ga kirmoqchi bo'lsa -> Roliga qarab haydash
  if (token && (pathname === '/login' || pathname === '/')) {
    const target = roleHomeRedirectMap[role] || '/login';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 3. Rolga tegishli bo'lmagan sahifaga kirsa -> o'z home sahifasiga qaytarish
  if (token && role) {
    if (role === 'super_admin' && pathname.startsWith('/super_admin/attendance')) {
      return NextResponse.redirect(new URL('/super_admin', request.url));
    }

    const roleBase = roleBaseMap[role];
    if (roleBase) {
      const protectedBases = Object.values(roleBaseMap);
      const requestedBase = protectedBases.find((base) => pathname === base || pathname.startsWith(`${base}/`));
      if (requestedBase && requestedBase !== roleBase) {
        const target = roleHomeRedirectMap[role] || roleBase;
        return NextResponse.redirect(new URL(target, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)',
  ],
};
