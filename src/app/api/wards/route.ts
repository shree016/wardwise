import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('wards')
      .select('id, number, name, area_sqkm, population, center_lat, center_lng')
      .order('number', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, wards: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
