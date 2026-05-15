import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dfttgbhewvmiovqwzzgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdHRnYmhld3ZtaW92cXd6emdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzI3MTYsImV4cCI6MjA5NDM0ODcxNn0.6JNKHkaiQHDmeZim4QY5fFm0nAcQyzBoRmpMDoZ8Nrs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CONTRACTORS = [
  {
    name: 'Rajesh Kumar',
    company: 'Karnataka Road Works Pvt Ltd',
    email: 'rajesh@krw.com',
    phone: '9876543210',
    license_number: 'KRW-2024-001',
    specializations: ['pothole', 'road_repair', 'road_crack'],
    reliability_score: 8.5,
    completed_projects: 45,
    ongoing_projects: 3,
    average_quality_score: 8.2,
    corruption_complaints_count: 0,
    is_blacklisted: false,
  },
  {
    name: 'Suresh Gowda',
    company: 'BBMP Approved Contractors',
    email: 'suresh@bac.com',
    phone: '9876543211',
    license_number: 'BAC-2024-002',
    specializations: ['garbage_dump', 'drainage', 'sewage_overflow'],
    reliability_score: 7.2,
    completed_projects: 32,
    ongoing_projects: 2,
    average_quality_score: 7.0,
    corruption_complaints_count: 1,
    is_blacklisted: false,
  },
  {
    name: 'Anita Sharma',
    company: 'BrightCity Infrastructure',
    email: 'anita@bci.com',
    phone: '9876543212',
    license_number: 'BCI-2024-003',
    specializations: ['broken_streetlight', 'electrical'],
    reliability_score: 9.1,
    completed_projects: 67,
    ongoing_projects: 5,
    average_quality_score: 9.3,
    corruption_complaints_count: 0,
    is_blacklisted: false,
  },
  {
    name: 'Mohammed Ali',
    company: 'Ali Construction Co',
    email: 'ali@acc.com',
    phone: '9876543213',
    license_number: 'ACC-2024-004',
    specializations: ['waterlogging', 'sewage_overflow', 'drainage'],
    reliability_score: 6.8,
    completed_projects: 28,
    ongoing_projects: 1,
    average_quality_score: 6.5,
    corruption_complaints_count: 2,
    is_blacklisted: false,
  },
  {
    name: 'Priya Nair',
    company: 'Green City Solutions',
    email: 'priya@gcs.com',
    phone: '9876543214',
    license_number: 'GCS-2024-005',
    specializations: ['garbage_dump', 'fallen_tree'],
    reliability_score: 8.9,
    completed_projects: 53,
    ongoing_projects: 4,
    average_quality_score: 8.7,
    corruption_complaints_count: 0,
    is_blacklisted: false,
  },
  {
    name: 'Vikram Singh',
    company: 'Horizon Civil Works',
    email: 'vikram@hcw.com',
    phone: '9876543215',
    license_number: 'HCW-2024-006',
    specializations: ['road_crack', 'pothole', 'waterlogging'],
    reliability_score: 7.8,
    completed_projects: 39,
    ongoing_projects: 2,
    average_quality_score: 7.6,
    corruption_complaints_count: 1,
    is_blacklisted: false,
  },
  {
    name: 'Lakshmi Devi',
    company: 'Metro Maintenance Corp',
    email: 'lakshmi@mmc.com',
    phone: '9876543216',
    license_number: 'MMC-2024-007',
    specializations: ['broken_streetlight', 'pothole'],
    reliability_score: 8.2,
    completed_projects: 58,
    ongoing_projects: 3,
    average_quality_score: 8.0,
    corruption_complaints_count: 0,
    is_blacklisted: false,
  },
];

async function seed() {
  console.log('Checking contractors table...');

  const { data: existing, error: checkErr } = await supabase
    .from('contractors')
    .select('id')
    .limit(1);

  if (checkErr) {
    console.error('ERROR — contractors table not accessible:', checkErr.message);
    console.error('\nRun this SQL in your Supabase SQL Editor first:\n');
    console.error(`CREATE TABLE IF NOT EXISTS contractors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  license_number TEXT,
  specializations TEXT[] DEFAULT '{}',
  reliability_score DECIMAL(3,1) DEFAULT 5.0,
  completed_projects INTEGER DEFAULT 0,
  ongoing_projects INTEGER DEFAULT 0,
  corruption_complaints_count INTEGER DEFAULT 0,
  average_quality_score DECIMAL(3,1) DEFAULT 5.0,
  is_blacklisted BOOLEAN DEFAULT FALSE,
  blacklist_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`);
    process.exit(1);
  }

  if (existing && existing.length > 0) {
    console.log(`Table already has data (${existing.length}+ rows). Upserting to ensure all 7 contractors exist...`);
  }

  const { data, error } = await supabase
    .from('contractors')
    .upsert(CONTRACTORS, { onConflict: 'license_number' })
    .select('name, company');

  if (error) {
    console.error('Upsert failed:', error.message);
    // Try plain insert as fallback
    console.log('Trying plain insert...');
    const { data: insertData, error: insertError } = await supabase
      .from('contractors')
      .insert(CONTRACTORS)
      .select('name, company');

    if (insertError) {
      console.error('Insert also failed:', insertError.message);
      process.exit(1);
    }
    console.log('Inserted via plain insert:');
    insertData?.forEach(c => console.log(`  ✓ ${c.name} — ${c.company}`));
  } else {
    console.log('Seeded contractors:');
    data?.forEach(c => console.log(`  ✓ ${c.name} — ${c.company}`));
  }

  console.log('\nDone!');
}

seed();
