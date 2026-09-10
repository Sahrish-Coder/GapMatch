import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rankMatches, StudentRow } from '@/lib/matching';

/**
 * GET /api/matches?email=<email>
 *
 * Returns ranked match results for the student identified by `email`.
 * Candidates are all other students in the same course.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Query parameter "email" is required.' },
        { status: 400 }
      );
    }

    // 1. Fetch the seeker's own profile
    const { data: seekerData, error: seekerError } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single();

    if (seekerError || !seekerData) {
      return NextResponse.json(
        { error: 'Student profile not found. Please register first.' },
        { status: 404 }
      );
    }

    const seeker = seekerData as StudentRow;

    // 2. Fetch all other students in the same course
    const { data: candidateData, error: candidateError } = await supabase
      .from('students')
      .select('*')
      .eq('course', seeker.course)
      .neq('email', seeker.email);

    if (candidateError) {
      return NextResponse.json({ error: candidateError.message }, { status: 500 });
    }

    const candidates = (candidateData ?? []) as StudentRow[];

    if (candidates.length === 0) {
      return NextResponse.json(
        {
          matches: [],
          message: 'No other students have registered for this course yet. Check back soon!',
        },
        { status: 200 }
      );
    }

    // 3. Run AI matching — embeddings + scoring + Chat explanations
    const matches = await rankMatches(seeker, candidates);

    return NextResponse.json({ matches }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected server error.';
    console.error('[/api/matches]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
