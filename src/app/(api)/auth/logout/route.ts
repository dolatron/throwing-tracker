// app/(api)/auth/logout/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function POST(): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error',
      status: 500
    });
  }
}