import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  MapPin,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Shield,
  Smartphone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StepProps {
  step: number;
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  color: string;
}

const Step: React.FC<StepProps> = ({
  step,
  icon: Icon,
  title,
  description,
  features,
  color,
}) => {
  return (
    <div className="relative">
      {/* Step Number */}
      <div
        className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 ${color} rounded-full flex items-center justify-center text-white font-bold text-sm z-10`}
      >
        {step}
      </div>

      <Card className="h-full hover:shadow-xl transition-all duration-300 border-primary/10">
        <CardContent className="p-6 text-center">
          {/* Icon */}
          <div
            className={`inline-flex p-4 rounded-full ${color
              .replace("bg-", "bg-")
              .replace("-500", "-100")} mb-4`}
          >
            <Icon className={`h-8 w-8 ${color.replace("bg-", "text-")}`} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-3">{title}</h3>

          {/* Description */}
          <p className="text-muted-foreground mb-4">{description}</p>

          {/* Features */}
          <ul className="space-y-2 text-sm">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

const HowItWorksSection: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      step: 1,
      icon: UserPlus,
      title: "Register",
      description:
        "Quick and secure registration with blockchain-backed digital ID creation",
      features: [
        "Personal details & emergency contacts",
        "Document verification",
        "QR code generation",
        "Multi-language support",
      ],
      color: "bg-blue-500",
    },
    {
      step: 2,
      icon: MapPin,
      title: "Travel with GoSafe",
      description:
        "Real-time tracking and geo-fence monitoring for comprehensive safety",
      features: [
        "Live location tracking",
        "Geo-fence alerts",
        "Safe zone notifications",
        "Route recommendations",
      ],
      color: "bg-green-500",
    },
    {
      step: 3,
      icon: AlertTriangle,
      title: "SOS & Rapid Response",
      description:
        "Instant emergency assistance with coordinated authority response",
      features: [
        "One-tap SOS activation",
        "Automatic location sharing",
        "Authority notification",
        "Real-time assistance",
      ],
      color: "bg-red-500",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-sm">
            Simple • Secure • Swift
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How GoSafe Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Three simple steps to complete tourist safety coverage across
            Northeast India
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connection Lines - Hidden on mobile */}
          <div className="hidden lg:block absolute top-16 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 opacity-30"></div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Step {...step} />

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-primary opacity-50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="text-center p-6 border-primary/10">
            <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Blockchain Security</h4>
            <p className="text-sm text-muted-foreground">
              Tamper-proof digital IDs with cryptographic verification
            </p>
          </Card>

          <Card className="text-center p-6 border-primary/10">
            <Smartphone className="h-8 w-8 text-primary mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Mobile First</h4>
            <p className="text-sm text-muted-foreground">
              Optimized for smartphones with offline capability
            </p>
          </Card>

          <Card className="text-center p-6 border-primary/10">
            <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Regional Coverage</h4>
            <p className="text-sm text-muted-foreground">
              Complete Northeast India coverage with local authorities
            </p>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            onClick={() => navigate("/auth?tab=signup")}
            className="text-lg px-8 py-6"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Start Your Registration
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Free registration • Complete setup in under 5 minutes
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
