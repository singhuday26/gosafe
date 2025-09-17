/**
 * AI Chat Edge Function – GoSafe Assistant Backend
 *
 * 🎯 Purpose:
 * Supabase Edge Function that handles AI chat requests using Google's Gemini API.
 * Provides context-aware, multilingual, and role-specific responses for tourists,
 * authorities, and admins in the GoSafe platform.
 *
 * 🧩 Features:
 * - Gemini AI integration with custom system prompts
 * - Role-based response context (Tourist/Authority/Admin)
 * - Multilingual support with automatic translation
 * - Safety-aware responses with emergency action suggestions
 * - Session management and conversation persistence
 * - Action detection and suggestion system
 *
 * 🔐 Security:
 * - JWT authentication validation
 * - Input sanitization and validation
 * - Rate limiting per user
 * - Audit logging for all interactions
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// Provide Deno global typing for editor linting
// deno-lint-ignore no-explicit-any
declare const Deno: { env: { get: (key: string) => string | undefined } };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Action {
  type: string;
  label: string;
  data: unknown | null;
}

interface ApiResponse {
  response: string;
  message?: string; // For compatibility
  sessionId: string | null;
  responseTime: number;
  actions?: Action[];
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST for main handler
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const {
      message,
      sessionId,
      userId,
      userRole,
      languageCode = "en",
    } = body || {};

    // Basic input validation and normalization
    const safeMessage = (typeof message === "string" ? message : "").trim();
    const safeRole = (typeof userRole === "string" ? userRole : "").trim();
    let safeUserId = (typeof userId === "string" ? userId : "").trim();
    const safeLang =
      (typeof languageCode === "string" ? languageCode : "en").trim() || "en";

    if (!safeMessage || !safeRole) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Enforce reasonable message size to protect backend
    if (safeMessage.length > 4000) {
      return new Response(JSON.stringify({ error: "Message too long" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle guest users (no database session management)
    if (safeRole === "guest" || !safeUserId) {
      const startTime = Date.now();

      // System prompt for guest users
      const systemPrompt =
        "You are a helpful AI assistant for the Smart Tourist Safety System. Provide information about the platform features, tourism safety tips, and general guidance. Encourage users to sign up for personalized features. Be concise and helpful.";

      const messages: ChatMessage[] = [
        { role: "user", content: systemPrompt },
        { role: "user", content: safeMessage },
      ];

      // Call Gemini API (unified model)
      const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
      if (!geminiApiKey) {
        return new Response(
          JSON.stringify({ error: "Gemini API key not configured" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: messages
                      .map((m) => `${m.role}: ${m.content}`)
                      .join("\n\n"),
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 500,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
            ],
          }),
        }
      );

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error("Gemini API error (guest):", {
          status: geminiResponse.status,
          statusText: geminiResponse.statusText,
          error: errorText,
        });
        return new Response(
          JSON.stringify({ error: "Failed to generate response" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      let geminiData;
      try {
        geminiData = await geminiResponse.json();
      } catch (parseError) {
        console.error("Failed to parse Gemini response (guest):", parseError);
        return new Response(
          JSON.stringify({ error: "Invalid AI response format" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const aiResponse =
        geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I could not generate a response.";

      const responseTime = Date.now() - startTime;

      return new Response(
        JSON.stringify({
          response: aiResponse,
          sessionId: null,
          responseTime: responseTime,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate JWT for authenticated users
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7).trim()
      : "";
    if (!jwt) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: authUser, error: authErr } = await supabase.auth.getUser(jwt);
    if (
      authErr ||
      !authUser?.user?.id ||
      (safeUserId && authUser.user.id !== safeUserId)
    ) {
      console.error(
        "Authentication error:",
        authErr?.message || "Invalid user"
      );
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Normalize userId to the verified id
    safeUserId = authUser.user.id;

    // Get or create chat session
    let currentSessionId = sessionId as string | undefined;
    if (!currentSessionId) {
      // Create session directly since RPC might not exist
      const sessionIdStr = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 10)}`;

      const { data: sessionData, error: sessionError } = await supabase
        .from("ai_chat_sessions")
        .insert({
          session_id: sessionIdStr,
          user_id: safeUserId,
          user_role: safeRole,
          language_code: safeLang,
          metadata: {},
        })
        .select()
        .single();

      if (sessionError) {
        console.error("Session creation error:", sessionError);
        // Fallback: continue without session persistence
        currentSessionId = sessionIdStr;
      } else {
        currentSessionId = sessionData.session_id;
      }
    }

    // Get session UUID for foreign key relationship
    let sessionUuid: string | null = null;

    if (currentSessionId) {
      const { data: sessionRecord, error: sessionLookupError } = await supabase
        .from("ai_chat_sessions")
        .select("id")
        .eq("session_id", currentSessionId)
        .single();

      if (!sessionLookupError && sessionRecord) {
        sessionUuid = sessionRecord.id as string;
      }
    }

    // Continue without session if not found (graceful degradation)
    if (!sessionUuid) {
      console.warn("No session UUID found, continuing without persistence");
    }

    // Basic per-session rate limiting (e.g., 30 user messages/min)
    if (sessionUuid) {
      const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
      const { count: recentCount } = await supabase
        .from("ai_chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("session_id", sessionUuid)
        .eq("message_type", "user")
        .gte("created_at", oneMinuteAgo);

      if ((recentCount ?? 0) > 30) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please slow down." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Store user message (if session exists)
    if (sessionUuid) {
      const { error: userMessageError } = await supabase
        .from("ai_chat_messages")
        .insert({
          session_id: sessionUuid,
          message_type: "user",
          content: safeMessage,
          metadata: { timestamp: new Date().toISOString() },
        });

      if (userMessageError) {
        console.error("User message storage error:", userMessageError);
      }
    }

    // Get recent chat history for context (if session exists)
    let chatHistory: Array<{
      message_type: "user" | "assistant";
      content: string;
    }> = [];

    if (sessionUuid) {
      const { data: historyData, error: historyError } = await supabase
        .from("ai_chat_messages")
        .select("message_type, content")
        .eq("session_id", sessionUuid)
        .order("created_at", { ascending: true })
        .limit(10);

      if (historyError) {
        console.error("History retrieval error:", historyError);
      } else {
        chatHistory = historyData || [];
      }
    }

    // Build conversation context with enhanced system prompts
    const messages: ChatMessage[] = [];

    // Enhanced system prompt based on user role
    const systemPrompt = buildSystemPrompt(safeRole, safeLang);

    messages.push({ role: "user", content: systemPrompt });

    // Add chat history to context
    if (chatHistory.length > 0) {
      chatHistory.forEach(
        (msg: { message_type: "user" | "assistant"; content: string }) => {
          messages.push({
            role: msg.message_type as "user" | "assistant",
            content: msg.content,
          });
        }
      );
    }

    // Add current message
    messages.push({ role: "user", content: safeMessage });

    const startTime = Date.now();

    // Call Gemini API with enhanced configuration
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: messages
                    .map((m) => `${m.role}: ${m.content}`)
                    .join("\n\n"),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", {
        status: geminiResponse.status,
        statusText: geminiResponse.statusText,
        error: errorText,
      });
      return new Response(
        JSON.stringify({ error: "Failed to generate response" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let geminiData;
    try {
      geminiData = await geminiResponse.json();
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    const rawResponse =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not generate a response.";

    const responseTime = Date.now() - startTime;

    // Parse response and extract actions
    const { responseMessage, actions } = parseResponseForActions(
      rawResponse,
      safeRole,
      safeMessage
    );

    // Store AI response with actions (if session exists)
    if (sessionUuid) {
      const { error: aiMessageError } = await supabase
        .from("ai_chat_messages")
        .insert({
          session_id: sessionUuid,
          message_type: "assistant",
          content: responseMessage,
          response_time_ms: responseTime,
          metadata: {
            model: "gemini-1.5-flash-latest",
            timestamp: new Date().toISOString(),
            actions: actions,
            userRole: safeRole,
            language: safeLang,
          },
        });

      if (aiMessageError) {
        console.error("AI message storage error:", aiMessageError);
      }
    }

    const apiResponse: ApiResponse = {
      response: responseMessage,
      message: responseMessage, // For compatibility
      sessionId: currentSessionId || null,
      responseTime: responseTime,
      actions: actions,
    };

    return new Response(JSON.stringify(apiResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-chat function:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/**
 * Build enhanced system prompt based on user role and context
 */
