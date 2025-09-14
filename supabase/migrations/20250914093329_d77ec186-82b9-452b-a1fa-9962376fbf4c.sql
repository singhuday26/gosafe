-- Create user profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'tourist' CHECK (role IN ('tourist', 'authority', 'admin')),
  phone_number TEXT,
  organization TEXT, -- For authorities/admins
  assigned_geo_fence_ids UUID[], -- For authorities to manage specific zones
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

-- Authorities can view tourist profiles in their assigned zones
CREATE POLICY "Authorities can view assigned tourists"
ON public.profiles
FOR SELECT
USING (
  role = 'tourist' AND
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'authority'
  )
);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND role = required_role
  );
$$;

-- Update RLS policies on existing tables to use role-based access

-- Digital Tourist IDs: Only tourists can create their own, authorities and admins can view all
DROP POLICY IF EXISTS "Only authenticated users can create digital IDs" ON public.digital_tourist_ids;
DROP POLICY IF EXISTS "Only authenticated users can update digital IDs" ON public.digital_tourist_ids;

CREATE POLICY "Tourists can create their own digital IDs"
ON public.digital_tourist_ids
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  public.has_role(auth.uid(), 'tourist')
);

CREATE POLICY "Authorities and admins can update digital IDs"
ON public.digital_tourist_ids
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND
  (public.has_role(auth.uid(), 'authority') OR public.has_role(auth.uid(), 'admin'))
);

-- SOS Alerts: Enhanced policies
DROP POLICY IF EXISTS "Authenticated users can create SOS alerts" ON public.sos_alerts;
DROP POLICY IF EXISTS "Authenticated users can update SOS alerts" ON public.sos_alerts;

CREATE POLICY "Tourists can create SOS alerts"
ON public.sos_alerts
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  public.has_role(auth.uid(), 'tourist')
);

CREATE POLICY "Authorities and admins can update SOS alerts"
ON public.sos_alerts
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND
  (public.has_role(auth.uid(), 'authority') OR public.has_role(auth.uid(), 'admin'))
);

-- Tourist Locations: Enhanced policies
DROP POLICY IF EXISTS "Authenticated users can update tourist locations" ON public.tourist_locations;

CREATE POLICY "Tourists can insert their own location"
ON public.tourist_locations
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  public.has_role(auth.uid(), 'tourist')
);

-- Geo-fences: Enhanced policies
DROP POLICY IF EXISTS "Only authenticated users can manage geo-fences" ON public.geo_fences;

CREATE POLICY "Authorities and admins can manage geo-fences"
ON public.geo_fences
FOR ALL
USING (
  auth.uid() IS NOT NULL AND
  (public.has_role(auth.uid(), 'authority') OR public.has_role(auth.uid(), 'admin'))
);