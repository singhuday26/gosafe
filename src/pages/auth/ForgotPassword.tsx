import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Mail,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LanguageSelector from "@/components/LanguageSelector";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) {
        throw error;
      }

      setEmailSent(true);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for password reset instructions.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Password reset error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send reset email";

      if (errorMessage.includes("rate limit")) {
        setError(
          "Too many requests. Please wait a few minutes before trying again."
        );
      } else if (
        errorMessage.includes("not found") ||
        errorMessage.includes("not exist")
      ) {
        // Don't reveal if email exists for security reasons
        setEmailSent(true);
        toast({
          title: "Password Reset Email Sent",
          description:
            "If an account with this email exists, you will receive password reset instructions.",
          duration: 5000,
        });
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError("");
    }
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    setEmail("");
  };

  // Show success message if email was sent
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>

        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">
              Reset Email Sent
            </CardTitle>
            <CardDescription>
              Password reset instructions have been sent
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                We've sent password reset instructions to{" "}
                <strong>{email}</strong>. Please check your email and follow the
                link to reset your password.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or click below
                to try again.
              </p>

              <div className="space-y-2">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                >
                  Send Another Email
                </Button>

                <Link to="/auth/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary mr-2" />
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          </div>
          <CardDescription>
            Enter your email to receive password reset instructions
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleEmailChange}
                  className={`pl-10 ${error ? "border-destructive" : ""}`}
                  required
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                We'll send password reset instructions to this email address.
              </p>
            </div>

            {/* Reset Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending Email..." : "Send Reset Email"}
            </Button>

            {/* Back to Login Link */}
            <div className="text-center pt-4 border-t">
              <Link
                to="/auth/login"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </form>

          {/* Additional Help */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Need Help?</h4>
            <p className="text-xs text-muted-foreground mb-2">
              If you're having trouble with password reset:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you entered the correct email</li>
              <li>• Contact support if the issue persists</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
