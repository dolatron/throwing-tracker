// app/(api)/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const cookieStore = cookies();

    if (code) {
      const supabase = createRouteHandlerClient({ 
        cookies: () => cookieStore 
      });
      
      await supabase.auth.exchangeCodeForSession(code);
    }

    // Redirect to dashboard regardless of code presence
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/onboard', request.url));
  }
}