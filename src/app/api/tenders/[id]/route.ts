import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('tenders')
      .select('*, contractors(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, tender: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const body = await req.json();

    const { data, error } = await supabase
      .from('tenders')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, contractors(*)')
      .single();

    if (error) throw error;

    // Sync issue status if tender status changes
    if (body.status === 'in_progress') {
      await supabase.from('issues').update({ progress_percentage: 10 }).eq('id', data.issue_id);
    }
    if (body.status === 'completed') {
      await supabase.from('issues').update({ status: 'fixed', fixed_at: new Date().toISOString(), progress_percentage: 100 }).eq('id', data.issue_id);
    }

    return NextResponse.json({ success: true, tender: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
