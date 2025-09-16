import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Play,
  MapPin,
  Smartphone,
  Shield,
  ArrowRight,
  Zap,
  Eye,
  MousePointer,
} from "lucide-react";

interface DemoCoordinate {
  name: string;
  lat: number;
  lng: number;
  description: string;
  riskLevel: "low" | "medium" | "high";
}

const LiveDemoSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<DemoCoordinate | null>(null);
  const [customLat, setCustomLat] = useState("");
  const [customLng, setCustomLng] = useState("");

  const demoLocations: DemoCoordinate[] = [
    {
      name: "Tawang Monastery, Arunachal Pradesh",
      lat: 27.5856,
      lng: 91.8598,
      description: "High-altitude monastery with limited connectivity",
      riskLevel: "medium",
    },
    {
      name: "Kaziranga National Park, Assam",
      lat: 26.5775,
      lng: 93.1711,
      description: "Wildlife sanctuary with rhino spotting areas",
      riskLevel: "low",
    },
    {
      name: "Nathula Pass, Sikkim",
      lat: 27.3916,
      lng: 88.8484,
      description: "Indo-China border area with restricted access",
      riskLevel: "high",
    },
    {
      name: "Cherrapunji, Meghalaya",
      lat: 25.3,
      lng: 91.7,
      description: "Wettest place on Earth with monsoon challenges",
      riskLevel: "medium",
    },
    {
      name: "Kohima War Cemetery, Nagaland",
      lat: 25.6751,
      lng: 94.1086,
      description: "Historical site with cultural significance",
      riskLevel: "low",
    },
  ];

  const features = [
    {
      icon: MapPin,
      title: "Real-time Tracking",
      description: "Live GPS coordinates with geo-fence monitoring",
    },
    {
      icon: Shield,
      title: "Safety Alerts",
      description: "Automatic risk assessment and zone notifications",
    },
    {
      icon: Zap,
      title: "Instant SOS",
      description: "One-tap emergency activation with location sharing",
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Works seamlessly on all devices and screen sizes",
    },
  ];

  const handleDemoLaunch = (location?: DemoCoordinate) => {
    const coords = location || {
      name: "Custom Location",
      lat: parseFloat(customLat) || 25.5788,
      lng: parseFloat(customLng) || 91.8933,
      description: "User-defined coordinates",
      riskLevel: "medium" as const,
    };

    setSelectedDemo(coords);
    // Here you would typically launch the actual demo interface
    // For now, we'll just show the modal with demo details
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 text-sm">
              <Eye className="mr-1 h-4 w-4" />
              Try Before You Register
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Experience GoSafe Live Demo
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Test our platform with real coordinates from Northeast India. No
              signup required — see exactly how GoSafe protects tourists.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Demo Features */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold mb-6">
                What You'll Experience
              </h3>

              {features.map((feature, index) => (
                <Card key={index} className="border-primary/10">
                  <CardContent className="flex items-start space-x-4 p-6">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">{feature.title}</h4>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <h4 className="font-bold mb-2 text-primary">
                    Demo Capabilities:
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>✅ Real coordinate simulation</li>
                    <li>✅ Geo-fence boundary visualization</li>
                    <li>✅ Risk assessment algorithms</li>
                    <li>✅ Emergency alert simulation</li>
                    <li>✅ Multi-language interface testing</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Demo Launch Panel */}
            <div className="space-y-6">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Play className="mr-2 h-5 w-5 text-primary" />
                    Launch Interactive Demo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Preset Locations */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">
                      Choose a Demo Location:
                    </Label>
                    <div className="space-y-2">
                      {demoLocations.map((location, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-between h-auto p-4 text-left"
                          onClick={() => handleDemoLaunch(location)}
                        >
                          <div>
                            <div className="font-medium">{location.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {location.description}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={getRiskBadgeColor(location.riskLevel)}
                            >
                              {location.riskLevel} risk
                            </Badge>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Coordinates */}
                  <div className="border-t pt-4">
                    <Label className="text-sm font-semibold mb-3 block">
                      Or Enter Custom Coordinates:
                    </Label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <Label htmlFor="lat" className="text-xs">
                          Latitude
                        </Label>
                        <Input
                          id="lat"
                          placeholder="25.5788"
                          value={customLat}
                          onChange={(e) => setCustomLat(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lng" className="text-xs">
                          Longitude
                        </Label>
                        <Input
                          id="lng"
                          placeholder="91.8933"
                          value={customLng}
                          onChange={(e) => setCustomLng(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleDemoLaunch()}
                    >
                      <MousePointer className="mr-2 h-4 w-4" />
                      Demo with Custom Location
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Demo Info */}
              <Card className="bg-muted/50">
                <CardContent className="p-6 text-center">
                  <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Instant Access</h4>
                  <p className="text-sm text-muted-foreground">
                    No registration required. Experience full platform
                    capabilities with simulated emergency scenarios and
                    real-time tracking.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Demo Modal */}
        <Dialog
          open={!!selectedDemo}
          onOpenChange={() => setSelectedDemo(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Play className="mr-2 h-5 w-5 text-primary" />
                Demo: {selectedDemo?.name}
              </DialogTitle>
              <DialogDescription>
                Interactive simulation of GoSafe platform features
              </DialogDescription>
            </DialogHeader>

            {selectedDemo && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">Coordinates:</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDemo.lat.toFixed(6)},{" "}
                        {selectedDemo.lng.toFixed(6)}
                      </p>
                    </div>
                    <Badge
                      className={getRiskBadgeColor(selectedDemo.riskLevel)}
                    >
                      {selectedDemo.riskLevel} risk
                    </Badge>
                  </div>
                  <p className="text-sm">{selectedDemo.description}</p>
                </div>

                <div className="text-center py-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <Play className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h4 className="font-bold mb-2">Demo Would Launch Here</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Full interactive map with real-time simulation of:
                  </p>
                  <ul className="text-sm space-y-1 max-w-xs mx-auto">
                    <li>🗺️ Live location tracking</li>
                    <li>🚨 Emergency alert testing</li>
                    <li>📍 Geo-fence visualization</li>
                    <li>🔐 Blockchain ID verification</li>
                  </ul>
                </div>

                <Button className="w-full" size="lg">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Launch Full Demo Interface
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default LiveDemoSection;
