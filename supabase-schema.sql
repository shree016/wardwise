-- ============================================================
-- NammaMarg — Extended Civic Governance Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ============================================================
-- ALTER ISSUES TABLE — add new tracking columns
-- ============================================================
ALTER TABLE issues ADD COLUMN IF NOT EXISTS ticket_number TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS urgency_score INTEGER DEFAULT 5;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(12,2);
ALTER TABLE issues ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS contractor_assigned TEXT;

-- Auto-generate ticket numbers for existing and new issues
UPDATE issues
SET ticket_number = 'NMG-' || UPPER(SUBSTR(id::text, 1, 8))
WHERE ticket_number IS NULL;

-- ============================================================
-- CONTRACTORS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS contractors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  license_number TEXT,
  specializations TEXT[] DEFAULT '{}',
  reliability_score DECIMAL(3,1) DEFAULT 5.0 CHECK (reliability_score BETWEEN 0 AND 10),
  completed_projects INTEGER DEFAULT 0,
  ongoing_projects INTEGER DEFAULT 0,
  corruption_complaints_count INTEGER DEFAULT 0,
  average_quality_score DECIMAL(3,1) DEFAULT 5.0 CHECK (average_quality_score BETWEEN 0 AND 10),
  is_blacklisted BOOLEAN DEFAULT FALSE,
  blacklist_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TENDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS tenders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES contractors(id),
  tender_number TEXT UNIQUE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'awarded', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  estimated_cost DECIMAL(12,2),
  awarded_amount DECIMAL(12,2),
  released_amount DECIMAL(12,2) DEFAULT 0,
  estimated_days INTEGER,
  start_date DATE,
  expected_completion DATE,
  actual_completion DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WORK PROGRESS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS work_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  tender_id UUID REFERENCES tenders(id),
  update_type TEXT DEFAULT 'progress' CHECK (update_type IN ('start', 'progress', 'material', 'milestone', 'completion', 'delay')),
  description TEXT NOT NULL,
  photo_url TEXT,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  workers_count INTEGER,
  materials_used TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INSPECTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  tender_id UUID REFERENCES tenders(id),
  inspector_name TEXT NOT NULL,
  department TEXT DEFAULT 'BBMP Quality Control',
  inspection_date DATE DEFAULT CURRENT_DATE,
  quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 10),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reinspection_required')),
  inspection_photo_url TEXT,
  remarks TEXT,
  ai_verified BOOLEAN,
  ai_confidence DECIMAL(3,2),
  ai_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CORRUPTION COMPLAINTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS corruption_complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  tender_id UUID REFERENCES tenders(id),
  complaint_type TEXT CHECK (complaint_type IN ('fake_completion', 'bribery', 'poor_quality', 'material_mismatch', 'delayed_work', 'overcharging', 'other')),
  description TEXT NOT NULL,
  photo_url TEXT,
  complainant_name TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED CONTRACTORS
-- ============================================================
INSERT INTO contractors (name, company, email, phone, license_number, specializations, reliability_score, completed_projects, average_quality_score)
VALUES
  ('Rajesh Kumar',   'Karnataka Road Works Pvt Ltd',  'rajesh@krw.com',  '9876543210', 'KRW-2024-001', ARRAY['pothole','road_repair','road_crack'],          8.5, 45, 8.2),
  ('Suresh Gowda',   'BBMP Approved Contractors',     'suresh@bac.com',  '9876543211', 'BAC-2024-002', ARRAY['garbage_dump','drainage','sewage_overflow'],    7.2, 32, 7.0),
  ('Anita Sharma',   'BrightCity Infrastructure',     'anita@bci.com',   '9876543212', 'BCI-2024-003', ARRAY['broken_streetlight','electrical'],              9.1, 67, 9.3),
  ('Mohammed Ali',   'Ali Construction Co',           'ali@acc.com',     '9876543213', 'ACC-2024-004', ARRAY['waterlogging','sewage_overflow','drainage'],     6.8, 28, 6.5),
  ('Priya Nair',     'Green City Solutions',          'priya@gcs.com',   '9876543214', 'GCS-2024-005', ARRAY['garbage_dump','fallen_tree'],                   8.9, 53, 8.7),
  ('Vikram Singh',   'Horizon Civil Works',           'vikram@hcw.com',  '9876543215', 'HCW-2024-006', ARRAY['road_crack','pothole','waterlogging'],           7.8, 39, 7.6),
  ('Lakshmi Devi',   'Metro Maintenance Corp',        'lakshmi@mmc.com', '9876543216', 'MMC-2024-007', ARRAY['broken_streetlight','pothole'],                 8.2, 58, 8.0)
ON CONFLICT DO NOTHING;

-- ============================================================
-- HELPER: auto-set ticket_number on new issues
-- ============================================================
CREATE OR REPLACE FUNCTION set_issue_ticket()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := 'NMG-' || UPPER(SUBSTR(NEW.id::text, 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_ticket ON issues;
CREATE TRIGGER trigger_set_ticket
BEFORE INSERT ON issues
FOR EACH ROW EXECUTE FUNCTION set_issue_ticket();
