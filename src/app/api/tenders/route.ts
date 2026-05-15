import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('tenders')
      .select('*, contractors(*), issues(issue_type, ward_name, status, ticket_number)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, tenders: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      issue_id, contractor_id, estimated_cost, awarded_amount,
      estimated_days, description, start_date, expected_completion,
    } = await req.json();

    const tender_number = `TNR-${Date.now().toString().slice(-8)}`;
    const status = contractor_id ? 'awarded' : 'open';

    const { data: tender, error } = await supabase
      .from('tenders')
      .insert([{
        issue_id, contractor_id, tender_number, status,
        estimated_cost, awarded_amount, estimated_days,
        description, start_date, expected_completion,
      }])
      .select('*, contractors(*)')
      .single();

    if (error) throw error;

    // Update issue with contractor assignment
    const updatePayload: Record<string, any> = { assigned_at: new Date().toISOString() };
    if (tender.contractors) updatePayload.contractor_assigned = tender.contractors.name;

    await supabase.from('issues').update(updatePayload).eq('id', issue_id);

    return NextResponse.json({ success: true, tender });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
