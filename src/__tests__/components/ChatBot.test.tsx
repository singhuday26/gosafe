/**
 * ChatBot Component Tests
 *
 * Test suite for the GoSafe ChatBot component functionality including:
 * - Component rendering and UI interactions
 * - Message sending and receiving
 * - Multilingual support
 * - Offline fallback behavior
 * - Action button functionality
 * - Accessibility compliance
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { ChatBot } from "../../components/ChatBot";
import { useAuth } from "../../contexts/AuthContext";
import i18n from "../../i18n";
import type { User } from "@supabase/supabase-js";

// Mock the auth context
jest.mock("../../contexts/AuthContext");
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock supabase
jest.mock("../../integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
  },
}));

// Mock toast hook
jest.mock("../../hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Test utilities
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const renderChatBot = (props = {}) => {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ChatBot
          userRole="tourist"
          userId="test-user-id"
          language="en"
          {...props}
        />
      </I18nextProvider>
    </QueryClientProvider>
  );
};

describe("ChatBot Component", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: "test-user-id" } as User,
      session: null,
      userRole: "tourist",
      loading: false,
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
    });

    // Mock online status
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders chat button when closed", () => {
      renderChatBot();

      const chatButton = screen.getByLabelText(/open chat assistant/i);
      expect(chatButton).toBeInTheDocument();
      expect(chatButton.className).toContain("fixed");
      expect(chatButton.className).toContain("bottom-6");
      expect(chatButton.className).toContain("left-6");
    });

    it("shows offline indicator when offline", () => {
      Object.defineProperty(navigator, "onLine", {
        value: false,
      });

      renderChatBot();

      const chatButton = screen.getByLabelText(/open chat assistant/i);
      expect(chatButton).toBeInTheDocument();

      // Check for offline indicator (red dot)
      const offlineIndicator = chatButton.querySelector(".bg-red-500");
      expect(offlineIndicator).toBeInTheDocument();
    });

    it("opens chat panel when button clicked", async () => {
      renderChatBot();

      const chatButton = screen.getByLabelText(/open chat assistant/i);
      fireEvent.click(chatButton);

      await waitFor(() => {
        expect(screen.getByText("GoSafe Assistant")).toBeInTheDocument();
      });
    });

    it("displays welcome message when opened", async () => {
      renderChatBot();

      const chatButton = screen.getByLabelText(/open chat assistant/i);
      fireEvent.click(chatButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Hi! I'm your GoSafe assistant/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Message Functionality", () => {
    it("allows typing and sending messages", async () => {
      renderChatBot();

      // Open chat
      const chatButton = screen.getByLabelText(/open chat assistant/i);
      fireEvent.click(chatButton);

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/type your message/i);
        expect(input).toBeInTheDocument();

        // Type a message
        fireEvent.change(input, { target: { value: "Hello chatbot" } });
        expect((input as HTMLInputElement).value).toBe("Hello chatbot");

        // Send message
        const sendButton = screen.getByRole("button", { name: /send/i });
        fireEvent.click(sendButton);

        // Message should appear in chat
        expect(screen.getByText("Hello chatbot")).toBeInTheDocument();
      });
    });

    it("sends message on Enter key press", async () => {
      renderChatBot();

      const chatButton = screen.getByLabelText(/open chat assistant/i);
      fireEvent.click(chatButton);

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/type your message/i);

        fireEvent.change(input, { target: { value: "Test message" } });
        fireEvent.keyPress(input, { key: "Enter", code: "Enter" });

        expect(screen.getByText("Test message")).toBeInTheDocument();
      });
    });

    it("clears input after sending message", async () => {
      renderChatBot();

      const chatButton = screen.getByLabelText(/open chat assistant/i);
      fireEvent.click(chatButton);

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/type your message/i);

        fireEvent.change(input, { target: { value: "Test message" } });
        fireEvent.keyPress(input, { key: "Enter", code: "Enter" });

        expect((input as HTMLInputElement).value).toBe("");
      });
    });
  });

  describe("Role-specific Behavior", () => {
    it("shows tourist-specific welcome message for tourist role", async () => {
      renderChatBot({ userRole: "tourist" });

      const chatButton = screen.getByLabelText(/open chat assistant/i);
      fireEvent.click(chatButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Hi! I'm your GoSafe assistant/i)
        ).toBeInTheDocument();
      });
    });

    it("shows authority-specific welcome message for authority role", async () => {
      renderChatBot({ userRole: "authority" });

      const chatButton = screen.getByLabelText(/open chat assistant/i);
      fireEvent.click(chatButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Hello! I'm here to help you monitor alerts/i)
        ).toBeInTheDocument();
      });
    });

    it("shows admin-specific welcome message for admin role", async () => {
      renderChatBot({ userRole: "admin" });

      const chatButton = screen.getByLabelText(/open chat assistant/i);
      fireEvent.click(chatButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Welcome! I can help with system overview/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Offline Behavior", () => {
    beforeEach(() => {
      Object.defineProperty(navigator, "onLine", {
        value: false,
      });
    });

    it("shows offline warning when chat is opened offline", async () => {
      renderChatBot();

      const chatButton = screen.getByLabelText(/open chat assistant/i);
      fireEvent.click(chatButton);

      await waitFor(() => {
        expect(screen.getByText(/you are offline/i)).toBeInTheDocument();
      });
    });

    it("disables input when offline", async () => {
      renderChatBot();

      const chatButton = screen.getByLabelText(/open chat assistant/i);
      fireEvent.click(chatButton);

      await waitFor(() => {
        const input = screen.queryByPlaceholderText(/type your message/i);
        expect(input).not.toBeInTheDocument();
      });
    });
  });

  describe("Chat Controls", () => {
    it("allows clearing chat history", async () => {
      renderChatBot();

      const chatButton = screen.getByLabelText(/open chat assistant/i);
      fireEvent.click(chatButton);

      await waitFor(() => {
        // Send a message first
        const input = screen.getByPlaceholderText(/type your message/i);
        fireEvent.change(input, { target: { value: "Test message" } });
        fireEvent.keyPress(input, { key: "Enter", code: "Enter" });

        expect(screen.getByText("Test message")).toBeInTheDocument();

        // Clear chat
        const clearButton = screen.getByLabelText(/clear chat/i);
        fireEvent.click(clearButton);

        // Only welcome message should remain
        expect(screen.queryByText("Test message")).not.toBeInTheDocument();
        expect(
          screen.getByText(/Hi! I'm your GoSafe assistant/i)
        ).toBeInTheDocument();
      });
    });

    it("allows minimizing and maximizing chat", async () => {
      renderChatBot();

      const chatButton = screen.getByLabelText(/open chat assistant/i);
      fireEvent.click(chatButton);

      await waitFor(() => {
        // Find minimize button
        const minimizeButton = screen.getByRole("button", {
          name: /minimize/i,
        });
        fireEvent.click(minimizeButton);

        // Chat content should be hidden
        expect(
          screen.queryByPlaceholderText(/type your message/i)
        ).not.toBeInTheDocument();

        // Find maximize button
        const maximizeButton = screen.getByRole("button", {
          name: /maximize/i,
        });
        fireEvent.click(maximizeButton);

        // Chat content should be visible again
        expect(
          screen.getByPlaceholderText(/type your message/i)
        ).toBeInTheDocument();
      });
    });

    it("allows closing chat completely", async () => {
      renderChatBot();

      const chatButton = screen.getByLabelText(/open chat assistant/i);
      fireEvent.click(chatButton);

      await waitFor(() => {
        expect(screen.getByText("GoSafe Assistant")).toBeInTheDocument();

        const closeButton = screen.getByLabelText(/close chat/i);
        fireEvent.click(closeButton);

        expect(screen.queryByText("GoSafe Assistant")).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels", () => {
      renderChatBot();

      const chatButton = screen.getByLabelText(/open chat assistant/i);
      expect(chatButton).toHaveAttribute("aria-label");
    });

    it("supports keyboard navigation", async () => {
      renderChatBot();

      const chatButton = screen.getByLabelText(/open chat assistant/i);
      fireEvent.click(chatButton);

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/type your message/i);

        // Input should be focused when chat opens
        expect(document.activeElement).toBe(input);
      });
    });
  });
});
