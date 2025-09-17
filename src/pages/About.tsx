import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Users,
  MapPin,
  AlertTriangle,
  Clock,
  Globe,
  Award,
  Heart,
  Zap,
  CheckCircle,
  Github,
  ExternalLink,
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
import { Separator } from "@/components/ui/separator";
import LanguageSelector from "@/components/LanguageSelector";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Blockchain Security",
      description:
        "Immutable digital identity verification with advanced cryptographic protection",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Real-time Geo-fencing",
      description:
        "Smart location monitoring with automated safety zone alerts and notifications",
    },
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: "Emergency SOS",
      description:
        "Instant emergency response with automated authority notification and location sharing",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Multi-stakeholder Platform",
      description:
        "Unified ecosystem connecting tourists, authorities, and emergency services",
    },
  ];

  const stats = [
    {
      value: "99.9%",
      label: "System Uptime",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      value: "&lt;2min",
      label: "Response Time",
      icon: <Zap className="h-5 w-5" />,
    },
    { value: "24/7", label: "Monitoring", icon: <Globe className="h-5 w-5" /> },
    {
      value: "100%",
      label: "Data Security",
      icon: <Shield className="h-5 w-5" />,
    },
  ];

  const values = [
    {
      icon: <Heart className="h-8 w-8 text-red-500" />,
      title: "Tourist Safety First",
      description:
        "Every decision prioritizes the safety and security of travelers exploring Northeast India",
    },
    {
      icon: <Globe className="h-8 w-8 text-blue-500" />,
      title: "Cultural Preservation",
      description:
        "Promoting responsible tourism while respecting and preserving local cultures and traditions",
    },
    {
      icon: <Award className="h-8 w-8 text-yellow-500" />,
      title: "Innovation Excellence",
      description:
        "Leveraging cutting-edge technology to create meaningful solutions for real-world challenges",
    },
    {
      icon: <Users className="h-8 w-8 text-green-500" />,
      title: "Community Partnership",
      description:
        "Building bridges between tourists, local communities, and government authorities",
    },
  ];

  const timeline = [
    {
      year: "2024",
      title: "Genesis & Vision",
      description:
        "GoSafe was conceived during Smart India Hackathon 2024 to address critical tourist safety challenges in Northeast India.",
    },
    {
      year: "2024",
      title: "Technology Stack",
      description:
        "Built on modern React architecture with Supabase backend, implementing blockchain for secure digital identity management.",
    },
    {
      year: "2024",
      title: "Core Features",
      description:
        "Developed real-time geo-fencing, emergency SOS system, and multi-language support for diverse tourist populations.",
    },
    {
      year: "2024",
      title: "Integration & Testing",
      description:
        "Integrated with local authority systems and conducted comprehensive testing for reliability and performance.",
    },
  ];

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
                <h1 className="text-xl font-bold">About GoSafe</h1>
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            About GoSafe Platform
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Revolutionizing Tourist Safety in Northeast India
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            GoSafe is a comprehensive digital platform designed to ensure the
            safety and security of tourists visiting the beautiful and
            culturally rich Northeast region of India. Through innovative
            blockchain technology, real-time monitoring, and seamless emergency
            response systems, we're transforming the way tourist safety is
            managed.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              To create a secure, transparent, and efficient ecosystem that
              protects tourists while promoting responsible tourism in Northeast
              India. We leverage cutting-edge technology to bridge the gap
              between tourists, local authorities, and emergency services,
              ensuring every journey is safe, memorable, and culturally
              enriching.
            </p>
          </CardContent>
        </Card>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            Platform Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-3 text-primary">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">{value.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Development Timeline */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            Development Journey
          </h2>
          <div className="space-y-6">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <Card className="flex-1">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">{item.year}</Badge>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Technology Stack
            </CardTitle>
            <CardDescription className="text-center">
              Built with modern, scalable, and secure technologies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="font-semibold">Frontend</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>React 18</div>
                  <div>TypeScript</div>
                  <div>Tailwind CSS</div>
                  <div>Vite</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">Backend</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Supabase</div>
                  <div>PostgreSQL</div>
                  <div>Edge Functions</div>
                  <div>Real-time APIs</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">Security</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Blockchain</div>
                  <div>JWT Auth</div>
                  <div>RLS Policies</div>
                  <div>Encryption</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">Features</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>PWA Support</div>
                  <div>i18n</div>
                  <div>Geo-location</div>
                  <div>Real-time Chat</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                Ready to Experience Safe Tourism?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of travelers who trust GoSafe for their Northeast
                India adventures. Get your secure digital ID today and explore
                with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate("/auth/signup")}>
                  <Users className="mr-2 h-5 w-5" />
                  Register as Tourist
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/demo")}
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  View Live Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
