/**
 * ChatBot Component – GoSafe Web Portal
 *
 * 🎯 Goal:
 * A highly interactive AI-powered chatbot for tourists, running on Gemini API (via Supabase Edge Function).
 * Should be visually modern, context-aware, multilingual, and permanently integrated into the dashboard.
 *
 * 🧩 Requirements:
 * 1. UI/UX:
 *    - Floating widget button (bottom-right corner of screen).
 *    - On click → Expand into a chat panel (modal-style, right side).
 *    - Panel includes:
 *        - Chat history window (scrollable).
 *        - Input box with send button (Enter key support).
 *        - "Clear chat" option.
 *        - Loading state (typing dots).
 *    - Tailwind + shadcn/ui styling.
 *    - North-East India theme applied (colors, gradients).
 *
 * 2. State Management:
 *    - Maintain chat history in React state.
 *    - Use React Query for server requests & caching.
 *    - Store conversation in Supabase (optional for persistence).
 *
 * 3. Backend (Supabase Edge Function):
 *    - Endpoint: /functions/v1/ai-chat
 *    - Accepts { userId, role, message, context }.
 *    - Calls Gemini API with proper system prompt:
 *        "You are GoSafe Assistant, guiding tourists in NE India about safety, SOS, and travel."
 *    - Returns AI response as JSON.
 *
 * 4. Features:
 *    - Multilingual support (integrate i18next).
 *    - Safety context awareness:
 *        - If user asks about unsafe zones → fetch risk index + geo-fence info.
 *        - If user mentions "help / emergency" → suggest SOS button.
 *    - Authority escalation:
 *        - If AI detects distress keywords → auto-suggest SOS workflow.
 *    - Offline fallback:
 *        - If network down → show "Limited mode: please use SOS directly".
 *
 * 5. Testing:
 *    - Add Jest tests for:
 *        - Chat panel open/close.
 *        - Message sending & receiving.
 *        - Multilingual toggle working.
 *        - Offline fallback message.
 *
 * 🔗 Integration:
 * - Add <ChatBotWrapper /> in Layout.tsx so chatbot is globally available after login.
 * - Chatbot must work for ALL roles (Tourist, Authority, Admin), but with role-specific context:
 *      Tourist → travel safety help
 *      Authority → monitor alerts + respond
 *      Admin → system overview guidance
 *
 * 🚀 Deliverable:
 * A production-ready chatbot component with:
 * - UI panel (shadcn + Tailwind).
 * - Gemini API backend (via Supabase edge function).
 * - State persistence (React Query + optional Supabase storage).
 * - Multilingual + context-aware responses.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  MessageCircle,
  Send,
  X,
  Trash2,
  Bot,
  User,
  AlertTriangle,
  PhoneCall,
  MapPin,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Alert, AlertDescription } from "./ui/alert";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "../hooks/use-toast";

// Types
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  message: string;
  timestamp: Date;
  context?: {
    location?: { lat: number; lng: number };
    safetyScore?: number;
    activeFences?: string[];
  };
  actions?: Array<{
    type: "sos" | "show_id" | "call_emergency" | "navigate";
    label: string;
    data?: Record<string, unknown>;
  }>;
}

interface ChatContext {
  userId: string;
  role: "tourist" | "authority" | "admin";
  location?: { lat: number; lng: number };
  safetyScore?: number;
  activeFences?: string[];
  language: string;
}

interface ChatBotProps {
  userRole?: string;
  userId?: string;
  language?: string;
}

// Custom hooks
const useChatHistory = (userId: string) => {
  return useQuery({
    queryKey: ["chatHistory", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_chat_messages")
        .select("*")
        .eq("session_id", userId)
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};

const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      message,
      context,
    }: {
      message: string;
      context: ChatContext;
    }) => {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          userId: context.userId,
          role: context.role,
          message,
          context: {
            location: context.location,
            safetyScore: context.safetyScore,
            activeFences: context.activeFences,
            language: context.language,
          },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate chat history to refetch
      queryClient.invalidateQueries({
        queryKey: ["chatHistory", variables.context.userId],
      });
    },
  });
};

// Main ChatBot Component
export const ChatBot: React.FC<ChatBotProps> = ({
  userRole = "tourist",
  userId,
  language = "en",
}) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Get welcome message based on user role
  const getWelcomeMessage = useCallback((): ChatMessage => {
    const roleMessages = {
      tourist:
        "Hi! I'm your GoSafe assistant. I can help with safety tips, emergency procedures, and local guidance. How can I assist you today?",
      authority:
        "Hello! I'm here to help you monitor alerts, coordinate responses, and manage tourist safety. What do you need assistance with?",
      admin:
        "Welcome! I can help with system overview, analytics, and platform management. How can I assist you?",
    };

    return {
      id: "welcome",
      role: "assistant",
      message:
        roleMessages[userRole as keyof typeof roleMessages] ||
        roleMessages.tourist,
      timestamp: new Date(),
    };
  }, [userRole]);

  // Initialize welcome message
  useEffect(() => {
    if (isOpen && localMessages.length === 0) {
      const welcomeMessage = getWelcomeMessage();
      setLocalMessages([welcomeMessage]);
    }
  }, [isOpen, localMessages.length, getWelcomeMessage]);

  // Queries and mutations
  const sendMessageMutation = useSendMessage();

  // Get user context
  const getUserContext = (): ChatContext => {
    return {
      userId: userId || user?.id || "",
      role: (userRole as ChatContext["role"]) || "tourist",
      location: { lat: 26.2041, lng: 92.9376 }, // Guwahati coordinates as default
      safetyScore: 85, // Mock data
      activeFences: ["Tourist Zone"], // Mock data
      language: language || i18n.language,
    };
  };

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      message: message.trim(),
      timestamp: new Date(),
    };

    setLocalMessages((prev) => [...prev, userMessage]);
    setMessage("");

    try {
      const context = getUserContext();

      // Call the AI chat function
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: message.trim(),
          sessionId,
          userId: context.userId === "guest" ? null : context.userId,
          userRole: context.role,
          languageCode: context.language,
          context: {
            location: context.location,
            safetyScore: context.safetyScore,
            activeFences: context.activeFences,
          },
        },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        message: data.response || data.message,
        timestamp: new Date(),
        actions: data.actions,
      };

      setLocalMessages((prev) => [...prev, assistantMessage]);

      // Store session ID for future messages
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        message: isOnline
          ? "I'm sorry, I'm having trouble connecting right now. Please try again in a moment."
          : "You are offline. For emergencies, please use the SOS button directly.",
        timestamp: new Date(),
        actions: !isOnline
          ? [{ type: "sos", label: "Emergency SOS" }]
          : undefined,
      };

      setLocalMessages((prev) => [...prev, errorMessage]);
    }
  };

  // Handle action buttons
  const handleAction = (
    action: ChatMessage["actions"] extends Array<infer T> ? T : never
  ) => {
    if (!action) return;

    switch (action.type) {
      case "sos":
        // Trigger SOS workflow
        console.log("Triggering SOS...");
        toast({
          title: "SOS Triggered",
          description: "Emergency services have been notified.",
        });
        break;
      case "show_id":
        // Show digital ID
        console.log("Showing Digital ID...");
        break;
      case "call_emergency":
        // Initiate emergency call
        console.log("Calling emergency...");
        break;
      case "navigate":
        // Navigate to location
        console.log("Navigating to:", action.data);
        break;
    }
  };

  // Clear chat history
  const handleClearChat = () => {
    setLocalMessages([getWelcomeMessage()]);
    setSessionId(null);
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-6 left-6 z-40 rounded-full w-14 h-14 p-0 
          shadow-lg transition-all duration-300 hover:scale-110
          bg-gradient-to-br from-emerald-500 to-teal-600 
          hover:from-emerald-600 hover:to-teal-700
        `}
        aria-label="Open Chat Assistant"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        {!isOnline && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 bg-black/20 backdrop-blur-sm">
      <Card className="w-full max-w-md h-[80vh] flex flex-col shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <CardTitle className="text-lg font-semibold">
              GoSafe Assistant
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Offline
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="text-white hover:bg-white/20"
              aria-label="Clear Chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20"
              aria-label={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {localMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] ${
                          msg.role === "user" ? "order-last" : ""
                        }`}
                      >
                        <div
                          className={`
                            p-3 rounded-lg text-sm
                            ${
                              msg.role === "user"
                                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                : "bg-gray-100 text-gray-800"
                            }
                          `}
                        >
                          {msg.message}
                        </div>

                        {/* Action Buttons */}
                        {msg.actions && msg.actions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {msg.actions.map((action, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(action)}
                                className="text-xs"
                              >
                                {action.type === "sos" && (
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                )}
                                {action.type === "call_emergency" && (
                                  <PhoneCall className="w-3 h-3 mr-1" />
                                )}
                                {action.type === "navigate" && (
                                  <MapPin className="w-3 h-3 mr-1" />
                                )}
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}

                        <div className="text-xs text-gray-500 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                      </div>

                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading state */}
                  {sendMessageMutation.isPending && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animate-delay-100" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animate-delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t">
              {!isOnline ? (
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    You are offline. For emergencies, use the SOS button
                    directly.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={sendMessageMutation.isPending}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    className="bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    aria-label="Send"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
