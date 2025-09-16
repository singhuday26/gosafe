import React, { useState } from "react";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AuthService } from "@/services/authService";

const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email");

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = emailSchema.safeParse(email.trim());
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Invalid email");
      return;
    }

    setLoading(true);
    try {
      // Always show success regardless of whether the email exists
      await AuthService.getInstance().forgotPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      // Prevent enumeration; show generic message
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Forgot your password?</CardTitle>
        <CardDescription>
          Enter your email and we'll send you a reset link.
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={onSubmit}
        className="space-y-4 mt-2"
        aria-label="forgot-password-form"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="pl-10"
              required
            />
          </div>
        </div>

        {error && (
          <Alert role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert role="status">
            <AlertDescription>
              If an account exists, a reset link has been sent.
            </AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Sending…" : "Send Reset Link"}
        </Button>

        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={() => navigate("/auth")}
          >
            Back to Login
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
