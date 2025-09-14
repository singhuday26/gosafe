-- Fix security issues by setting search_path for all functions

-- Update cleanup_old_chat_sessions function
CREATE OR REPLACE FUNCTION public.cleanup_old_chat_sessions()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Mark sessions as inactive if no activity for 24 hours
  UPDATE public.ai_chat_sessions
  SET is_active = false
  WHERE last_activity < now() - interval '24 hours'
    AND is_active = true;
  
  -- Delete sessions older than 7 days
  DELETE FROM public.ai_chat_sessions
  WHERE created_at < now() - interval '7 days';
$$;

-- Update get_or_create_chat_session function
CREATE OR REPLACE FUNCTION public.get_or_create_chat_session(
  p_user_id UUID,
  p_user_role TEXT,
  p_language_code TEXT DEFAULT 'en',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE(session_id TEXT, is_new BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id TEXT;
  v_existing_session TEXT;
  v_is_new BOOLEAN := false;
BEGIN
  -- Try to find an active session for the user
  SELECT ai_chat_sessions.session_id INTO v_existing_session
  FROM public.ai_chat_sessions
  WHERE user_id = p_user_id 
    AND is_active = true
    AND last_activity > now() - interval '1 hour'
  ORDER BY last_activity DESC
  LIMIT 1;

  IF v_existing_session IS NOT NULL THEN
    -- Update last activity
    UPDATE public.ai_chat_sessions
    SET last_activity = now(),
        metadata = p_metadata
    WHERE session_id = v_existing_session;
    
    v_session_id := v_existing_session;
  ELSE
    -- Create new session
    v_session_id := 'chat_' || generate_random_uuid()::text;
    v_is_new := true;
    
    INSERT INTO public.ai_chat_sessions (
      user_id, session_id, user_role, language_code, metadata
    ) VALUES (
      p_user_id, v_session_id, p_user_role, p_language_code, p_metadata
    );
  END IF;

  RETURN QUERY SELECT v_session_id, v_is_new;
END;
$$;

-- Update existing get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Update existing has_role function
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