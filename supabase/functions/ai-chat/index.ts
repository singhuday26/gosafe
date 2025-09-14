import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, userId, userRole, languageCode = 'en' } = await req.json();

    if (!message || !userRole) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle guest users (no database session management)
    if (userRole === 'guest' || !userId) {
      const startTime = Date.now();

      // System prompt for guest users
      const systemPrompt = "You are a helpful AI assistant for the Smart Tourist Safety System. Provide information about the platform features, tourism safety tips, and general guidance. Encourage users to sign up for personalized features. Be concise and helpful.";

      const messages: ChatMessage[] = [
        { role: 'user', content: systemPrompt },
        { role: 'user', content: message }
      ];

      // Call Gemini API
      const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
      if (!geminiApiKey) {
        return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: messages.map(m => `${m.role}: ${m.content}`).join('\n\n')
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          }),
        }
      );

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error('Gemini API error:', errorText);
        return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const geminiData = await geminiResponse.json();
      const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

      const responseTime = Date.now() - startTime;

      return new Response(JSON.stringify({
        response: aiResponse,
        sessionId: null,
        responseTime: responseTime
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get or create chat session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: sessionData, error: sessionError } = await supabase
        .rpc('get_or_create_chat_session', {
          p_user_id: userId,
          p_user_role: userRole,
          p_language_code: languageCode,
          p_metadata: {}
        });

      if (sessionError) {
        console.error('Session error:', sessionError);
        return new Response(JSON.stringify({ error: 'Failed to create session' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      currentSessionId = sessionData[0]?.session_id;
    }

    // Get session UUID for foreign key relationship
    const { data: sessionRecord, error: sessionLookupError } = await supabase
      .from('ai_chat_sessions')
      .select('id')
      .eq('session_id', currentSessionId)
      .single();

    if (sessionLookupError) {
      console.error('Session lookup error:', sessionLookupError);
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sessionUuid = sessionRecord.id;

    // Store user message
    const { error: userMessageError } = await supabase
      .from('ai_chat_messages')
      .insert({
        session_id: sessionUuid,
        message_type: 'user',
        content: message,
        metadata: { timestamp: new Date().toISOString() }
      });

    if (userMessageError) {
      console.error('User message error:', userMessageError);
    }

    // Get recent chat history for context
    const { data: chatHistory, error: historyError } = await supabase
      .from('ai_chat_messages')
      .select('message_type, content')
      .eq('session_id', sessionUuid)
      .order('created_at', { ascending: true })
      .limit(10);

    if (historyError) {
      console.error('History error:', historyError);
    }

    // Build conversation context
    const messages: ChatMessage[] = [];
    
    // System prompt based on user role
    let systemPrompt = "You are a helpful AI assistant for a tourism safety platform.";
    if (userRole === 'tourist') {
      systemPrompt = "You are a helpful AI assistant for tourists. Provide information about safety, travel tips, emergency procedures, and local guidance. Be concise and helpful.";
    } else if (userRole === 'authority') {
      systemPrompt = "You are an AI assistant for tourism authorities. Help with monitoring tourist safety, managing alerts, and providing administrative guidance.";
    } else if (userRole === 'admin') {
      systemPrompt = "You are an AI assistant for system administrators. Help with platform management, user oversight, and system operations.";
    }

    messages.push({ role: 'user', content: systemPrompt });

    // Add chat history to context
    if (chatHistory) {
      chatHistory.forEach(msg => {
        messages.push({
          role: msg.message_type as 'user' | 'assistant',
          content: msg.content
        });
      });
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    const startTime = Date.now();

    // Call Gemini API
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: messages.map(m => `${m.role}: ${m.content}`).join('\n\n')
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiData = await geminiResponse.json();
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    const responseTime = Date.now() - startTime;

    // Store AI response
    const { error: aiMessageError } = await supabase
      .from('ai_chat_messages')
      .insert({
        session_id: sessionUuid,
        message_type: 'assistant',
        content: aiResponse,
        response_time_ms: responseTime,
        metadata: { 
          model: 'gemini-pro',
          timestamp: new Date().toISOString()
        }
      });

    if (aiMessageError) {
      console.error('AI message error:', aiMessageError);
    }

    return new Response(JSON.stringify({
      response: aiResponse,
      sessionId: currentSessionId,
      responseTime: responseTime
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});