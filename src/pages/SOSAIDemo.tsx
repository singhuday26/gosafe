import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Shield, MapPin, Clock, AlertTriangle } from "lucide-react";
import { EnhancedSOSButton } from "@/components/sos/EnhancedSOSButton";
import { TouristRiskIndex } from "@/components/dashboard/TouristRiskIndex";
import { useToast } from "@/hooks/use-toast";

interface SOSData {
  sosId: string;
  riskProfile: {
    riskLevel: string;
    riskScore: number;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  deviceContext: {
    batteryLevel: number;
    networkStrength: number;
  };
}

export const SOSAIDemo: React.FC = () => {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [sosData, setSOSData] = useState<SOSData | null>(null);
  const { toast } = useToast();

  const handleSOSTrigger = (data: SOSData) => {
    setSOSData(data);
    setIsSOSActive(true);
    toast({
      title: "🚨 SOS Demo Triggered!",
      description:
        "This is a demonstration of the enhanced SOS system with AI risk assessment.",
      duration: 5000,
    });
  };

  const simulateLocationWarning = () => {
    toast({
      title: "⚠️ High Risk Area Detected",
      description:
        "You are entering an area flagged as HIGH risk. Recent incidents reported here include theft and harassment. Consider using alternative routes.",
      variant: "destructive",
      duration: 8000,
    });
  };

  const simulateAINotification = () => {
    toast({
      title: "🤖 AI Risk Assessment Update",
      description:
        "Your risk profile has been updated to MEDIUM based on recent location patterns and time of travel. Stay alert and consider sharing your location with trusted contacts.",
      duration: 6000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚨 Enhanced SOS System with AI Demo
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Experience the future of tourist safety with AI-powered risk
            assessment and smart emergency response
          </p>
          <Badge variant="default" className="text-sm px-4 py-2">
            🏆 SIH 2024 Hackathon Demo - GoSafe Platform
          </Badge>
        </div>

        {/* Main Demo Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tourist Risk Index */}
          <div className="lg:col-span-1">
            <TouristRiskIndex showDetails={true} />
          </div>

          {/* Center Column - Enhanced SOS Button */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center space-y-6">
            <Card className="w-full bg-white/80 backdrop-blur-sm border-2 border-red-200">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center">
                  <AlertTriangle className="mr-2 h-6 w-6 text-red-500" />
                  Enhanced SOS System
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Hold for 3 seconds to trigger AI-powered emergency response
                </p>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <EnhancedSOSButton
                  onTrigger={handleSOSTrigger}
                  isActive={isSOSActive}
                  size="lg"
                  className="transform hover:scale-105 transition-transform"
                  emergencyContacts={[
                    {
                      name: "Emergency Services",
                      number: "100",
                      type: "emergency",
                    },
                    {
                      name: "Tourist Helpline",
                      number: "1363",
                      type: "primary",
                    },
                    { name: "Local Police", number: "101", type: "secondary" },
                  ]}
                />
                <div className="text-center space-y-2">
                  <p className="text-sm font-semibold text-gray-700">
                    AI-Enhanced Features:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline" className="text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Risk Assessment
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="w-3 h-3 mr-1" />
                      Location Analysis
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Smart Prioritization
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SOS Status Display */}
            {sosData && (
              <Card className="w-full bg-red-50 border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center">
                    <Bell className="mr-2 h-5 w-5" />
                    SOS Alert Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Alert ID:</span>
                      <span className="font-mono">{sosData.sosId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Level:</span>
                      <Badge
                        variant={
                          sosData.riskProfile?.riskLevel === "HIGH"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {sosData.riskProfile?.riskLevel || "MEDIUM"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span>
                        {sosData.location?.latitude?.toFixed(4)},{" "}
                        {sosData.location?.longitude?.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Battery:</span>
                      <span>{sosData.deviceContext?.batteryLevel}%</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => {
                      setIsSOSActive(false);
                      setSOSData(null);
                    }}
                  >
                    Reset Demo
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Demo Controls */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                  AI Features Demo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={simulateLocationWarning}
                  className="w-full"
                  variant="destructive"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Simulate High Risk Area Warning
                </Button>

                <Button
                  onClick={simulateAINotification}
                  className="w-full"
                  variant="default"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Trigger AI Risk Assessment
                </Button>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <h4 className="font-semibold mb-2 text-sm">
                    Demo Scenarios:
                  </h4>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• Tourist entering risky neighborhood</li>
                    <li>• Late night travel pattern detection</li>
                    <li>• Multiple SOS alerts correlation</li>
                    <li>• Device battery/network monitoring</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-green-500" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>AI Service:</span>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-700"
                    >
                      ✓ Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Location Services:</span>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-700"
                    >
                      ✓ Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Emergency Network:</span>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-700"
                    >
                      ✓ Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Risk Assessment:</span>
                    <Badge
                      variant="default"
                      className="bg-blue-100 text-blue-700"
                    >
                      🤖 AI Ready
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">AI Risk Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Machine learning analyzes patterns to predict and prevent
                dangerous situations
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <MapPin className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Location Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                Real-time analysis of location risk factors using crowd-sourced
                safety data
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Clock className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Smart Prioritization</h3>
              <p className="text-sm text-muted-foreground">
                Intelligent alert routing based on risk level, device status,
                and context
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>
            🏆 GoSafe Platform - SIH 2024 | Enhanced SOS System with AI &
            Context Awareness
          </p>
        </div>
      </div>
    </div>
  );
};
