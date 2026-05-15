import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('corruption_complaints')
      .select('*')
      .eq('issue_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, complaints: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const { complaint_type, description, complainant_name, photo_url, tender_id } = await req.json();

    const { data, error } = await supabase
      .from('corruption_complaints')
      .insert([{ issue_id: id, tender_id, complaint_type, description, complainant_name, photo_url }])
      .select()
      .single();

    if (error) throw error;

    // If contractor is linked, increment their complaint count
    const { data: tender } = await supabase.from('tenders').select('contractor_id').eq('issue_id', id).maybeSingle();
    if (tender?.contractor_id) {
      try { await supabase.rpc('increment_contractor_complaints', { p_contractor_id: tender.contractor_id }); } catch (_e) { /* optional RPC */ }
    }

    return NextResponse.json({ success: true, complaint: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
