import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import RegisterPage from "@/pages/auth/register";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("@/services/authService", () => {
  class AuthServiceMock {
    static getInstance() {
      return new AuthServiceMock();
    }
    async registerTourist() {
      return { id: "user-123", digitalId: "digital-123" };
    }
  }
  return { AuthService: AuthServiceMock };
});

jest.mock("@/components/ChatBotWrapper", () => ({
  ChatBotWrapper: () => null,
}));

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe("RegisterPage", () => {
  it("validates step 1 required fields", async () => {
    renderWithProviders(<RegisterPage />);

    const next = screen.getByRole("button", { name: /next/i });
    expect(next.getAttribute("disabled")).not.toBeNull();

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: "+919876543210" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/nationality/i), {
      target: { value: "Indian" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    expect(next.getAttribute("disabled")).toBeNull();
  });

  it("enforces min 2 contacts", async () => {
    renderWithProviders(<RegisterPage />);

    // advance to step 2
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: "+919876543210" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/nationality/i), {
      target: { value: "Indian" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    // Fill two contacts
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "Alice" } });
    fireEvent.change(inputs[1], { target: { value: "+919876543210" } });
    fireEvent.change(inputs[2], { target: { value: "Bob" } });
    fireEvent.change(inputs[3], { target: { value: "+919123456789" } });

    const next = screen.getByRole("button", { name: /next/i });
    expect(next.getAttribute("disabled")).toBeNull();
  });

  it("submits and redirects", async () => {
    renderWithProviders(<RegisterPage />);

    // step 1
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: "+919876543210" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/nationality/i), {
      target: { value: "Indian" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    // step 2
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "Alice" } });
    fireEvent.change(inputs[1], { target: { value: "+919876543210" } });
    fireEvent.change(inputs[2], { target: { value: "Bob" } });
    fireEvent.change(inputs[3], { target: { value: "+919123456789" } });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    // step 3
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    // step 4
    fireEvent.click(screen.getByLabelText(/confirm/i));
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(localStorage.getItem("currentTouristId")).toBeTruthy();
    });
  });
});
