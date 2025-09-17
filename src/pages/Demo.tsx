import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Pause,
  RotateCcw,
  MapPin,
  Shield,
  AlertTriangle,
  Users,
  PhoneCall,
  Clock,
  CheckCircle,
  ArrowLeft,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LanguageSelector from "@/components/LanguageSelector";

const DemoPage = () => {
  const navigate = useNavigate();
  const [demoStep, setDemoStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const demoSteps = [
    {
      title: "Tourist Registration",
      description: "Secure blockchain-based digital ID creation",
      icon: <Users className="h-6 w-6" />,
      features: [
        "Aadhaar verification",
        "Document upload",
        "Emergency contacts",
        "Digital ID generation",
      ],
    },
    {
      title: "Real-time Geo-fencing",
      description: "Location monitoring and safety zone alerts",
      icon: <MapPin className="h-6 w-6" />,
      features: [
        "Safe zone detection",
        "Restricted area warnings",
        "Automatic notifications",
        "GPS tracking",
      ],
    },
    {
      title: "SOS Emergency System",
      description: "Instant emergency response and coordination",
      icon: <AlertTriangle className="h-6 w-6" />,
      features: [
        "One-tap SOS activation",
        "Authority notification",
        "Location sharing",
        "Emergency escalation",
      ],
    },
    {
      title: "Authority Dashboard",
      description: "Centralized monitoring and response management",
      icon: <Shield className="h-6 w-6" />,
      features: [
        "Tourist tracking",
        "Alert management",
        "Response coordination",
        "Analytics dashboard",
      ],
    },
  ];

  const handlePlayDemo = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      // Simulate demo progression
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
    }
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setProgress(0);
    setDemoStep(0);
  };

  const goToStep = (step: number) => {
    setDemoStep(step);
    setProgress(0);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">GoSafe Live Demo</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Button onClick={() => navigate("/auth/signup")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Demo Introduction */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Interactive Demo Experience
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore GoSafe's comprehensive tourist safety platform through this
            interactive demonstration. See how our blockchain-secured digital
            IDs, real-time geo-fencing, and emergency response systems work
            together.
          </p>
        </div>

        {/* Demo Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Demo Progress</h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayDemo}
                disabled={isPlaying}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isPlaying ? "Playing..." : "Play Demo"}
              </Button>
              <Button variant="outline" size="sm" onClick={resetDemo}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Demo Steps Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {demoSteps.map((step, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all ${
                demoStep === index
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:shadow-md"
              }`}
              onClick={() => goToStep(index)}
            >
              <CardHeader className="text-center pb-3">
                <div
                  className={`inline-flex p-3 rounded-full mb-2 ${
                    demoStep === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {step.icon}
                </div>
                <CardTitle className="text-sm">{step.title}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Current Demo Step Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary rounded-lg text-primary-foreground">
                  {demoSteps[demoStep].icon}
                </div>
                <div>
                  <CardTitle>{demoSteps[demoStep].title}</CardTitle>
                  <CardDescription>
                    {demoSteps[demoStep].description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-semibold mb-3">Key Features:</h4>
                {demoSteps[demoStep].features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Demo Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Live Demonstration</CardTitle>
              <CardDescription>
                Interactive visualization of the current feature
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-6 text-center">
                <div className="mb-4">
                  <div className="inline-flex p-4 bg-primary rounded-full text-primary-foreground mb-4">
                    {demoSteps[demoStep].icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {demoSteps[demoStep].title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  This interactive demo shows how{" "}
                  {demoSteps[demoStep].title.toLowerCase()} works in real-time.
                </p>
                <Badge variant="secondary" className="mb-4">
                  Demo Mode Active
                </Badge>
                <div className="space-y-2">
                  <div className="h-2 bg-primary/20 rounded-full">
                    <div
                      className={`h-2 bg-primary rounded-full transition-all duration-300 ${
                        demoStep === 0
                          ? "w-1/4"
                          : demoStep === 1
                          ? "w-2/4"
                          : demoStep === 2
                          ? "w-3/4"
                          : "w-full"
                      }`}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Step {demoStep + 1} of {demoSteps.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                &lt;2min
              </div>
              <div className="text-sm text-muted-foreground">
                Average Response Time
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">System Uptime</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">
                Monitoring Coverage
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Alert className="max-w-2xl mx-auto mb-6">
            <Globe className="h-4 w-4" />
            <AlertDescription>
              Ready to experience GoSafe's complete tourist safety platform?
              Register now to get your secure digital ID and start your safe
              journey in Northeast India.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth/signup")}>
              <Users className="mr-2 h-5 w-5" />
              Register as Tourist
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth/login")}
            >
              <Shield className="mr-2 h-5 w-5" />
              Authority Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
