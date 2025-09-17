-- Create missing persons table for E-FIR generation
CREATE TABLE public.missing_persons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tourist_id UUID NOT NULL REFERENCES public.digital_tourist_ids(id),
  reported_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  case_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'found', 'closed')),
  last_known_location JSONB NOT NULL, -- {lat, lng, address, timestamp}
  last_contact_time TIMESTAMP WITH TIME ZONE NOT NULL,
  missing_since TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  circumstances TEXT,
  physical_description TEXT,
  clothing_description TEXT,
  personal_belongings TEXT,
  emergency_contacts JSONB NOT NULL,
  assigned_officer_id UUID REFERENCES auth.users(id),
  priority_level TEXT NOT NULL DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
  efir_generated BOOLEAN NOT NULL DEFAULT false,
  efir_number TEXT,
  efir_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case updates table for tracking investigation progress
CREATE TABLE public.case_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  missing_person_case_id UUID NOT NULL REFERENCES public.missing_persons(id),
  updated_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  update_type TEXT NOT NULL CHECK (update_type IN ('investigation', 'sighting', 'evidence', 'contact', 'status_change')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location JSONB, -- {lat, lng, address} if applicable
  evidence_files JSONB, -- Array of file URLs/references
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tourist clusters table for heat map analysis
CREATE TABLE public.tourist_clusters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area_name TEXT NOT NULL,
  center_lat DECIMAL(10, 8) NOT NULL,
  center_lng DECIMAL(11, 8) NOT NULL,
  radius_meters INTEGER NOT NULL,
  tourist_count INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  cluster_date DATE NOT NULL DEFAULT CURRENT_DATE,
  hourly_data JSONB NOT NULL DEFAULT '{}', -- {hour: count} for 24-hour tracking
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create risk zones table for heat map visualization
CREATE TABLE public.risk_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  coordinates JSONB NOT NULL, -- Polygon coordinates
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_factors JSONB NOT NULL, -- Array of risk factors
  incident_count INTEGER NOT NULL DEFAULT 0,
  last_incident_date TIMESTAMP WITH TIME ZONE,
  recommendations TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.missing_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourist_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_zones ENABLE ROW LEVEL SECURITY;

-- Policies for missing_persons
CREATE POLICY "Authorities and admins can view missing persons"
ON public.missing_persons
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role IN ('authority', 'admin')
  )
);

CREATE POLICY "Authorities and admins can create missing person cases"
ON public.missing_persons
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role IN ('authority', 'admin')
  )
);

CREATE POLICY "Authorities and admins can update missing person cases"
ON public.missing_persons
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role IN ('authority', 'admin')
  )
);

-- Policies for case_updates
CREATE POLICY "Authorities and admins can view case updates"
ON public.case_updates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role IN ('authority', 'admin')
  )
);

CREATE POLICY "Authorities and admins can create case updates"
ON public.case_updates
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role IN ('authority', 'admin')
  )
);

-- Policies for tourist_clusters (read-only for authorities/admins)
CREATE POLICY "Authorities and admins can view tourist clusters"
ON public.tourist_clusters
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role IN ('authority', 'admin')
  )
);

-- Policies for risk_zones
CREATE POLICY "Authorities and admins can manage risk zones"
ON public.risk_zones
FOR ALL
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role IN ('authority', 'admin')
  )
);

-- Add triggers for timestamp updates
CREATE TRIGGER update_missing_persons_updated_at
BEFORE UPDATE ON public.missing_persons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_risk_zones_updated_at
BEFORE UPDATE ON public.risk_zones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate case number
CREATE OR REPLACE FUNCTION public.generate_case_number()
RETURNS TEXT AS $$
DECLARE
  year_suffix TEXT;
  sequence_num INTEGER;
  case_number TEXT;
BEGIN
  year_suffix := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Get next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM 'MP' || year_suffix || '-(\d+)') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.missing_persons
  WHERE case_number LIKE 'MP' || year_suffix || '-%';
  
  case_number := 'MP' || year_suffix || '-' || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN case_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-generate E-FIR data
CREATE OR REPLACE FUNCTION public.generate_efir_data(missing_person_id UUID)
RETURNS JSONB AS $$
DECLARE
  mp_record public.missing_persons%ROWTYPE;
  tourist_record public.digital_tourist_ids%ROWTYPE;
  efir_data JSONB;
