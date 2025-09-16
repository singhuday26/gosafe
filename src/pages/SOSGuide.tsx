import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  Shield,
  ArrowLeft,
  Smartphone,
  Users,
  Navigation,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SOSGuide: React.FC = () => {
  const navigate = useNavigate();

  const emergencySteps = [
    {
      step: 1,
      title: "Activate SOS",
      description: "Tap the red SOS button in the GoSafe app",
      icon: AlertTriangle,
      details: [
        "Long press for 3 seconds",
        "Voice activation: 'Hey GoSafe Emergency'",
        "Shake phone 5 times rapidly",
      ],
    },
    {
      step: 2,
      title: "Location Shared",
      description: "Your exact GPS coordinates are automatically transmitted",
      icon: MapPin,
      details: [
        "Real-time location tracking",
        "Backup location methods",
        "Offline location caching",
      ],
    },
    {
      step: 3,
      title: "Authorities Notified",
      description: "Local police and emergency services receive instant alerts",
      icon: Shield,
      details: [
        "Local police station",
        "Tourist helpline",
        "Emergency contacts",
      ],
    },
    {
      step: 4,
      title: "Help Dispatched",
      description: "Nearest available help is coordinated and dispatched",
      icon: Users,
      details: [
        "Response time: <5 minutes",
        "Multi-language support",
        "Real-time updates",
      ],
    },
  ];

  const emergencyNumbers = [
    {
      name: "Police",
      number: "100",
      description: "For immediate police assistance",
    },
    {
      name: "Medical Emergency",
      number: "108",
      description: "Ambulance and medical help",
    },
    {
      name: "Tourist Helpline",
      number: "1363",
      description: "24/7 tourist assistance",
    },
    {
      name: "GoSafe Emergency",
      number: "+91-8800-GOSAFE",
      description: "Direct GoSafe emergency line",
    },
    {
      name: "Women's Helpline",
      number: "1091",
      description: "Women in distress",
    },
    {
      name: "Fire Service",
      number: "101",
      description: "Fire and rescue services",
    },
  ];

  const safetyTips = [
    {
      title: "Keep App Updated",
      description:
        "Ensure GoSafe app is always updated for latest safety features",
    },
    {
      title: "Enable Location",
      description: "Keep GPS enabled for accurate emergency location sharing",
    },
    {
      title: "Test SOS Feature",
      description:
        "Familiarize yourself with SOS activation in safe environment",
    },
    {
      title: "Emergency Contacts",
      description: "Add and verify local emergency contacts in your profile",
    },
    {
      title: "Network Backup",
      description: "Download offline maps for areas with poor connectivity",
    },
    {
      title: "Regular Check-ins",
      description: "Use scheduled check-in feature for solo travel",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-red-50 to-red-100 py-12">
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
              <Badge variant="destructive" className="mb-4">
                <AlertTriangle className="mr-1 h-4 w-4" />
                Emergency Guide
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-red-700">
                SOS Quick Guide
              </h1>
              <p className="text-xl text-red-600 mb-6">
                Essential information for emergency situations in Northeast
                India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Alert */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Alert className="border-red-200 bg-red-50 mb-8">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <strong>In immediate danger?</strong> Call 100 (Police) or 108
                (Medical Emergency) directly. Use GoSafe SOS for
                non-life-threatening emergencies and location sharing.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* How SOS Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How GoSafe SOS Works</h2>
              <p className="text-xl text-muted-foreground">
                Four simple steps to get help when you need it most
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {emergencySteps.map((step, index) => (
                <Card
                  key={index}
                  className="relative border-2 border-red-100 hover:border-red-200 transition-colors"
                >
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {step.step}
                  </div>
                  <CardHeader className="text-center pt-8">
                    <div className="bg-red-100 p-3 rounded-full inline-flex mx-auto mb-4">
                      <step.icon className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-center">
                      {step.description}
                    </p>
                    <ul className="space-y-1 text-sm">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center">
                          <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                          {detail}
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

      {/* Emergency Numbers */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Emergency Contact Numbers
              </h2>
              <p className="text-xl text-muted-foreground">
                Important numbers to save in your phone
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyNumbers.map((contact, index) => (
                <Card key={index} className="border-primary/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{contact.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {contact.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <a
                          href={`tel:${contact.number}`}
                          className="text-2xl font-bold text-primary hover:text-primary/80"
                        >
                          {contact.number}
                        </a>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Phone className="h-3 w-3 mr-1" />
                          Tap to call
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Safety Preparation Tips
              </h2>
              <p className="text-xl text-muted-foreground">
                Best practices for staying safe while traveling
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {safetyTips.map((tip, index) => (
                <Card key={index} className="border-primary/10">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-bold mb-2">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tip.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What to Do */}
      <section className="py-16 bg-gradient-to-r from-red-50 to-red-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-red-200">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-red-700">
                  During an Emergency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-red-100 p-4 rounded-full inline-flex mb-4">
                      <Smartphone className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="font-bold mb-2">Stay Calm</h3>
                    <p className="text-sm text-muted-foreground">
                      Keep your phone charged and accessible. Take deep breaths.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-100 p-4 rounded-full inline-flex mb-4">
                      <Navigation className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="font-bold mb-2">Share Location</h3>
                    <p className="text-sm text-muted-foreground">
                      Use GoSafe to share your exact location with authorities.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-100 p-4 rounded-full inline-flex mb-4">
                      <Clock className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="font-bold mb-2">Stay Connected</h3>
                    <p className="text-sm text-muted-foreground">
                      Keep the app open and follow instructions from responders.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-red-200">
                  <h4 className="font-bold mb-3 text-red-700">Remember:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Your safety is the top priority</li>
                    <li>• Help is on the way once you activate SOS</li>
                    <li>
                      • GoSafe works even with limited network connectivity
                    </li>
                    <li>
                      • Multiple backup systems ensure your message gets through
                    </li>
                    <li>• Emergency contacts are automatically notified</li>
                  </ul>
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
            <h2 className="text-3xl font-bold mb-4">Download GoSafe Today</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Be prepared for any situation while traveling in Northeast India
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth?tab=signup")}>
                <Shield className="mr-2 h-5 w-5" />
                Register for GoSafe
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/")}>
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SOSGuide;
