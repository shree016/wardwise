import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { verifyFix } from '@/lib/gemini';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('issue_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, inspections: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const { tender_id, inspector_name, department, quality_score, remarks, inspection_photo_url, run_ai } = await req.json();

    let ai_verified = null;
    let ai_confidence = null;
    let ai_reason = null;

    // Run AI comparison if before/after photos exist and requested
    if (run_ai && inspection_photo_url) {
      const { data: issue } = await supabase.from('issues').select('photo_url').eq('id', id).single();
      if (issue?.photo_url) {
        try {
          const beforeBase64 = issue.photo_url.split(',')[1] || '';
          const afterBase64 = inspection_photo_url.split(',')[1] || '';
          const aiResult = await verifyFix(beforeBase64, afterBase64);
          ai_verified = aiResult.is_fixed;
          ai_confidence = aiResult.confidence;
          ai_reason = aiResult.reason;
        } catch (_e) { /* AI optional */ }
      }
    }

    const status = quality_score >= 7 ? 'approved' : quality_score >= 5 ? 'pending' : 'rejected';

    const { data, error } = await supabase
      .from('inspections')
      .insert([{ issue_id: id, tender_id, inspector_name, department, quality_score, remarks, inspection_photo_url, status, ai_verified, ai_confidence, ai_reason }])
      .select()
      .single();

    if (error) throw error;

    // If rejected, hold payment and reopen issue
    if (status === 'rejected') {
      await supabase.from('issues').update({ status: 'open', verification_count: 0 }).eq('id', id);
      if (tender_id) await supabase.from('tenders').update({ status: 'on_hold' }).eq('id', tender_id);
    }

    return NextResponse.json({ success: true, inspection: data, status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
