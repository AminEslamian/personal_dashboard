import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET: Fetch all sessions for the authenticated user
export async function GET() {
  try {
    const supabase = await createClient();
    
    // RLS policies ensure that we only get sessions belonging to the authenticated user
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(sessions);
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
    
    // Remove client-generated ID since Supabase uses a generated identity column
    const { id, ...sessionData } = newSession;

    const { data, error } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, session: data });
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
    
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API DELETE Error:", error.message);
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}