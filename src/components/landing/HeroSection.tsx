import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, UserCheck, Play, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const handleRegisterTourist = () => {
    navigate("/blockchain-tourist-registration");
  };

  const handleAuthorityLogin = () => {
    if (user) {
      navigate("/authority");
    } else {
      navigate("/auth/authority");
    }
  };

  const handleViewDemo = () => {
    navigate("/demo");
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 min-h-[80vh] flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>

      {/* Mountain Silhouette for Northeast Theme */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/20 to-transparent opacity-30"></div>

      <div className="relative container mx-auto px-4 py-20 text-center">
        {/* SIH Badge */}
        <Badge
          variant="secondary"
          className="mb-6 bg-primary/10 text-primary border-primary/20 font-medium text-sm px-4 py-2"
        >
          <Shield className="mr-2 h-4 w-4" />
          Smart India Hackathon 2025 • PS25002
        </Badge>

        {/* Main Tagline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="text-ne-tea-brown font-black text-5xl md:text-7xl lg:text-8xl">
            GoSafe
          </span>
          <span className="text-foreground"> — </span>
          <br className="hidden sm:block" />
          <span className="text-foreground text-3xl md:text-5xl lg:text-6xl">
            Digital Tourist Safety
          </span>
        </h1>

        {/* Solid Motto */}
        <div className="mb-8">
          <p className="text-2xl md:text-3xl font-bold text-foreground italic">
            "Your Safety, Our Priority - Protecting Every Journey"
          </p>
        </div>

        {/* Value Propositions */}
        <div className="max-w-4xl mx-auto mb-8 space-y-3">
          <p className="text-xl md:text-2xl text-muted-foreground">
            <strong className="text-foreground">
              Blockchain-secured digital IDs
            </strong>{" "}
            and
            <strong className="text-foreground">
              {" "}
              real-time geo-fencing
            </strong>{" "}
            for complete tourist protection
          </p>
          <p className="text-lg md:text-xl text-muted-foreground">
            Instant SOS alerts • Multi-language support • Authority coordination
            • 24/7 monitoring
          </p>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 max-w-2xl mx-auto">
          <Button
            size="lg"
            className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={handleRegisterTourist}
          >
            <UserCheck className="mr-2 h-5 w-5" />
            Register as Tourist
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={handleAuthorityLogin}
          >
            <Shield className="mr-2 h-5 w-5" />
            Authority Login
          </Button>
        </div>

        {/* Secondary CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="ghost"
            size="lg"
            className="text-primary hover:text-primary/80 text-lg font-medium"
            onClick={handleViewDemo}
          >
            <Play className="mr-2 h-5 w-5" />
            View Live Demo
            <span className="ml-2 text-sm text-muted-foreground">
              (No signup required)
            </span>
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-3 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">&lt;2min</div>
            <div className="text-sm text-muted-foreground">
              Emergency Response
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">22</div>
            <div className="text-sm text-muted-foreground">
              Languages Supported
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Monitoring</div>
          </div>
        </div>

        {/* Visual Elements */}
        <div className="absolute top-10 right-10 opacity-20 hidden lg:block">
          <MapPin className="h-24 w-24 text-primary animate-pulse" />
        </div>
        <div className="absolute bottom-10 left-10 opacity-20 hidden lg:block">
          <Shield
            className="h-20 w-20 text-secondary animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
