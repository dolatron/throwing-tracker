// app/(api)/auth/onboard/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  const supabase = createRouteHandlerClient({ cookies });
  let body;
  
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const { firstName, email, programId } = body;

  // Validate required fields
  if (!email || !programId) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    // Check if user exists
    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('id, name')
      .eq('email', email)
      .single();

    if (lookupError && lookupError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw lookupError;
    }

    let userId;

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
        userId,
        programId: existingProgram.id,
        isExisting: true
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
      userId,
      programId: programData.id,
      isExisting: false
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' }, 
      { status: 500 }
    );
  }
}