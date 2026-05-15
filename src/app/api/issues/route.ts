import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, issues: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      issue_type, severity, severity_score, description, confidence,
      photo_url, latitude, longitude, ward_number, ward_name, reporter_name
    } = await req.json();

    // Check for duplicate within ~50 metres
    const { data: nearby } = await supabase
      .from('issues')
      .select('*')
      .eq('issue_type', issue_type)
      .eq('status', 'open')
      .gte('latitude', latitude - 0.0005)
      .lte('latitude', latitude + 0.0005)
      .gte('longitude', longitude - 0.0005)
      .lte('longitude', longitude + 0.0005);

    if (nearby && nearby.length > 0) {
      const existing = nearby[0];
      const { data, error } = await supabase
        .from('issues')
        .update({ reported_count: existing.reported_count + 1 })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({
        success: true,
        issue: data,
        deduplicated: true,
        message: `This issue already reported ${data.reported_count} times`,
      });
    }

    const { data, error } = await supabase
      .from('issues')
      .insert([{ issue_type, severity, severity_score, description, confidence, photo_url, latitude, longitude, ward_number, ward_name, reporter_name }])
      .select()
      .single();

    if (error) throw error;

    if (ward_number) {
      await supabase.rpc('increment_ward_issues', { p_ward_number: ward_number });
    }

    return NextResponse.json({ success: true, issue: data, deduplicated: false });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
