import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const [issueRes, tenderRes, progressRes, verificationsRes, inspectionsRes, complaintsRes] = await Promise.all([
      supabase.from('issues').select('*').eq('id', id).single(),
      supabase.from('tenders').select('*, contractors(*)').eq('issue_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('work_progress').select('*').eq('issue_id', id).order('created_at', { ascending: true }),
      supabase.from('verifications').select('*').eq('issue_id', id).order('created_at', { ascending: false }),
      supabase.from('inspections').select('*').eq('issue_id', id).order('created_at', { ascending: false }),
      supabase.from('corruption_complaints').select('*').eq('issue_id', id).order('created_at', { ascending: false }),
    ]);

    if (issueRes.error) throw issueRes.error;

    return NextResponse.json({
      success: true,
      issue: issueRes.data,
      tender: tenderRes.data || null,
      work_progress: progressRes.data || [],
      verifications: verificationsRes.data || [],
      inspections: inspectionsRes.data || [],
      corruption_complaints: complaintsRes.data || [],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
