import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

// GET: Fetch all sessions for the authenticated user
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: sessions, error } = await supabase
      .from('sessions')
      .select(`
        id,
        hours,
        type,
        date,
        subject:subjects!inner(
          name,
          macro:macros!inner(
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;

    console.log("RAW SESSIONS:", JSON.stringify(sessions, null, 2));

    // Flatten the response for the frontend
    const formattedSessions = sessions.map((s: any) => ({
      id: s.id,
      hours: s.hours,
      type: s.type,
      date: s.date,
      subject: s.subject?.name,
      macro: s.subject?.macro?.name
    }));

    return NextResponse.json(formattedSessions);
  } catch (error: any) {
    console.error("API GET Error:", error.message);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

// POST: Create a new session for the authenticated user
export async function POST(request: Request) {
  try {
    const newSession = await request.json();
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Find or create the Macro
    let { data: macro } = await supabase
      .from('macros')
      .select('id')
      .eq('name', newSession.macro)
      .eq('user_id', user.id)
      .single();

    if (!macro) {
      const { data: newMacro, error: macroError } = await supabase
        .from('macros')
        .insert({ name: newSession.macro, user_id: user.id })
        .select('id')
        .single();
      if (macroError) throw macroError;
      macro = newMacro;
    }

    // 2. Find or create the Subject
    let { data: subject } = await supabase
      .from('subjects')
      .select('id')
      .eq('name', newSession.subject)
      .eq('macro_id', macro!.id)
      .eq('user_id', user.id)
      .single();

    if (!subject) {
      const { data: newSubject, error: subjectError } = await supabase
        .from('subjects')
        .insert({ name: newSession.subject, macro_id: macro!.id, user_id: user.id })
        .select('id')
        .single();
      if (subjectError) throw subjectError;
      subject = newSubject;
    }

    // 3. Insert the Session
    const sessionData = {
      hours: newSession.hours,
      type: newSession.type,
      date: newSession.date,
      subject_id: subject!.id,
      user_id: user.id
    };

    const { data: session, error } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select(`
        id,
        hours,
        type,
        date,
        subject:subjects!inner(
          name,
          macro:macros!inner(
            name
          )
        )
      `)
      .single();

    if (error) throw error;

    // Flatten for the frontend
    const formattedSession = {
      id: session.id,
      hours: session.hours,
      type: session.type,
      date: session.date,
      subject: session.subject?.name,
      macro: session.subject?.macro?.name
    };

    return NextResponse.json({ success: true, session: formattedSession });
  } catch (error: any) {
    console.error("API POST Error:", error.message);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}

// DELETE: Delete a session
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API DELETE Error:", error.message);
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}