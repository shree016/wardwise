import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dfttgbhewvmiovqwzzgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdHRnYmhld3ZtaW92cXd6emdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzI3MTYsImV4cCI6MjA5NDM0ODcxNn0.6JNKHkaiQHDmeZim4QY5fFm0nAcQyzBoRmpMDoZ8Nrs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const WARDS = [
  { number: 1,  name: 'Koramangala',  area_sqkm: 6.20,  population: 150000, center_lat: 12.9352, center_lng: 77.6245 },
  { number: 2,  name: 'Indiranagar',  area_sqkm: 4.80,  population:  95000, center_lat: 12.9784, center_lng: 77.6408 },
  { number: 3,  name: 'JP Nagar',     area_sqkm: 8.50,  population: 120000, center_lat: 12.9074, center_lng: 77.5930 },
  { number: 4,  name: 'Jayanagar',    area_sqkm: 7.10,  population: 115000, center_lat: 12.9250, center_lng: 77.5938 },
  { number: 5,  name: 'Whitefield',   area_sqkm: 32.00, population: 220000, center_lat: 12.9698, center_lng: 77.7500 },
  { number: 6,  name: 'Hebbal',       area_sqkm: 9.20,  population:  85000, center_lat: 13.0358, center_lng: 77.5970 },
  { number: 7,  name: 'Marathahalli', area_sqkm: 6.80,  population: 180000, center_lat: 12.9591, center_lng: 77.6974 },
  { number: 8,  name: 'BTM Layout',   area_sqkm: 5.60,  population: 130000, center_lat: 12.9167, center_lng: 77.6101 },
  { number: 9,  name: 'HSR Layout',   area_sqkm: 7.30,  population: 145000, center_lat: 12.9116, center_lng: 77.6389 },
  { number: 10, name: 'Banashankari', area_sqkm: 8.90,  population: 110000, center_lat: 12.9204, center_lng: 77.5666 },
];

async function seed() {
  console.log('Checking wards table...');

  // Check if table exists by doing a select
  const { data: existing, error: checkErr } = await supabase
    .from('wards')
    .select('number')
    .limit(1);

  if (checkErr) {
    console.error('ERROR — wards table does not exist or is not accessible.');
    console.error('Please run the CREATE TABLE block from supabase-schema.sql first in your Supabase SQL Editor:');
    console.error('');
    console.error(`CREATE TABLE IF NOT EXISTS wards (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number     INTEGER UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  area_sqkm  DECIMAL(7,2),
  population INTEGER,
  center_lat DECIMAL(10,7),
  center_lng DECIMAL(10,7),
  created_at TIMESTAMPTZ DEFAULT NOW()
);`);
    process.exit(1);
  }

  console.log(`Table exists. Currently has ${existing?.length ?? 0} row(s) visible.`);
  console.log('Upserting 10 wards...');

  const { data, error } = await supabase
    .from('wards')
    .upsert(WARDS, { onConflict: 'number' })
    .select('number, name');

  if (error) {
    console.error('Upsert failed:', error.message);
    process.exit(1);
  }

  console.log('Seeded wards:');
  data?.forEach(w => console.log(`  ${w.number}. ${w.name}`));
  console.log('Done!');
}

seed();
