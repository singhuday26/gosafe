-- GoSafe Database Schema - PostgreSQL/Supabase
-- This file defines the COMPLETE database structure for the GoSafe system
-- 
-- CURRENT STATE (as of deployment):
-- ✅ Deployed Tables: profiles, digital_tourist_ids, sos_alerts, tourist_locations, geo_fences, ai_chat_sessions, ai_chat_messages
-- ❌ Missing Tables: missing_persons, case_updates, tourist_clusters, risk_zones
-- ✅ Deployed Functions: generate_blockchain_hash, cleanup_old_chat_sessions, get_or_create_chat_session, get_user_role, has_role
-- ❌ Missing Functions: generate_case_number, update_tourist_clusters
--
-- IMPORTANT: Backend code has been adapted to work with CURRENT state, not ideal schema
-- To deploy missing tables, run the SQL below in your Supabase SQL Editor

-- Users/Profiles table (✅ DEPLOYED - but with different structure)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  user_role TEXT CHECK (user_role IN ('tourist', 'authority', 'admin')) DEFAULT 'tourist',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Digital Tourist IDs
CREATE TABLE IF NOT EXISTS digital_tourist_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_name TEXT NOT NULL,
  aadhaar_number TEXT UNIQUE NOT NULL,
  passport_number TEXT,
  trip_itinerary TEXT NOT NULL,
  emergency_contacts JSONB NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
  blockchain_hash TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('active', 'expired', 'revoked')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SOS Alerts
