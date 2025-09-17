import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LanguageSelector from "@/components/LanguageSelector";

type VerificationState =
  | "loading"
  | "success"
  | "error"
  | "expired"
  | "invalid"
  | "already_verified";

const EmailVerify = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [verificationState, setVerificationState] =
    useState<VerificationState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get the tokens from URL parameters
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");
        const next = searchParams.get("next") || "/";

        // If no token_hash, this might be a direct visit
        if (!token_hash || type !== "email") {
          setVerificationState("invalid");
          setErrorMessage(
            "Invalid verification link. Please check your email for the correct link."
          );
          return;
        }

        // Verify the email using Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: "email",
        });

        if (error) {
          console.error("Email verification error:", error);

          if (error.message.includes("expired")) {
            setVerificationState("expired");
            setErrorMessage(
              "Verification link has expired. Please request a new one."
            );
          } else if (error.message.includes("invalid")) {
            setVerificationState("invalid");
            setErrorMessage(
              "Invalid verification link. Please check your email for the correct link."
            );
          } else if (error.message.includes("already confirmed")) {
            setVerificationState("already_verified");
            setErrorMessage("This email has already been verified.");
          } else {
            setVerificationState("error");
            setErrorMessage(
              error.message || "Verification failed. Please try again."
            );
          }
          return;
        }

        if (data.user) {
          setUserEmail(data.user.email || "");
          setVerificationState("success");

          // Create user profile after successful verification
          try {
            const userData = data.user.user_metadata || {};
            const profileData = {
              user_id: data.user.id,
              full_name: userData.full_name || "",
              role: userData.role || "tourist",
              phone_number: userData.phone_number || "",
              organization: userData.organization || "",
            };

            const { error: profileError } = await supabase
              .from("profiles")
              .insert([profileData]);

            if (profileError && profileError.code !== "23505") {
              // Ignore duplicate key errors
              console.error(
                "Error creating profile after verification:",
                profileError
              );
            }
          } catch (profileCreateError) {
            console.error("Error in profile creation:", profileCreateError);
            // Don't fail verification if profile creation fails
          }

          toast({
            title: "Email Verified Successfully!",
            description: "Your account is now active. You can sign in.",
            duration: 5000,
          });

          // Redirect to login page after a short delay
          setTimeout(() => {
            navigate("/auth/login?message=email_verified");
          }, 2000);
        } else {
          setVerificationState("error");
          setErrorMessage("Verification failed. No user data received.");
        }
      } catch (error) {
        console.error("Verification process error:", error);
        setVerificationState("error");
        setErrorMessage("An unexpected error occurred during verification.");
      }
    };

    handleEmailVerification();
  }, [searchParams, navigate, toast]);

  const handleResendVerification = () => {
    navigate("/auth/login?action=resend");
  };

  const handleBackToLogin = () => {
    navigate("/auth/login");
  };

  const renderContent = () => {
    switch (verificationState) {
      case "loading":
        return (
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Verifying your email...</h3>
            <p className="text-muted-foreground">
              Please wait while we confirm your email address.
            </p>
          </CardContent>
        );

      case "success":
        return (
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-green-700">
              Email Verified Successfully!
            </h3>
            <p className="text-muted-foreground">
              {userEmail && (
                <>
                  <strong>{userEmail}</strong> has been verified.
                  <br />
                </>
              )}
              Your account is now active and you can sign in.
            </p>
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Redirecting to login page in a moment...
              </AlertDescription>
            </Alert>
            <Button onClick={handleBackToLogin} className="w-full">
              Continue to Login
            </Button>
          </CardContent>
        );

      case "already_verified":
        return (
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-blue-700">
              Already Verified
            </h3>
            <p className="text-muted-foreground">
              This email address has already been verified. You can sign in to
              your account.
            </p>
            <Button onClick={handleBackToLogin} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        );

      case "expired":
        return (
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-orange-700">
              Verification Link Expired
            </h3>
            <p className="text-muted-foreground">
              Your verification link has expired for security reasons. Please
              request a new verification email.
            </p>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button onClick={handleResendVerification} className="w-full">
                Request New Verification Email
              </Button>
              <Button
                variant="outline"
                onClick={handleBackToLogin}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        );

      case "invalid":
      case "error":
      default:
        return (
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-red-700">
              Verification Failed
            </h3>
            <p className="text-muted-foreground">
              We couldn't verify your email address. This could be due to an
              invalid or corrupted verification link.
            </p>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button onClick={handleResendVerification} className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Request New Verification Email
              </Button>
              <Button
                variant="outline"
                onClick={handleBackToLogin}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        );
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
            <CardTitle className="text-2xl font-bold">
              Email Verification
            </CardTitle>
          </div>
          <CardDescription>GoSafe Tourist Safety Platform</CardDescription>
        </CardHeader>

        {renderContent()}
      </Card>
    </div>
  );
};

export default EmailVerify;
