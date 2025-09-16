import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import ResetPasswordPage from "@/pages/auth/reset-password";
import { AuthService } from "@/services/authService";

jest.mock("@/services/authService");

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

    const pwd = screen.getByLabelText("New Password");
    const confirm = screen.getByLabelText("Confirm Password");
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