BEGIN
  -- Get missing person and tourist records
  SELECT * INTO mp_record FROM public.missing_persons WHERE id = missing_person_id;
  SELECT * INTO tourist_record FROM public.digital_tourist_ids WHERE id = mp_record.tourist_id;
  
  -- Generate E-FIR data structure
  efir_data := jsonb_build_object(
    'case_number', mp_record.case_number,
    'efir_number', 'EFIR-' || mp_record.case_number,
    'registration_date', CURRENT_DATE,
    'registration_time', CURRENT_TIME,
    'missing_person_details', jsonb_build_object(
      'name', tourist_record.tourist_name,
      'aadhaar_number', tourist_record.aadhaar_number,
      'passport_number', tourist_record.passport_number,
      'physical_description', mp_record.physical_description,
      'clothing_description', mp_record.clothing_description,
      'personal_belongings', mp_record.personal_belongings
    ),
    'incident_details', jsonb_build_object(
      'missing_since', mp_record.missing_since,
      'last_contact_time', mp_record.last_contact_time,
      'last_known_location', mp_record.last_known_location,
      'circumstances', mp_record.circumstances,
      'description', mp_record.description
    ),
    'investigation_details', jsonb_build_object(
      'priority_level', mp_record.priority_level,
      'assigned_officer_id', mp_record.assigned_officer_id,
      'status', mp_record.status
    ),
    'contact_details', jsonb_build_object(
      'emergency_contacts', mp_record.emergency_contacts,
      'tourist_emergency_contacts', tourist_record.emergency_contacts
    ),
    'generated_at', NOW(),
    'generated_by_system', true
  );
  
  RETURN efir_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update tourist clusters based on current locations
CREATE OR REPLACE FUNCTION public.update_tourist_clusters()
RETURNS VOID AS $$
DECLARE
  cluster_record RECORD;
BEGIN
  -- Clear existing clusters for today
  DELETE FROM public.tourist_clusters WHERE cluster_date = CURRENT_DATE;
  
  -- Generate clusters based on current tourist locations
  INSERT INTO public.tourist_clusters (
    area_name, center_lat, center_lng, radius_meters, tourist_count, cluster_date, hourly_data
  )
  SELECT 
    'Cluster-' || ROW_NUMBER() OVER (ORDER BY count(*) DESC) as area_name,
    AVG(latitude) as center_lat,
    AVG(longitude) as center_lng,
    500 as radius_meters,
    count(*) as tourist_count,
    CURRENT_DATE as cluster_date,
    jsonb_build_object(
      EXTRACT(HOUR FROM CURRENT_TIMESTAMP)::TEXT, count(*)
    ) as hourly_data
  FROM public.tourist_locations tl
  WHERE tl.timestamp >= CURRENT_DATE
  GROUP BY 
    -- Group by approximate location (0.01 degree precision ~1km)
    ROUND(latitude::numeric, 2),
    ROUND(longitude::numeric, 2)
  HAVING count(*) >= 3; -- Minimum 3 tourists to form a cluster
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for new tables
ALTER TABLE public.missing_persons REPLICA IDENTITY FULL;
ALTER TABLE public.case_updates REPLICA IDENTITY FULL;
ALTER TABLE public.tourist_clusters REPLICA IDENTITY FULL;
ALTER TABLE public.risk_zones REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.missing_persons;
ALTER PUBLICATION supabase_realtime ADD TABLE public.case_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tourist_clusters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_zones;

-- Insert sample risk zones
INSERT INTO public.risk_zones (name, coordinates, risk_level, risk_factors, recommendations) VALUES
('High Crime Area - Sector 5', 
 '[{"lat": 28.6100, "lng": 77.2050}, {"lat": 28.6110, "lng": 77.2060}, {"lat": 28.6105, "lng": 77.2070}, {"lat": 28.6095, "lng": 77.2055}]',
 'high',
 '["theft incidents", "poor lighting", "isolated location"]',
 'Avoid after sunset, travel in groups, use main roads only'),
('Tourist Scam Zone', 
 '[{"lat": 28.6130, "lng": 77.2080}, {"lat": 28.6140, "lng": 77.2090}, {"lat": 28.6135, "lng": 77.2100}, {"lat": 28.6125, "lng": 77.2085}]',
 'medium',
 '["overcharging", "fake guides", "counterfeit goods"]',
 'Verify prices beforehand, use official guides only, check authenticity of purchases');