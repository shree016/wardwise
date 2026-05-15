-- Run this in: supabase.com → your project → SQL Editor → New query
-- Drops the old broken table and recreates it with the correct schema + seed data.

DROP TABLE IF EXISTS wards;

CREATE TABLE wards (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number     INTEGER UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  area_sqkm  DECIMAL(7,2),
  population INTEGER,
  center_lat DECIMAL(10,7),
  center_lng DECIMAL(10,7),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO wards (number, name, area_sqkm, population, center_lat, center_lng) VALUES
  (1,  'Koramangala',   6.20,  150000, 12.9352, 77.6245),
  (2,  'Indiranagar',   4.80,   95000, 12.9784, 77.6408),
  (3,  'JP Nagar',      8.50,  120000, 12.9074, 77.5930),
  (4,  'Jayanagar',     7.10,  115000, 12.9250, 77.5938),
  (5,  'Whitefield',   32.00,  220000, 12.9698, 77.7500),
  (6,  'Hebbal',        9.20,   85000, 13.0358, 77.5970),
  (7,  'Marathahalli',  6.80,  180000, 12.9591, 77.6974),
  (8,  'BTM Layout',    5.60,  130000, 12.9167, 77.6101),
  (9,  'HSR Layout',    7.30,  145000, 12.9116, 77.6389),
  (10, 'Banashankari',  8.90,  110000, 12.9204, 77.5666);
