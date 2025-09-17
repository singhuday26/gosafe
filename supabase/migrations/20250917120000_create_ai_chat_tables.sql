-- Create AI Chat Sessions table
CREATE TABLE public.ai_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL CHECK (user_role IN ('tourist', 'authority', 'admin', 'guest')),
  language_code TEXT NOT NULL DEFAULT 'en',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI Chat Messages table
CREATE TABLE public.ai_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant')),
  content TEXT NOT NULL,
  response_time_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_chat_sessions
CREATE POLICY "Users can access their own chat sessions"
ON public.ai_chat_sessions
FOR ALL
USING (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all sessions
CREATE POLICY "Admins can view all chat sessions"
ON public.ai_chat_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

-- Create policies for ai_chat_messages
CREATE POLICY "Users can access messages from their sessions"
ON public.ai_chat_messages
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.ai_chat_sessions s
    WHERE s.id = session_id AND (s.user_id = auth.uid() OR s.user_id IS NULL)
  )
);

-- Admins can view all messages
CREATE POLICY "Admins can view all chat messages"
ON public.ai_chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

-- Add triggers for timestamp updates
CREATE TRIGGER update_ai_chat_sessions_updated_at
BEFORE UPDATE ON public.ai_chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get or create chat session
CREATE OR REPLACE FUNCTION public.get_or_create_chat_session(
  p_user_id UUID,
  p_user_role TEXT,
  p_language_code TEXT DEFAULT 'en',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE(session_id TEXT, id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id TEXT;
  v_session_uuid UUID;
BEGIN
  -- Try to find existing active session (within last 24 hours)
  SELECT s.session_id, s.id
  INTO v_session_id, v_session_uuid
  FROM public.ai_chat_sessions s
  WHERE s.user_id = p_user_id
    AND s.user_role = p_user_role
    AND s.created_at > (now() - interval '24 hours')
  ORDER BY s.created_at DESC
  LIMIT 1;

  -- If no session found, create new one
  IF v_session_id IS NULL THEN
    v_session_id := 'session_' || extract(epoch from now())::bigint || '_' || substr(gen_random_uuid()::text, 1, 8);
    
    INSERT INTO public.ai_chat_sessions (session_id, user_id, user_role, language_code, metadata)
    VALUES (v_session_id, p_user_id, p_user_role, p_language_code, p_metadata)
    RETURNING id INTO v_session_uuid;
  END IF;

  RETURN QUERY SELECT v_session_id, v_session_uuid;
END;
$$;

-- Enable realtime
ALTER TABLE public.ai_chat_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.ai_chat_messages REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_chat_messages;

-- Create indexes for performance
CREATE INDEX idx_ai_chat_sessions_user_id ON public.ai_chat_sessions(user_id);
CREATE INDEX idx_ai_chat_sessions_session_id ON public.ai_chat_sessions(session_id);
CREATE INDEX idx_ai_chat_messages_session_id ON public.ai_chat_messages(session_id);
CREATE INDEX idx_ai_chat_messages_created_at ON public.ai_chat_messages(created_at);