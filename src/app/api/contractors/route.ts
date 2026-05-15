import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('contractors')
      .select('*')
      .eq('is_blacklisted', false)
      .order('reliability_score', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, contractors: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
