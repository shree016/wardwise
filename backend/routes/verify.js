const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { verifyFix } = require('../utils/gemini');

// POST /api/verify/:id
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

    // Get before photo base64
    const beforeBase64 = issue.photo_url?.split(',')[1] || '';
    const afterBase64 = after_photo?.split(',')[1] || '';

    // AI comparison
    const aiResult = await verifyFix(beforeBase64, afterBase64);

    // Save verification
    await supabase.from('verifications').insert([{
      issue_id: id,
      verifier_name,
      photo_url: after_photo,
      ai_verified: aiResult.is_fixed,
      ai_confidence: aiResult.confidence,
      ai_reason: aiResult.reason,
    }]);

    // Update issue status if verified
    if (aiResult.is_fixed) {
      await supabase
        .from('issues')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString(),
          fixed_photo_url: after_photo,
        })
        .eq('id', id);
    }

    res.json({
      success: true,
      verified: aiResult.is_fixed,
      confidence: aiResult.confidence,
      reason: aiResult.reason,
    });

  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;