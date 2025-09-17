import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Shield,
  Mail,
  Lock,
  User,
  Phone,
  Building,
  Eye,
  EyeOff,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import LanguageSelector from "@/components/LanguageSelector";

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const authService = AuthService.getInstance();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    role: "tourist" as "tourist" | "admin" | "authority",
    organization: "",
    nationality: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    organization: "",
    general: "",
  });

  const validateForm = (): boolean => {
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      phone: "",
      organization: "",
      general: "",
    };
    let isValid = true;

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    // Phone validation (optional but format check if provided)
    if (
      formData.phone &&
      !/^[+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    // Organization validation for authority/admin roles
    if (
      (formData.role === "authority" || formData.role === "admin") &&
      !formData.organization.trim()
    ) {
      newErrors.organization = "Organization is required for this role";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      phone: "",
      organization: "",
      general: "",
    });

    try {
      // For authority role, we need to handle differently since register() doesn't support it
      if (formData.role === "authority") {
        // Create basic auth user first
        const { data, error } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              role: "authority",
            },
            emailRedirectTo: `${window.location.origin}/auth/verify`,
          },
        });

        if (error) throw new Error(error.message);
        if (!data.user) throw new Error("Failed to create user account");

        // Create profile in profiles table
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: data.user.id,
          full_name: formData.name,
          phone_number: formData.phone || null,
          role: "authority",
          organization: formData.organization || null,
        });

        if (profileError) {
          console.warn("Profile creation failed:", profileError);
        }
      } else {
        // Register user for tourist/admin - this will send verification email automatically
        await authService.register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone || undefined,
          role: formData.role as "tourist" | "admin",
        });

        // For tourists, also create digital tourist ID if needed
        if (formData.role === "tourist") {
          try {
            await authService.registerTourist({
              email: formData.email,
              password: formData.password,
              name: formData.name,
              phone: formData.phone || undefined,
              nationality: formData.nationality || undefined,
              role: "tourist",
              emergencyContactsJson: JSON.stringify([]), // Default empty array
            });
          } catch (touristError) {
            console.warn("Failed to create digital tourist ID:", touristError);
            // Continue with registration success even if digital ID creation fails
          }
        }
      }

      setRegistrationSuccess(true);

      toast({
        title: "Registration Successful!",
        description:
          "Please check your email to verify your account before logging in.",
        duration: 5000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";

      if (
        errorMessage.includes("already registered") ||
        errorMessage.includes("already exists")
      ) {
        setErrors({
          ...errors,
          email: "This email is already registered. Try logging in instead.",
        });
      } else {
        setErrors({
          ...errors,
          general: errorMessage.replace("Registration failed: ", ""),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
      // Clear errors when user starts typing
      if (errors[field as keyof typeof errors]) {
        setErrors({ ...errors, [field as keyof typeof errors]: "" });
      }
      if (errors.general) {
        setErrors({ ...errors, general: "" });
      }
    };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value as "tourist" | "admin" | "authority",
    });
    // Clear organization error if role changes
    if (errors.organization) {
      setErrors({ ...errors, organization: "" });
    }
  };

  // Show success message if registration completed
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">
              Registration Successful!
            </CardTitle>
            <CardDescription>
              Welcome to GoSafe Tourist Safety Platform
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                We've sent a verification email to{" "}
                <strong>{formData.email}</strong>. Please check your email and
                click the verification link before logging in.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or contact
                support.
              </p>

              <Button
                onClick={() =>
                  navigate("/auth/login?message=registration_success")
                }
                className="w-full"
              >
                Go to Login
              </Button>
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
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          </div>
          <CardDescription>
            Join GoSafe for secure tourist safety management
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error Alert */}
            {errors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
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

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
                  required
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number (optional)"
                  value={formData.phone}
                  onChange={handleInputChange("phone")}
                  className={`pl-10 ${
                    errors.phone ? "border-destructive" : ""
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">Account Type *</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tourist">Tourist</SelectItem>
                  <SelectItem value="authority">Tourism Authority</SelectItem>
                  <SelectItem value="admin">System Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Organization Field (for authority/admin) */}
            {(formData.role === "authority" || formData.role === "admin") && (
              <div className="space-y-2">
                <Label htmlFor="organization">Organization *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="organization"
                    type="text"
                    placeholder="Enter your organization name"
                    value={formData.organization}
                    onChange={handleInputChange("organization")}
                    className={`pl-10 ${
                      errors.organization ? "border-destructive" : ""
                    }`}
                    required
                  />
                </div>
                {errors.organization && (
                  <p className="text-sm text-destructive">
                    {errors.organization}
                  </p>
                )}
              </div>
            )}

            {/* Nationality Field (for tourists) */}
            {formData.role === "tourist" && (
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  type="text"
                  placeholder="Enter your nationality (optional)"
                  value={formData.nationality}
                  onChange={handleInputChange("nationality")}
                />
              </div>
            )}

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
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
              <p className="text-xs text-muted-foreground">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange("confirmPassword")}
                  className={`pl-10 pr-10 ${
                    errors.confirmPassword ? "border-destructive" : ""
                  }`}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Register Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/auth/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
