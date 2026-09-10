import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, course, confidentTopics, strugglingTopics } = body;

    if (!name || !email || !course) {
      return NextResponse.json(
        { error: 'Name, email, and course are required fields.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('students')
      .upsert(
        {
          name,
          email,
          course,
          confident_topics: confidentTopics || [],
          struggling_topics: strugglingTopics || [],
        },
        { onConflict: 'email' }
      )
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ student: data[0] }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
       error: err.message }, { status: 500 });
  }
}