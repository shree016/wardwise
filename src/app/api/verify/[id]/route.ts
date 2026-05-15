import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getDistanceMeters } from '@/lib/supabase';
import { verifyFix } from '@/lib/gemini';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('verifications')
      .select('*')
      .eq('issue_id', id);

    if (error) throw error;
    return NextResponse.json({ success: true, verifications: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const { after_photo, verifier_name, verifier_lat, verifier_lng } = await req.json();

    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .select('*')
      .eq('id', id)
      .single();

    if (issueError) throw issueError;

    if (issue.status !== 'fixed') {
      return NextResponse.json({ success: false, error: 'Issue is not marked as fixed yet' }, { status: 400 });
    }

    // Geo-fence check — must be within 500 metres
    if (verifier_lat && verifier_lng) {
      const distance = getDistanceMeters(verifier_lat, verifier_lng, issue.latitude, issue.longitude);
      if (distance > 500) {
        return NextResponse.json(
          { success: false, too_far: true, distance: Math.round(distance), error: `You are ${Math.round(distance)}m away. Must be within 500m to verify.` },
          { status: 403 }
        );
      }
    }

    // AI comparison — before vs after
    const beforeBase64 = issue.photo_url?.split(',')[1] || '';
    const afterBase64 = after_photo?.split(',')[1] || '';
    const aiResult = await verifyFix(beforeBase64, afterBase64);

    await supabase.from('verifications').insert([{
      issue_id: id,
      verifier_name,
      photo_url: after_photo,
      ai_verified: aiResult.is_fixed,
      ai_confidence: aiResult.confidence,
      ai_reason: aiResult.reason,
      verdict: aiResult.is_fixed ? 'fixed' : 'not_fixed',
    }]);

    if (!aiResult.is_fixed) {
      await supabase.from('issues').update({ status: 'open', verification_count: 0 }).eq('id', id);
      return NextResponse.json({ success: true, verified: false, reopened: true, confidence: aiResult.confidence, reason: aiResult.reason, message: 'Fix rejected — issue reopened' });
    }

    const newCount = (issue.verification_count || 0) + 1;
    const needed = issue.verification_needed || 2;

    if (newCount >= needed) {
      await supabase.from('issues').update({ status: 'verified', verification_count: newCount, verified_at: new Date().toISOString(), fixed_photo_url: after_photo }).eq('id', id);
      return NextResponse.json({ success: true, verified: true, fully_verified: true, confidence: aiResult.confidence, reason: aiResult.reason, message: `✅ Issue fully verified by ${newCount} citizens!` });
    }

    await supabase.from('issues').update({ verification_count: newCount }).eq('id', id);
    return NextResponse.json({ success: true, verified: true, fully_verified: false, verification_count: newCount, verification_needed: needed, confidence: aiResult.confidence, reason: aiResult.reason, message: `✅ Your verification recorded! Need ${needed - newCount} more citizen(s) to confirm.` });

  } catch (error: any) {
    console.error('Verify error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
