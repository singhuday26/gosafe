-- Create chat sessions table for maintaining conversation context
CREATE TABLE public.ai_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  user_role TEXT NOT NULL CHECK (user_role IN ('tourist', 'authority', 'admin')),
  language_code TEXT NOT NULL DEFAULT 'en',
  metadata JSONB DEFAULT '{}', -- Store user context (location, preferences, etc.)
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table for storing conversation history
CREATE TABLE public.ai_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- Store additional data like follow-up actions, context
  response_time_ms INTEGER, -- Track API response times
  tokens_used INTEGER, -- Track token usage for analytics
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_ai_chat_sessions_user_id ON public.ai_chat_sessions(user_id);
CREATE INDEX idx_ai_chat_sessions_session_id ON public.ai_chat_sessions(session_id);
CREATE INDEX idx_ai_chat_sessions_last_activity ON public.ai_chat_sessions(last_activity);
CREATE INDEX idx_ai_chat_messages_session_id ON public.ai_chat_messages(session_id);
CREATE INDEX idx_ai_chat_messages_created_at ON public.ai_chat_messages(created_at);

-- Enable RLS on both tables
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_chat_sessions
CREATE POLICY "Users can view their own chat sessions"
ON public.ai_chat_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions"
ON public.ai_chat_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
ON public.ai_chat_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all chat sessions for monitoring
CREATE POLICY "Admins can view all chat sessions"
ON public.ai_chat_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS policies for ai_chat_messages
CREATE POLICY "Users can view messages from their sessions"
ON public.ai_chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.ai_chat_sessions
    WHERE id = ai_chat_messages.session_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages to their sessions"
ON public.ai_chat_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ai_chat_sessions
    WHERE id = ai_chat_messages.session_id AND user_id = auth.uid()
  )
);

-- Admins can view all messages for monitoring
CREATE POLICY "Admins can view all chat messages"
ON public.ai_chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_ai_chat_sessions_updated_at
BEFORE UPDATE ON public.ai_chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to clean up old inactive sessions (ran periodically)
CREATE OR REPLACE FUNCTION public.cleanup_old_chat_sessions()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
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

-- Function to get or create chat session
CREATE OR REPLACE FUNCTION public.get_or_create_chat_session(
  p_user_id UUID,
  p_user_role TEXT,
  p_language_code TEXT DEFAULT 'en',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE(session_id TEXT, is_new BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
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