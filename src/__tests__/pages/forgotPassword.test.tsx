import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import ResetPasswordPage from "@/pages/auth/reset-password";
import { AuthService } from "@/services/authService";

jest.mock("@/services/authService");
// Avoid rendering ChatBotWrapper (it uses AuthContext); stub it in AuthLayout
jest.mock("@/components/ChatBotWrapper", () => ({
  ChatBotWrapper: () => null,
}));
// Ensure reset page doesn't wait on Supabase session check
jest.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

const MockedAuthService = AuthService as jest.MockedClass<typeof AuthService>;

function renderWithRouter(
  ui: React.ReactElement,
  initialEntries = ["/auth/forgot-password"]
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/auth/forgot-password" element={ui} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Forgot & Reset Password Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock getInstance to return an object with required methods
    (AuthService.getInstance as jest.Mock).mockReturnValue({
      forgotPassword: jest.fn().mockResolvedValue(undefined),
      resetPassword: jest.fn().mockResolvedValue(undefined),
    });
  });

  it("shows success on valid email submission", async () => {
    renderWithRouter(<ForgotPasswordPage />);

    const input = screen.getByLabelText("Email");
    fireEvent.change(input, { target: { value: "user@example.com" } });

    const button = screen.getByRole("button", { name: /send reset link/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/a reset link has been sent/i)).toBeTruthy();
    });
  });

  it("shows validation error for invalid email", async () => {
    renderWithRouter(<ForgotPasswordPage />);

    const input = screen.getByLabelText("Email");
    fireEvent.change(input, { target: { value: "invalid" } });

    const button = screen.getByRole("button", { name: /send reset link/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeTruthy();
    });
  });

  it("validates reset mismatch and success", async () => {
    // Render reset page directly
    render(
      <MemoryRouter initialEntries={["/auth/reset-password"]}>
        <Routes>
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait until form fields are present (after token check resolves)
    const pwd = await screen.findByLabelText("New Password");
    const confirm = await screen.findByLabelText("Confirm Password");
    const button = screen.getByRole("button", { name: /reset password/i });

    fireEvent.change(pwd, { target: { value: "password123" } });
    fireEvent.change(confirm, { target: { value: "different" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/must match/i)).toBeTruthy();
    });

    fireEvent.change(confirm, { target: { value: "password123" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/redirecting to login/i)).toBeTruthy();
    });
  });
});
