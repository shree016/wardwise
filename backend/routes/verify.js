const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { verifyFix } = require('../utils/gemini');

// Calculate distance between two coordinates in meters
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GET verifications for an issue
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('verifications')
      .select('*')
      .eq('issue_id', id);

    if (error) throw error;
    res.json({ success: true, verifications: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST citizen verification
router.post('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { after_photo, verifier_name } = req.body;

    // Get original issue
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .select('*')
      .eq('id', id)
      .single();

    if (issueError) throw issueError;

    // Check issue is in fixed status
    if (issue.status !== 'fixed') {
      return res.status(400).json({
        success: false,
        error: 'Issue is not marked as fixed yet'
      });
    }

// Geo-fence check — verifier must be within 500 meters
const { verifier_lat, verifier_lng } = req.body;

if (verifier_lat && verifier_lng) {
  const distance = getDistanceMeters(
    verifier_lat,
    verifier_lng,
    issue.latitude,
    issue.longitude
  );

  console.log(`Verifier distance from issue: ${Math.round(distance)}m`);

  if (distance > 500) {
    return res.status(403).json({
      success: false,
      too_far: true,
      distance: Math.round(distance),
      error: `You are ${Math.round(distance)}m away. Must be within 500m to verify.`
    });
  }
}

    // AI comparison - before vs after
    const beforeBase64 = issue.photo_url?.split(',')[1] || '';
    const afterBase64 = after_photo?.split(',')[1] || '';
    const aiResult = await verifyFix(beforeBase64, afterBase64);

    // Save this verification
    await supabase.from('verifications').insert([{
      issue_id: id,
      verifier_name,
      photo_url: after_photo,
      ai_verified: aiResult.is_fixed,
      ai_confidence: aiResult.confidence,
      ai_reason: aiResult.reason,
      verdict: aiResult.is_fixed ? 'fixed' : 'not_fixed'
    }]);

    // If AI says NOT fixed → reopen issue immediately
    if (!aiResult.is_fixed) {
      await supabase
        .from('issues')
        .update({ status: 'open', verification_count: 0 })
        .eq('id', id);

      return res.json({
        success: true,
        verified: false,
        reopened: true,
        confidence: aiResult.confidence,
        reason: aiResult.reason,
        message: 'Fix rejected — issue reopened'
      });
    }

    // AI says fixed → increment verification count
    const newCount = (issue.verification_count || 0) + 1;
    const needed = issue.verification_needed || 2;

    if (newCount >= needed) {
      // Both citizens verified → mark as fully verified
      await supabase
        .from('issues')
        .update({
          status: 'verified',
          verification_count: newCount,
          verified_at: new Date().toISOString(),
          fixed_photo_url: after_photo,
        })
        .eq('id', id);

      return res.json({
        success: true,
        verified: true,
        fully_verified: true,
        confidence: aiResult.confidence,
        reason: aiResult.reason,
        message: `✅ Issue fully verified by ${newCount} citizens!`
      });
    } else {
      // First citizen verified — need one more
      await supabase
        .from('issues')
        .update({ verification_count: newCount })
        .eq('id', id);

      return res.json({
        success: true,
        verified: true,
        fully_verified: false,
        verification_count: newCount,
        verification_needed: needed,
        confidence: aiResult.confidence,
        reason: aiResult.reason,
        message: `✅ Your verification recorded! Need ${needed - newCount} more citizen(s) to confirm.`
      });
    }

  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;