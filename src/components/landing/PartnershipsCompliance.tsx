import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Award,
  CheckCircle,
  ExternalLink,
  Lock,
  Globe,
  Building2,
  Verified,
} from "lucide-react";

interface PartnershipProps {
  name: string;
  logo: string;
  description: string;
  type: "ministry" | "compliance" | "technology";
  verified: boolean;
}

interface ComplianceProps {
  title: string;
  description: string;
  status: "implemented" | "in-progress" | "certified";
  icon: React.ElementType;
}

const PartnershipsCompliance: React.FC = () => {
  const partnerships: PartnershipProps[] = [
    {
      name: "Ministry of Tourism",
      logo: "🏛️",
      description: "Official tourism safety initiative partner",
      type: "ministry",
      verified: true,
    },
    {
      name: "Ministry of Home Affairs",
      logo: "🛡️",
      description: "Emergency response coordination",
      type: "ministry",
      verified: true,
    },
    {
      name: "Ministry of Electronics & IT",
      logo: "💻",
      description: "Digital India and blockchain integration",
      type: "ministry",
      verified: true,
    },
    {
      name: "North Eastern Council",
      logo: "🏔️",
      description: "Regional development and coordination",
      type: "ministry",
      verified: true,
    },
    {
      name: "DPDP Act 2023",
      logo: "📋",
      description: "Data protection and privacy compliance",
      type: "compliance",
      verified: true,
    },
    {
      name: "Blockchain Council of India",
      logo: "⛓️",
      description: "Blockchain technology certification",
      type: "technology",
      verified: true,
    },
  ];

  const compliances: ComplianceProps[] = [
    {
      title: "DPDP Act 2023 Compliance",
      description:
        "Full compliance with Digital Personal Data Protection Act 2023 including consent management, data minimization, and user rights",
      status: "certified",
      icon: Shield,
    },
    {
      title: "Blockchain Security Standards",
      description:
        "Cryptographic verification and tamper-proof digital identity following national blockchain standards",
      status: "implemented",
      icon: Lock,
    },
    {
      title: "ISO 27001 Information Security",
      description:
        "International standard for information security management systems implementation",
      status: "in-progress",
      icon: Award,
    },
    {
      title: "Digital India Framework",
      description:
        "Alignment with Digital India initiatives and government interoperability standards",
      status: "certified",
      icon: Globe,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "certified":
        return "bg-green-100 text-green-800 border-green-200";
      case "implemented":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ministry":
        return "bg-blue-50 border-blue-200";
      case "compliance":
        return "bg-green-50 border-green-200";
      case "technology":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-sm">
              <Verified className="mr-1 h-4 w-4" />
              Trusted & Verified
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Partnerships & Compliance
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Official government partnerships and comprehensive compliance with
              national standards ensure the highest levels of security and
              trust.
            </p>
          </div>

          {/* Government Partnerships */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-8 text-center">
              Official Government Partners
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {partnerships
                .filter((p) => p.type === "ministry")
                .map((partner, index) => (
                  <Card
                    key={index}
                    className={`${getTypeColor(
                      partner.type
                    )} border-2 hover:shadow-lg transition-all duration-300`}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{partner.logo}</div>
                      <h4 className="font-bold mb-2 text-sm">{partner.name}</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        {partner.description}
                      </p>
                      {partner.verified && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Compliance Standards */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-8 text-center">
              Compliance & Standards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {compliances.map((compliance, index) => (
                <Card
                  key={index}
                  className="border-primary/10 hover:shadow-lg transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <compliance.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold">{compliance.title}</h4>
                          <Badge className={getStatusColor(compliance.status)}>
                            {compliance.status === "certified" && "✓ "}
                            {compliance.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {compliance.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Technology Partners */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-8 text-center">
              Technology & Compliance Partners
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {partnerships
                .filter((p) => p.type !== "ministry")
                .map((partner, index) => (
                  <Card
                    key={index}
                    className={`${getTypeColor(partner.type)} border-2`}
                  >
                    <CardContent className="flex items-center space-x-4 p-6">
                      <div className="text-3xl">{partner.logo}</div>
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">{partner.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {partner.description}
                        </p>
                      </div>
                      {partner.verified && (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Security Highlights */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">
                  Enterprise-Grade Security
                </h3>
                <p className="text-muted-foreground">
                  GoSafe meets the highest standards of security and compliance
                  required for government partnerships
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Government Grade</h4>
                  <p className="text-sm text-muted-foreground">
                    Ministry-approved security protocols
                  </p>
                </div>
                <div className="text-center">
                  <Lock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Blockchain Secured</h4>
                  <p className="text-sm text-muted-foreground">
                    Tamper-proof digital identity
                  </p>
                </div>
                <div className="text-center">
                  <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">DPDP Compliant</h4>
                  <p className="text-sm text-muted-foreground">
                    Full privacy protection compliance
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.open("/compliance-details", "_blank")}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  View Compliance Details
                </Button>
                <Button
                  onClick={() =>
                    window.open("https://www.sih.gov.in/", "_blank")
                  }
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Smart India Hackathon
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PartnershipsCompliance;