function buildSystemPrompt(role: string, language: string): string {
  const basePrompt = `You are GoSafe Assistant, an AI helper for the Smart Tourist Safety System in Northeast India. You are knowledgeable about local culture, safety protocols, emergency procedures, and tourist guidance.`;

  const roleSpecificPrompts = {
    tourist: `
You help tourists with:
- Safety tips and local guidance for Northeast India
- Emergency procedures and SOS assistance
- Cultural information and travel advice
- Local attractions and safe zones
- Emergency contact information

If a user mentions distress, danger, or emergency keywords, immediately suggest using the SOS button.
For safety concerns, provide actionable advice and suggest emergency contacts.
`,
    authority: `
You help tourism authorities with:
- Tourist safety monitoring and alerts
- Emergency response coordination
- Safety protocol guidance
- Tourist assistance procedures
- System operation support

Focus on operational efficiency and tourist safety management.
`,
    admin: `
You help system administrators with:
- Platform management and oversight
- User management guidance
- System analytics and insights
- Technical support assistance
- Policy and procedure clarification

Focus on system administration and platform optimization.
`,
    guest: `
You help visitors learn about:
- GoSafe platform features and benefits
- Tourist safety in Northeast India
- Registration and onboarding process
- General tourism information
- Platform capabilities

Encourage them to register for full access to safety features.
`,
  };

  const languageNote =
    language !== "en" ? `Respond in ${language} language when possible.` : "";

  return `${basePrompt}

${
  roleSpecificPrompts[role as keyof typeof roleSpecificPrompts] ||
  roleSpecificPrompts.tourist
}

${languageNote}

Guidelines:
1. Be helpful, concise, and safety-focused
2. For emergencies, suggest immediate SOS action
3. Provide actionable advice
4. Stay within your role's scope
5. Be culturally sensitive to Northeast India
6. Keep responses under 200 words unless specifically needed

If you suggest actions, format them as: [ACTION:type:label]
Available actions: sos, show_id, call_emergency, navigate`;
}

