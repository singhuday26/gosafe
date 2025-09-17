import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LovableRedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we're on a Lovable domain or redirect
    const currentUrl = window.location.href;
    const isLovableRedirect =
      currentUrl.includes("lovable.dev") ||
      currentUrl.includes("sandbox.lovable.dev");

    console.log("LovableRedirectHandler - Current URL:", currentUrl);
    console.log(
      "LovableRedirectHandler - Is Lovable redirect:",
      isLovableRedirect
    );

    if (isLovableRedirect) {
      // Extract any auth tokens from the URL
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(
        window.location.hash.replace("#", "")
      );

      const accessToken =
        urlParams.get("access_token") || hashParams.get("access_token");
      const refreshToken =
        urlParams.get("refresh_token") || hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        // Redirect to our verification handler with the tokens
        const localUrl = `http://localhost:8080/auth/verify#access_token=${accessToken}&refresh_token=${refreshToken}&token_type=bearer&type=signup`;
        console.log(
          "LovableRedirectHandler - Redirecting to local URL:",
          localUrl
        );
        window.location.href = localUrl;
      }
    }
  }, []);

  const handleManualRedirect = () => {
    // If user clicks manual redirect, go to our auth page
    navigate("/auth?tab=signin&message=verification_complete");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary mr-2" />
            <CardTitle className="text-2xl font-bold">
              Redirect Detected
            </CardTitle>
          </div>
          <CardDescription>
            You've been redirected from the email verification
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              It looks like you clicked an email verification link. We're
              processing your verification now.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              If you're not automatically redirected, click the button below:
            </p>

            <Button onClick={handleManualRedirect} className="w-full">
              Continue to GoSafe
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Having trouble? Try refreshing the page or contact support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LovableRedirectHandler;
