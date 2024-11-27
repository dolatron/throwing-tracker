// middleware/auth.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  try {
    const supabase = createMiddlewareClient({ req: request, res: NextResponse });
    
    // Refresh session if needed
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;

    // Handle auth paths
    if (request.nextUrl.pathname.startsWith('/auth')) {
      if (session) {
        // If user is signed in, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      // Allow access to auth pages if not signed in
      return NextResponse.next();
    }

    // Handle protected paths
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!session) {
        // If no session, redirect to onboarding
        return NextResponse.redirect(new URL('/onboard', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // Default to onboarding instead of login
    return NextResponse.redirect(new URL('/onboard', request.url));
  }
}

// Configure which paths should be handled by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't require authentication
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};