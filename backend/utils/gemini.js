const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
async function classifyImage(base64Image, mimeType = 'image/jpeg') {
  const prompt = `Analyze this image and respond ONLY with a valid JSON object, no extra text:
  {
    "is_civic_issue": true or false,
    "issue_type": "pothole OR garbage_dump OR broken_streetlight OR other",
    "severity": "low OR medium OR high",
    "severity_score": number between 1-10,
    "description": "one line description of the issue",
    "confidence": number between 0-1
  }`;

  try {
    const response = await axios.post(GEMINI_URL, {
      contents: [{
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Image
            }
          },
          { text: prompt }
        ]
      }]
    });

    const rawText = response.data.candidates[0].content.parts[0].text;
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);

  } catch (error) {
    // Show full Gemini error
    console.error('Full Gemini error:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
}

async function verifyFix(beforeBase64, afterBase64) {
  const prompt = `Compare these two images of a civic issue (before and after repair).
  Respond ONLY with valid JSON:
  {
    "is_fixed": true or false,
    "confidence": number between 0-1,
    "reason": "one line explanation"
  }`;

  const response = await axios.post(GEMINI_URL, {
    contents: [{
      parts: [
        {
          inline_data: {
            mime_type: 'image/jpeg',
            data: beforeBase64
          }
        },
        {
          inline_data: {
            mime_type: 'image/jpeg',
            data: afterBase64
          }
        },
        { text: prompt }
      ]
    }]
  });

  const rawText = response.data.candidates[0].content.parts[0].text;
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { classifyImage, verifyFix };