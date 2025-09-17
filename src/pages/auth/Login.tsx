import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
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
import { AuthService } from "@/services/authService";
import LanguageSelector from "@/components/LanguageSelector";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const authService = AuthService.getInstance();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const [emailNotVerified, setEmailNotVerified] = useState(false);

  // Handle cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Check for success messages from registration
  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "registration_success") {
      toast({
        title: "Registration Successful",
        description:
          "Please check your email to verify your account before logging in.",
        duration: 5000,
      });
    } else if (message === "email_verified") {
      toast({
        title: "Email Verified",
        description: "Your email has been verified. You can now log in.",
        duration: 5000,
      });
    }
  }, [searchParams, toast]);

  const validateForm = (): boolean => {
    const newErrors = { email: "", password: "", general: "" };
    let isValid = true;

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setEmailNotVerified(false);
    setErrors({ email: "", password: "", general: "" });

    try {
      const user = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      // Success! Redirect based on role
      const redirectUrl = authService.getRedirectUrlForRole(user.role);

      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${user.role}`,
        duration: 3000,
      });

      navigate(redirectUrl);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";

      if (errorMessage === "EMAIL_NOT_VERIFIED") {
        setEmailNotVerified(true);
        setErrors({
          ...errors,
          general:
            "Your email address has not been verified. Please check your email for a verification link.",
        });
      } else if (errorMessage.includes("Invalid email or password")) {
        setErrors({
          ...errors,
          general:
            "Invalid email or password. Please check your credentials and try again.",
        });
      } else {
        setErrors({
          ...errors,
          general: errorMessage.replace("Login failed: ", ""),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    setResendLoading(true);

    try {
      await authService.resendVerification(formData.email);

      toast({
        title: "Verification Email Sent",
        description: "Please check your email for the verification link.",
        duration: 5000,
      });

      // Start 60-second cooldown
      setResendCooldown(60);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to resend verification email";

      toast({
        title: "Resend Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
      // Clear errors when user starts typing
      if (errors[field]) {
        setErrors({ ...errors, [field]: "" });
      }
      if (errors.general) {
        setErrors({ ...errors, general: "" });
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary mr-2" />
            <CardTitle className="text-2xl font-bold">GoSafe Login</CardTitle>
          </div>
          <CardDescription>
            Sign in to access your safety dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error Alert */}
            {errors.general && (
              <Alert variant={emailNotVerified ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
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
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  className={`pl-10 ${
                    errors.email ? "border-destructive" : ""
                  }`}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  className={`pl-10 pr-10 ${
                    errors.password ? "border-destructive" : ""
                  }`}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Email Verification Section */}
            {emailNotVerified && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="space-y-2">
                  <p>Your email needs to be verified before you can log in.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={resendLoading || resendCooldown > 0}
                    className="w-full"
                  >
                    {resendLoading
                      ? "Sending..."
                      : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend Verification Email"}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Login Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Link
                to="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/auth/register"
                  className="text-primary hover:underline font-medium"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
