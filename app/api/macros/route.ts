import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: macros, error } = await supabase
      .from('macros')
      .select('id, name, color, is_archived')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json(macros);
  } catch (error: any) {
    console.error("API GET Macros Error:", error.message);
    return NextResponse.json({ error: 'Failed to read macros' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, color } = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: newMacro, error } = await supabase
      .from('macros')
      .insert({ name, color, user_id: user.id })
      .select('id, name, color, is_archived')
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, macro: newMacro });
  } catch (error: any) {
    console.error("API POST Macros Error:", error.message);
    return NextResponse.json({ error: 'Failed to save macro' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, color, is_archived } = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (is_archived !== undefined) updateData.is_archived = is_archived;

    const { data: updatedMacro, error } = await supabase
      .from('macros')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, name, color, is_archived')
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, macro: updatedMacro });
  } catch (error: any) {
    console.error("API PUT Macros Error:", error.message);
    return NextResponse.json({ error: 'Failed to update macro' }, { status: 500 });
  }
}
