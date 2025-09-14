-- Create Digital Tourist IDs table
CREATE TABLE public.digital_tourist_ids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tourist_name TEXT NOT NULL,
  aadhaar_number TEXT NOT NULL,
  passport_number TEXT,
  trip_itinerary TEXT NOT NULL,
  emergency_contacts JSONB NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
  blockchain_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create SOS Alerts table
CREATE TABLE public.sos_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tourist_id UUID NOT NULL REFERENCES public.digital_tourist_ids(id),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('panic', 'medical', 'security', 'other')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'responded', 'resolved')),
  message TEXT,
  blockchain_hash TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Geo-Fences table
CREATE TABLE public.geo_fences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('safe', 'restricted', 'danger')),
  coordinates JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Tourist Locations table for real-time tracking
CREATE TABLE public.tourist_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tourist_id UUID NOT NULL REFERENCES public.digital_tourist_ids(id),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.digital_tourist_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_fences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourist_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for digital_tourist_ids (public read for verification, restricted write)
CREATE POLICY "Digital IDs are viewable by everyone" 
ON public.digital_tourist_ids 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can create digital IDs" 
ON public.digital_tourist_ids 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can update digital IDs" 
ON public.digital_tourist_ids 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create policies for sos_alerts
CREATE POLICY "SOS alerts are viewable by everyone" 
ON public.sos_alerts 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create SOS alerts" 
ON public.sos_alerts 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update SOS alerts" 
ON public.sos_alerts 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create policies for geo_fences (public read)
CREATE POLICY "Geo-fences are viewable by everyone" 
ON public.geo_fences 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can manage geo-fences" 
ON public.geo_fences 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create policies for tourist_locations
CREATE POLICY "Tourist locations are viewable by everyone" 
ON public.tourist_locations 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can update tourist locations" 
ON public.tourist_locations 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create function to generate blockchain hash
CREATE OR REPLACE FUNCTION public.generate_blockchain_hash(data JSONB)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(data::text, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_digital_tourist_ids_updated_at
  BEFORE UPDATE ON public.digital_tourist_ids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sos_alerts_updated_at
  BEFORE UPDATE ON public.sos_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_geo_fences_updated_at
  BEFORE UPDATE ON public.geo_fences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample geo-fences
INSERT INTO public.geo_fences (name, type, coordinates, description) VALUES
('Tourist Hub Area', 'safe', '[{"lat": 28.6139, "lng": 77.2090}, {"lat": 28.6145, "lng": 77.2095}, {"lat": 28.6135, "lng": 77.2100}, {"lat": 28.6130, "lng": 77.2085}]', 'Main tourist area with high security'),
('Construction Zone', 'restricted', '[{"lat": 28.6120, "lng": 77.2070}, {"lat": 28.6125, "lng": 77.2075}, {"lat": 28.6115, "lng": 77.2080}, {"lat": 28.6110, "lng": 77.2065}]', 'Active construction area - avoid after 6 PM');

-- Enable realtime for all tables
ALTER TABLE public.digital_tourist_ids REPLICA IDENTITY FULL;
ALTER TABLE public.sos_alerts REPLICA IDENTITY FULL;
ALTER TABLE public.geo_fences REPLICA IDENTITY FULL;
ALTER TABLE public.tourist_locations REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.digital_tourist_ids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.geo_fences;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tourist_locations;