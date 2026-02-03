// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, getUserData } from "@/lib/cookies";

const publicRoutes = ['/login', '/register'];
const adminRoutes = ['/admin'];
const musicianRoutes = ['/musician'];
const organizerRoutes = ['/organizer'];
const userRoutes = ['/user']; // Shared routes for all authenticated users

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = await getAuthToken();
    const user = token ? await getUserData() : null;
    
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    const isMusicianRoute = musicianRoutes.some(route => pathname.startsWith(route));
    const isOrganizerRoute = organizerRoutes.some(route => pathname.startsWith(route));
    const isUserRoute = userRoutes.some(route => pathname.startsWith(route));
    
    // Redirect to login if not authenticated and trying to access protected route
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // If authenticated, check role-based access
    if (token && user) {
        // Admin routes - only admin can access
        if (isAdminRoute && user.role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }
        
        // Musician routes - only musician can access
        if (isMusicianRoute && user.role !== 'musician') {
            return NextResponse.redirect(new URL('/', request.url));
        }
        
        // Organizer routes - only organizer can access
        if (isOrganizerRoute && user.role !== 'organizer') {
            return NextResponse.redirect(new URL('/', request.url));
        }
        
        // User routes - any authenticated user can access
        // No restriction needed, all roles can access /user/*
    }
    
    // If logged in and trying to access public routes (login/register), redirect to home
    if (isPublicRoute && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Protected routes
        '/admin/:path*',
        '/musician/:path*',
        '/organizer/:path*',
        '/user/:path*',
        // Public routes (to redirect if already logged in)
        '/login',
        '/register'
    ]
}