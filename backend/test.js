const fs = require('fs');
const axios = require('axios');
const supabase = require('./utils/supabase');
require('dotenv').config();

async function fullFlowTest() {
  console.log('🚀 Testing full flow...\n');

  // Step 1 - Classify image
  console.log('Step 1: Classifying image...');
  const imageBuffer = fs.readFileSync('./pothole.jpg');
  const base64Image = imageBuffer.toString('base64');

  const classifyResponse = await axios.post('http://localhost:5000/api/classify', {
    image: base64Image,
    mimeType: 'image/jpeg'
  });

  const classification = classifyResponse.data.classification;
  console.log('✅ Classification done:', classification.issue_type, '|', classification.severity);

  // Step 2 - Save to database
  console.log('\nStep 2: Saving to database...');
  const { data, error } = await supabase
    .from('issues')
    .insert([{
      issue_type: classification.issue_type,
      severity: classification.severity,
      severity_score: classification.severity_score,
      description: classification.description,
      confidence: classification.confidence,
      latitude: 12.9352,
      longitude: 77.6245,
      ward_number: 1,
      ward_name: 'Koramangala',
      reporter_name: 'Test User'
    }])
    .select()
    .single();

  if (error) {
    console.error('❌ DB Error:', error.message);
    return;
  }

  console.log('✅ Saved to database!');
  console.log('\n📋 Full Issue Record:');
  console.log('ID:', data.id);
  console.log('Type:', data.issue_type);
  console.log('Severity:', data.severity, '(' + data.severity_score + '/10)');
  console.log('Description:', data.description);
  console.log('Location:', data.latitude, data.longitude);
  console.log('Ward:', data.ward_name);
  console.log('Status:', data.status);
  console.log('Reported at:', data.created_at);
}

fullFlowTest();