const express = require('express');
const router = express.Router();
const { classifyImage } = require('../utils/gemini');

// POST /api/classify
// Body: { image: "base64string", mimeType: "image/jpeg" }
router.post('/', async (req, res) => {
  try {
    const { image, mimeType } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const result = await classifyImage(image, mimeType || 'image/jpeg');

    res.json({
      success: true,
      classification: result
    });

  } catch (error) {
    console.error('Classification error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Classification failed',
      details: error.message 
    });
  }
});

module.exports = router;