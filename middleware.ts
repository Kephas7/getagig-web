// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, getUserData } from "@/lib/cookies";

const publicRoutes = ['/login', '/register', '/'];
const adminRoutes = ['/admin'];
const musicianRoutes = ['/musician'];
const organizerRoutes = ['/organizer'];
const protectedRoutes = ['/admin', '/musician', '/organizer', '/messages', '/notifications'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = await getAuthToken();
    const user = token ? await getUserData() : null;

    // Check if route is public (exact match or starts with)
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    const isMusicianRoute = musicianRoutes.some(route => pathname.startsWith(route));
    const isOrganizerRoute = organizerRoutes.some(route => pathname.startsWith(route));

    const isAuthenticated = !!token && !!user;

    if (!isAuthenticated && isProtectedRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. If authenticated, check role-based access
    if (isAuthenticated && user) {
        // Exempt public profile routes from role-based redirects
        const isPublicProfile =
            pathname.startsWith('/musician/profile/') && pathname.split('/').length === 4 ||
            pathname.startsWith('/organizer/profile/') && pathname.split('/').length === 4;

        if (!isPublicProfile) {
            if (isAdminRoute && user.role !== 'admin') {
                return NextResponse.redirect(new URL('/' + user.role, request.url));
            }
            if (isMusicianRoute && user.role !== 'musician') {
                return NextResponse.redirect(new URL('/' + user.role, request.url));
            }
            if (isOrganizerRoute && user.role !== 'organizer') {
                return NextResponse.redirect(new URL('/' + user.role, request.url));
            }
        }
    }

    // 3. If logged in and trying to access public auth routes (login/register), redirect to home/dashboard
    // Only redirect if we have a valid user role to redirect to
    if (isAuthenticated && user?.role && (pathname === '/login' || pathname === '/register')) {
        const target = user.role === 'admin' ? '/admin' : `/${user.role}`;
        return NextResponse.redirect(new URL(target, request.url));
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
         * - public images/assets
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|js|css)).*)',
    ]
}