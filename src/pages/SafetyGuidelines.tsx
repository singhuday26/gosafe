import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Phone,
  Eye,
  Mountain,
  Users,
  Smartphone,
  Clock,
  Heart,
  Backpack,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SafetyGuidelines: React.FC = () => {
  const navigate = useNavigate();

  const generalSafety = [
    {
      icon: Smartphone,
      title: "Keep Your Phone Charged",
      description: "Maintain battery above 20% and carry power banks",
      tips: [
        "Use airplane mode to conserve battery",
        "Download offline maps",
        "Keep emergency numbers saved",
      ],
    },
    {
      icon: MapPin,
      title: "Share Your Location",
      description: "Keep trusted contacts informed about your whereabouts",
      tips: [
        "Use GoSafe real-time tracking",
        "Check in regularly",
        "Share itinerary with family",
      ],
    },
    {
      icon: Users,
      title: "Travel in Groups",
      description: "Avoid traveling alone, especially in remote areas",
      tips: [
        "Join guided tours when possible",
        "Buddy system for activities",
        "Stay connected with group members",
      ],
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Keep important documents secure and accessible",
      tips: [
        "Digital copies in cloud storage",
        "Physical copies in separate bags",
        "Emergency contact information",
      ],
    },
  ];

  const regionalSafety = [
    {
      region: "Assam",
      risks: ["Flash floods during monsoon", "Wildlife in national parks"],
      precautions: [
        "Check weather updates",
        "Follow park guidelines",
        "Avoid night travel in rural areas",
      ],
    },
    {
      region: "Arunachal Pradesh",
      risks: ["High altitude sickness", "Border area restrictions"],
      precautions: [
        "Carry valid permits",
        "Acclimatize gradually",
        "Respect local customs",
      ],
    },
    {
      region: "Meghalaya",
      risks: ["Heavy rainfall", "Cave exploration hazards"],
      precautions: [
        "Waterproof gear essential",
        "Professional guides for caves",
        "Check road conditions",
      ],
    },
    {
      region: "Sikkim",
      risks: ["Mountain weather changes", "Altitude-related issues"],
      precautions: ["Layer clothing", "Stay hydrated", "Avoid overexertion"],
    },
  ];

  const emergencyPrep = [
    {
      icon: Heart,
      title: "Medical Preparedness",
      items: [
        "Basic first aid kit",
        "Personal medications",
        "Health insurance cards",
        "Blood type information",
      ],
    },
    {
      icon: Backpack,
      title: "Emergency Kit",
      items: [
        "Flashlight and batteries",
        "Whistle for signaling",
        "Emergency blanket",
        "Water purification tablets",
      ],
    },
    {
      icon: Phone,
      title: "Communication Plan",
      items: [
        "Emergency contact list",
        "Local authority numbers",
        "Embassy contacts",
        "GoSafe emergency features",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>

            <div className="text-center">
              <Badge variant="secondary" className="mb-4">
                <Shield className="mr-1 h-4 w-4" />
                Tourist Safety
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-green-700">
                Safety Guidelines
              </h1>
              <p className="text-xl text-green-600 mb-6">
                Essential safety information for traveling in Northeast India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Important Alert */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Alert className="border-orange-200 bg-orange-50 mb-8">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                <strong>Before You Travel:</strong> Register with GoSafe
                platform, inform local authorities of your travel plans, and
                ensure you have valid permits for restricted areas.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* General Safety Guidelines */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                General Safety Guidelines
              </h2>
              <p className="text-xl text-muted-foreground">
                Essential practices for safe travel in Northeast India
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generalSafety.map((item, index) => (
                <Card key={index} className="border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded-lg mr-3">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {item.description}
                    </p>
                    <ul className="space-y-2">
                      {item.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Regional Safety Information */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Regional Safety Information
              </h2>
              <p className="text-xl text-muted-foreground">
                Specific considerations for different northeastern states
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {regionalSafety.map((region, index) => (
                <Card key={index} className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mountain className="h-5 w-5 mr-2 text-orange-600" />
                      {region.region}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-red-700 mb-2">
                          Common Risks:
                        </h4>
                        <ul className="space-y-1">
                          {region.risks.map((risk, riskIndex) => (
                            <li
                              key={riskIndex}
                              className="text-sm text-muted-foreground flex items-center"
                            >
                              <AlertTriangle className="h-3 w-3 mr-2 text-red-500" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-700 mb-2">
                          Precautions:
                        </h4>
                        <ul className="space-y-1">
                          {region.precautions.map((precaution, precIndex) => (
                            <li
                              key={precIndex}
                              className="text-sm text-muted-foreground flex items-center"
                            >
                              <Shield className="h-3 w-3 mr-2 text-green-500" />
                              {precaution}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Preparedness */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Emergency Preparedness
              </h2>
              <p className="text-xl text-muted-foreground">
                Be prepared for unexpected situations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {emergencyPrep.map((category, index) => (
                <Card key={index} className="border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-700">
                      <category.icon className="h-5 w-5 mr-2" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="text-sm flex items-center"
                        >
                          <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Weather and Seasonal Guidelines */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-blue-700">
                  Weather & Seasonal Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold mb-3 text-blue-700">
                      Monsoon Season (June-September)
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                        Heavy rainfall and flooding possible
                      </li>
                      <li className="flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-green-500" />
                        Carry waterproof gear and clothing
                      </li>
                      <li className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-blue-500" />
                        Check road conditions before travel
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold mb-3 text-blue-700">
                      Winter Season (December-February)
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                        Cold temperatures in higher altitudes
                      </li>
                      <li className="flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-green-500" />
                        Pack warm clothing and layers
                      </li>
                      <li className="flex items-center">
                        <Eye className="h-4 w-4 mr-2 text-purple-500" />
                        Limited visibility due to fog
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Safe with GoSafe</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Download the GoSafe app and register for comprehensive safety
              coverage
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth?tab=signup")}>
                <Shield className="mr-2 h-5 w-5" />
                Register Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/sos-guide")}
              >
                <AlertTriangle className="mr-2 h-5 w-5" />
                Emergency Guide
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SafetyGuidelines;
