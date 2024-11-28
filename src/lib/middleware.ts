// middleware.ts
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
        // Redirect authenticated users to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      // Allow access to auth pages if not signed in
      return NextResponse.next();
    }

    // Handle protected paths
    if (request.nextUrl.pathname.startsWith('/dashboard') || 
        request.nextUrl.pathname.startsWith('/api/workouts')) {
      if (!session) {
        // Redirect unauthenticated users to onboarding
        return NextResponse.redirect(new URL('/onboard', request.url));
      }

      // Check if user has completed onboarding
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, user_programs(id)')
        .eq('id', session.user.id)
        .single();

      if (userError || !userData?.name || !userData?.user_programs?.length) {
        // Redirect users who haven't completed onboarding
        return NextResponse.redirect(new URL('/onboard', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
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