CREATE TABLE IF NOT EXISTS sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id UUID REFERENCES digital_tourist_ids(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  alert_type TEXT CHECK (alert_type IN ('panic', 'medical', 'security', 'other')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'responded', 'resolved')) DEFAULT 'active',
  message TEXT,
  blockchain_hash TEXT UNIQUE NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tourist Routes (planned itineraries)
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id UUID REFERENCES digital_tourist_ids(id) ON DELETE CASCADE,
  route_name TEXT NOT NULL,
  planned_waypoints JSONB NOT NULL, -- Array of {lat, lng, name, estimated_time} objects
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('planned', 'active', 'completed', 'cancelled')) DEFAULT 'planned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Tourist Locations (for anomaly detection)
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id UUID REFERENCES digital_tourist_ids(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy_meters INTEGER,
  speed_kmh DECIMAL(5, 2),
  heading DECIMAL(5, 2),
  altitude_meters DECIMAL(7, 2),
  battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
  network_type TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anomalies Detection Table
CREATE TABLE IF NOT EXISTS anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id UUID REFERENCES digital_tourist_ids(id) ON DELETE CASCADE,
  anomaly_type TEXT CHECK (anomaly_type IN ('sudden_drop_off', 'prolonged_inactivity', 'route_deviation', 'silent_distress', 'risk_zone_entry')) NOT NULL,
  severity_score INTEGER CHECK (severity_score >= 0 AND severity_score <= 100) NOT NULL,
  severity_level TEXT CHECK (severity_level IN ('low', 'medium', 'high', 'critical')) NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  details JSONB NOT NULL, -- {distance_km, time_gap_minutes, risk_factors, etc.}
  status TEXT CHECK (status IN ('detected', 'investigating', 'resolved', 'false_positive')) DEFAULT 'detected',
  notified_contacts BOOLEAN DEFAULT FALSE,
  escalated_to_sos BOOLEAN DEFAULT FALSE,
  assigned_officer_id UUID REFERENCES profiles(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Geo-fences
CREATE TABLE IF NOT EXISTS geo_fences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('safe', 'restricted', 'danger')) NOT NULL,
  coordinates JSONB NOT NULL, -- Array of lat/lng points
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Police Dashboard Tables

-- Missing Persons Cases
CREATE TABLE IF NOT EXISTS missing_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id UUID REFERENCES digital_tourist_ids(id) ON DELETE CASCADE,
  reported_by_user_id UUID REFERENCES profiles(id),
  case_number TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('active', 'investigating', 'found', 'closed')) DEFAULT 'active',
  last_known_location JSONB NOT NULL, -- {lat, lng, address, timestamp}
  last_contact_time TIMESTAMP WITH TIME ZONE NOT NULL,
  missing_since TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  circumstances TEXT,
  physical_description TEXT,
  clothing_description TEXT,
  personal_belongings TEXT,
  emergency_contacts JSONB NOT NULL,
  assigned_officer_id UUID REFERENCES profiles(id),
  priority_level TEXT CHECK (priority_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  efir_generated BOOLEAN DEFAULT FALSE,
  efir_number TEXT,
  efir_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Case Updates/Investigation Progress
CREATE TABLE IF NOT EXISTS case_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  missing_person_case_id UUID REFERENCES missing_persons(id) ON DELETE CASCADE,
  updated_by_user_id UUID REFERENCES profiles(id),
  update_type TEXT CHECK (update_type IN ('investigation', 'sighting', 'evidence', 'contact', 'status_change')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location JSONB, -- {lat, lng, address} if applicable
  evidence_files TEXT, -- JSON array of file URLs as TEXT
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tourist Clusters (for heat maps)
CREATE TABLE IF NOT EXISTS tourist_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_name TEXT NOT NULL,
  center_lat DECIMAL(10, 8) NOT NULL,
  center_lng DECIMAL(11, 8) NOT NULL,
  radius_meters INTEGER NOT NULL,
  tourist_count INTEGER NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
  cluster_date DATE NOT NULL,
  hourly_data JSONB, -- Hourly tourist counts
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk Zones Management
CREATE TABLE IF NOT EXISTS risk_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  coordinates JSONB NOT NULL, -- Array of lat/lng points for polygon
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) NOT NULL,
  risk_factors TEXT NOT NULL, -- JSON array of risk factor descriptions as TEXT
  incident_count INTEGER DEFAULT 0,
  last_incident_date TIMESTAMP WITH TIME ZONE,
  recommendations TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat/AI Tables
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  session_type TEXT CHECK (session_type IN ('tourist_help', 'emergency_support', 'general_info')) DEFAULT 'general_info',
  language_code TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  message_type TEXT CHECK (message_type IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB, -- Additional message data
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Helpful functions for backend operations

-- Generate case number for missing persons
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TEXT AS $$
DECLARE
  year_suffix TEXT;
  case_count INTEGER;
  case_number TEXT;
BEGIN
  year_suffix := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COUNT(*) + 1 INTO case_count
  FROM missing_persons
  WHERE TO_CHAR(created_at, 'YYYY') = TO_CHAR(NOW(), 'YYYY');
  
  case_number := 'MP' || year_suffix || LPAD(case_count::TEXT, 4, '0');
  
  RETURN case_number;
END;
$$ LANGUAGE plpgsql;

-- Generate blockchain hash
CREATE OR REPLACE FUNCTION generate_blockchain_hash(input_data TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(input_data || NOW()::TEXT || random()::TEXT, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Update tourist clusters (for real-time heat maps)
CREATE OR REPLACE FUNCTION update_tourist_clusters()
RETURNS VOID AS $$
DECLARE
  cluster_radius CONSTANT INTEGER := 1000; -- 1km radius
  current_date DATE := CURRENT_DATE;
BEGIN
  -- Clear existing clusters for today
  DELETE FROM tourist_clusters WHERE cluster_date = current_date;
  
  -- Generate new clusters based on current tourist locations
  INSERT INTO tourist_clusters (area_name, center_lat, center_lng, radius_meters, tourist_count, cluster_date, risk_level)
  SELECT 
    'Cluster_' || ROW_NUMBER() OVER() AS area_name,
    AVG(tl.latitude) AS center_lat,
    AVG(tl.longitude) AS center_lng,
    cluster_radius AS radius_meters,
    COUNT(DISTINCT tl.tourist_id) AS tourist_count,
    current_date AS cluster_date,
    CASE 
      WHEN COUNT(DISTINCT tl.tourist_id) > 50 THEN 'high'
      WHEN COUNT(DISTINCT tl.tourist_id) > 20 THEN 'medium'
      ELSE 'low'
    END AS risk_level
  FROM tourist_locations tl
  INNER JOIN digital_tourist_ids dti ON tl.tourist_id = dti.id
  WHERE DATE(tl.timestamp) = current_date
    AND dti.status = 'active'
  GROUP BY 
    -- Simple clustering by rounding coordinates
    ROUND(tl.latitude::NUMERIC, 3),
    ROUND(tl.longitude::NUMERIC, 3)
  HAVING COUNT(DISTINCT tl.tourist_id) >= 3; -- Minimum 3 tourists for a cluster
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_tourist_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourist_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_fences ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE missing_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourist_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_zones ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Basic examples - customize based on your auth requirements)

-- Profiles: Users can view their own profile, authorities can view all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Authorities can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('authority', 'admin')
    )
  );

-- Digital IDs: Tourists see own, authorities see all
CREATE POLICY "Tourists can view own digital ID" ON digital_tourist_ids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role = 'tourist'
    )
  );

CREATE POLICY "Authorities can view all digital IDs" ON digital_tourist_ids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('authority', 'admin')
    )
  );

-- SOS Alerts: Tourists can create/view own, authorities can view/update all
CREATE POLICY "Tourists can manage own alerts" ON sos_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM digital_tourist_ids dti
      JOIN profiles p ON p.id = auth.uid()
      WHERE dti.id = tourist_id 
      AND p.user_role = 'tourist'
    )
  );

CREATE POLICY "Authorities can manage all alerts" ON sos_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('authority', 'admin')
    )
  );