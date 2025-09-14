-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic policy that references profiles table in its check
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a safer admin policy that doesn't cause recursion
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
  OR auth.uid() = user_id
);

-- Also fix the authority policy to avoid potential recursion
DROP POLICY IF EXISTS "Authorities can view assigned tourists" ON public.profiles;

CREATE POLICY "Authorities can view assigned tourists" 
ON public.profiles 
FOR SELECT 
USING (
  (role = 'tourist' AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'authority'
  ))
  OR auth.uid() = user_id
);