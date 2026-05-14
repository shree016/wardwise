const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');

// GET all issues
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, issues: data });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single issue
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json({ success: true, issue: data });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create issue
router.post('/', async (req, res) => {
  try {
    const {
      issue_type,
      severity,
      severity_score,
      description,
      confidence,
      photo_url,
      latitude,
      longitude,
      ward_number,
      ward_name,
      reporter_name
    } = req.body;

    // Check for duplicate within 50 meters
    const { data: nearby } = await supabase
      .from('issues')
      .select('*')
      .eq('issue_type', issue_type)
      .eq('status', 'open')
      .gte('latitude', latitude - 0.0005)
      .lte('latitude', latitude + 0.0005)
      .gte('longitude', longitude - 0.0005)
      .lte('longitude', longitude + 0.0005);

    // If duplicate found, increment counter
    if (nearby && nearby.length > 0) {
      const existing = nearby[0];
      const { data, error } = await supabase
        .from('issues')
        .update({ reported_count: existing.reported_count + 1 })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ 
        success: true, 
        issue: data, 
        deduplicated: true,
        message: `This issue already reported ${data.reported_count} times`
      });
    }

    // Create new issue
    const { data, error } = await supabase
      .from('issues')
      .insert([{
        issue_type,
        severity,
        severity_score,
        description,
        confidence,
        photo_url,
        latitude,
        longitude,
        ward_number,
        ward_name,
        reporter_name
      }])
      .select()
      .single();

    if (error) throw error;

    // Update ward stats
    if (ward_number) {
      await supabase.rpc('increment_ward_issues', { 
        p_ward_number: ward_number 
      });
    }

    res.json({ success: true, issue: data, deduplicated: false });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH mark as fixed
router.patch('/:id/fix', async (req, res) => {
  try {
    const { fixed_photo_url } = req.body;

    const { data, error } = await supabase
      .from('issues')
      .update({ 
        status: 'fixed',
        fixed_photo_url,
        fixed_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, issue: data });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;