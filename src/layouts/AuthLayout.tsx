import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, HelpCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AuthLayoutProps {
  children?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary mr-3" />
              <div>
                <h1 className="text-xl font-bold">GoSafe</h1>
                <p className="text-sm text-muted-foreground">
                  Tourist Safety Platform
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/help")}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="sm">
                <Globe className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Auth Card Container */}
          <Card className="p-6 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            {children || <Outlet />}
          </Card>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Contact{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-sm"
                onClick={() => navigate("/contact")}
              >
                support
              </Button>{" "}
              or call <span className="font-semibold">1363</span>
            </p>
          </div>
        </div>
      </main>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Footer */}
      <footer className="bg-card/80 backdrop-blur-sm border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-4 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Powered by GoSafe - Smart India Hackathon 2025
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Securing tourists with blockchain technology and AI-powered
                safety
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
