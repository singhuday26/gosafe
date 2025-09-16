/**
 * ChatBotWrapper Component – Global Chat Integration
 *
 * 🎯 Purpose:
 * Wrapper component that provides the ChatBot with proper context and integrates
 * it globally across all authenticated layouts. This ensures the chatbot is
 * always available to users regardless of which page they're on.
 *
 * 🔗 Integration:
 * - Wraps ChatBot with React Query Provider context
 * - Provides user authentication context
 * - Handles role-based chat configuration
 * - Manages global chat state and persistence
 *
 * 🚀 Features:
 * - Automatic user role detection
 * - Language preference integration
 * - Offline state management
 * - Session persistence across page navigations
 */

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { ChatBot } from "./ChatBot";

// Create a query client for chat-specific queries
const chatQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

interface ChatBotWrapperProps {
  /**
   * Override the default user role detection
   */
  forceRole?: "tourist" | "authority" | "admin" | "guest";

  /**
   * Whether to show the chatbot (default: true when authenticated)
   */
  enabled?: boolean;

  /**
   * Additional context to pass to the chatbot
   */
  context?: {
    currentPage?: string;
    location?: { lat: number; lng: number };
    safetyScore?: number;
  };
}

export const ChatBotWrapper: React.FC<ChatBotWrapperProps> = ({
  forceRole,
  enabled = true,
  context,
}) => {
  const { user, userRole, loading } = useAuth();
  const { i18n } = useTranslation();

  // Don't render if still loading or disabled
  if (loading || !enabled) {
    return null;
  }

  // Determine user role for chat context
  const getUserRole = (): string => {
    if (forceRole) return forceRole;
    if (!user) return "guest";

    // Map user roles to chat roles
    switch (userRole || user.role) {
      case "tourist":
        return "tourist";
      case "authority":
      case "ranger":
      case "police":
        return "authority";
      case "admin":
      case "super_admin":
        return "admin";
      default:
        return userRole || "guest";
    }
  };

  const chatRole = getUserRole();
  const userId = user?.id || "guest";
  const language = i18n.language || "en";

  return (
    <QueryClientProvider client={chatQueryClient}>
      <ChatBot userRole={chatRole} userId={userId} language={language} />
    </QueryClientProvider>
  );
};

/**
 * Hook to provide chat context to child components
 * Useful for components that need to interact with the chatbot
 */
export const useChatContext = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();

  const triggerChatWithMessage = (message: string) => {
    // This would trigger the chat with a pre-filled message
    // Implementation depends on how we want to handle programmatic chat triggers
    console.log("Triggering chat with message:", message);

    // Could dispatch a custom event that the ChatBot listens for
    window.dispatchEvent(
      new CustomEvent("chat:trigger", {
        detail: { message },
      })
    );
  };

  const triggerEmergencyChat = () => {
    triggerChatWithMessage("I need emergency help");
  };

  const triggerSafetyChat = () => {
    triggerChatWithMessage(
      "Can you help me with safety information for my current location?"
    );
  };

  return {
    user,
    language: i18n.language,
    triggerChatWithMessage,
    triggerEmergencyChat,
    triggerSafetyChat,
  };
};

export default ChatBotWrapper;
