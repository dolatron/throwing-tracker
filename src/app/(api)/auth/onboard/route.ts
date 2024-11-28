// app/(api)/auth/onboard/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/api';
import type { OnboardRequest } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse<ApiResponse<{ userId: string; programId: string }>>> {
  const supabase = createRouteHandlerClient({ cookies });
  let body: OnboardRequest;
  
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({
      error: 'Invalid request body',
      status: 400
    });
  }

  const { firstName, email, programId } = body;

  if (!email || !programId) {
    return NextResponse.json({
      error: 'Missing required fields',
      status: 400
    });
  }

  try {
    // Check if user exists
    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('id, name')
      .eq('email', email)
      .single();

    if (lookupError && lookupError.code !== 'PGRST116') {
      throw lookupError;
    }

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;

      // Update name if provided
      if (firstName && firstName !== existingUser.name) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            name: firstName, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', userId);

        if (updateError) throw updateError;
      }
    } else {
      // Create new user
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          name: firstName,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (userError) throw userError;
      userId = newUser.id;
    }

    // Check for existing program
    const { data: existingProgram } = await supabase
      .from('user_programs')
      .select('id')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .single();

    if (existingProgram) {
      return NextResponse.json({ 
        data: {
          userId,
          programId: existingProgram.id
        },
        status: 200
      });
    }

    // Create new program for user
    const { data: programData, error: programError } = await supabase
      .from('user_programs')
      .insert({
        user_id: userId,
        program_id: programId,
        start_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (programError) throw programError;

    return NextResponse.json({ 
      data: {
        userId,
        programId: programData.id
      },
      status: 200
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error',
      status: 500
    });
  }
}