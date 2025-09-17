import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
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

type VerificationState = "loading" | "success" | "error" | "invalid";

const EmailVerificationHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [verificationState, setVerificationState] =
    useState<VerificationState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const handleVerification = async () => {
      console.log(
        "EmailVerificationHandler - Current URL:",
        window.location.href
      );
      console.log(
        "EmailVerificationHandler - Location search:",
        location.search
      );
      console.log("EmailVerificationHandler - Location hash:", location.hash);

      try {
        // Check URL parameters for auth tokens (from Supabase redirect)
        const urlParams = new URLSearchParams(location.search);
        const hashParams = new URLSearchParams(location.hash.replace("#", ""));

        // Check both URL search params and hash for tokens
        const accessToken =
          urlParams.get("access_token") || hashParams.get("access_token");
        const refreshToken =
          urlParams.get("refresh_token") || hashParams.get("refresh_token");
        const tokenType =
          urlParams.get("token_type") || hashParams.get("token_type");
        const expiresIn =
          urlParams.get("expires_in") || hashParams.get("expires_in");
        const type = urlParams.get("type") || hashParams.get("type");

        console.log("EmailVerificationHandler - Extracted tokens:", {
          accessToken: accessToken ? "[PRESENT]" : "[MISSING]",
          refreshToken: refreshToken ? "[PRESENT]" : "[MISSING]",
          tokenType,
          expiresIn,
          type,
        });

        if (accessToken && refreshToken) {
          console.log(
            "EmailVerificationHandler - Setting session with extracted tokens"
          );

          // Set the session using the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("EmailVerificationHandler - Session error:", error);
            setVerificationState("error");
            setErrorMessage(error.message);
            return;
          }

          if (data.user) {
            console.log(
              "EmailVerificationHandler - User verified:",
              data.user.email
            );
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
                console.error(
                  "Error creating profile after verification:",
                  profileError
                );
              } else {
                console.log(
                  "EmailVerificationHandler - Profile created successfully"
                );
              }
            } catch (profileCreateError) {
              console.error("Error in profile creation:", profileCreateError);
            }

            toast({
              title: "Email Verified Successfully!",
              description:
                "Your account is now active. Redirecting to dashboard...",
              duration: 5000,
            });

            // Redirect to appropriate dashboard after verification
            setTimeout(() => {
              const userRole = data.user?.user_metadata?.role || "tourist";
              const dashboardPath =
                userRole === "admin"
                  ? "/admin"
                  : userRole === "authority"
                  ? "/authority"
                  : "/tourist";
              navigate(dashboardPath);
            }, 2000);
          } else {
            setVerificationState("error");
            setErrorMessage("Verification failed. No user data received.");
          }
        } else {
          // If no tokens in URL, this might be a direct visit
          setVerificationState("invalid");
          setErrorMessage(
            "No verification data found in URL. Please use the link from your email."
          );
        }
      } catch (error) {
        console.error("EmailVerificationHandler - Unexpected error:", error);
        setVerificationState("error");
        setErrorMessage("An unexpected error occurred during verification.");
      }
    };

    handleVerification();
  }, [location, navigate, toast]);

  const handleBackToAuth = () => {
    navigate("/auth?tab=signin");
  };

  const renderContent = () => {
    switch (verificationState) {
      case "loading":
        return (
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <h3 className="text-lg font-semibold">
              Processing verification...
            </h3>
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
              Your account is now active. Redirecting to your dashboard...
            </p>
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Welcome to GoSafe! You'll be redirected to your dashboard
                shortly.
              </AlertDescription>
            </Alert>
          </CardContent>
        );

      case "error":
      case "invalid":
      default:
        return (
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-red-700">
              Verification Issue
            </h3>
            <p className="text-muted-foreground">
              There was a problem processing your email verification.
            </p>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button onClick={handleBackToAuth} className="w-full">
                Go to Login Page
              </Button>
              <p className="text-xs text-muted-foreground">
                If you continue having issues, please contact support or try
                signing up again.
              </p>
            </div>
          </CardContent>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
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

export default EmailVerificationHandler;
