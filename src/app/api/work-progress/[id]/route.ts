import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('work_progress')
      .select('*')
      .eq('issue_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, progress: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const { tender_id, update_type, description, photo_url, progress_percentage, workers_count, materials_used, uploaded_by } = await req.json();

    const { data, error } = await supabase
      .from('work_progress')
      .insert([{ issue_id: id, tender_id, update_type, description, photo_url, progress_percentage, workers_count, materials_used, uploaded_by }])
      .select()
      .single();

    if (error) throw error;

    // Update issue progress percentage
    await supabase.from('issues').update({ progress_percentage }).eq('id', id);

    return NextResponse.json({ success: true, update: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