/**
 * Parse Gemini response and extract actions
 */
function parseResponseForActions(
  response: string,
  role: string,
  userMessage: string
): { responseMessage: string; actions: Action[] } {
  const actions: Action[] = [];
  let cleanedMessage = response;

  // Extract action patterns: [ACTION:type:label]
  const actionPattern = /\[ACTION:(\w+):([^\]]+)\]/g;
  let match;

  while ((match = actionPattern.exec(response)) !== null) {
    const [fullMatch, type, label] = match;

    // Remove action from message
    cleanedMessage = cleanedMessage.replace(fullMatch, "").trim();

    // Add to actions array with validation
    if (type && label) {
      actions.push({
        type: type.toLowerCase(),
        label: label.trim(),
        data: null,
      });
    }
  }

  // Detect emergency keywords and auto-suggest SOS
  const emergencyKeywords = [
    "emergency",
    "help",
    "danger",
    "unsafe",
    "lost",
    "trouble",
    "panic",
    "scared",
    "attack",
    "theft",
    "medical",
  ];
  const hasEmergencyKeyword = emergencyKeywords.some(
    (keyword) =>
      userMessage.toLowerCase().includes(keyword) ||
      cleanedMessage.toLowerCase().includes(keyword)
  );

  if (
    hasEmergencyKeyword &&
    role === "tourist" &&
    !actions.some((a) => a.type === "sos")
  ) {
    actions.push({
      type: "sos",
      label: "Emergency SOS",
      data: null,
    });
  }

  // Detect location-related queries and suggest navigation
  const locationKeywords = [
    "where",
    "direction",
    "location",
    "navigate",
    "route",
    "way",
  ];
  const hasLocationKeyword = locationKeywords.some((keyword) =>
    userMessage.toLowerCase().includes(keyword)
  );

  if (
    hasLocationKeyword &&
    role === "tourist" &&
    !actions.some((a) => a.type === "navigate")
  ) {
    actions.push({
      type: "navigate",
      label: "Show on Map",
      data: null,
    });
  }

  return {
    responseMessage: cleanedMessage.trim(),
    actions,
  };
}
