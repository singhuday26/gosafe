import { Shield, Users, MapPin, UserCheck, AlertTriangle, Globe, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSelector from "@/components/LanguageSelector";

const Index = () => {
  const navigate = useNavigate();
  const { user, userRole, signOut, loading } = useAuth();

  const features = [
    {
      icon: Shield,
      title: "Blockchain Digital ID",
      description: "Secure, tamper-proof tourist identification with trip validation"
    },
    {
      icon: MapPin,
      title: "Smart Geo-Fencing",
      description: "AI-powered location monitoring with safety zone alerts"
    },
    {
      icon: AlertTriangle,
      title: "Emergency SOS",
      description: "Instant alert system with real-time location sharing"
    },
    {
      icon: Users,
      title: "Authority Dashboard",
      description: "Comprehensive monitoring and incident response system"
    }
  ];

  const stats = [
    { label: "Active Tourists", value: "12,458", trend: "+15%" },
    { label: "Safety Score", value: "94.2%", trend: "+2.1%" },
    { label: "Response Time", value: "< 3 min", trend: "-8%" },
    { label: "Incidents Resolved", value: "1,247", trend: "+12%" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <LanguageSelector />
          {user ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => {
                  const dashboardMap: { [key: string]: string } = {
                    tourist: '/tourist',
                    authority: '/authority',
                    admin: '/admin',
                  };
                  navigate(dashboardMap[userRole || 'tourist'] || '/tourist');
                }}
              >
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/30 text-white hover:bg-white/10"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => navigate('/auth')}
            >
              <LogIn className="h-4 w-4 mr-1" />
              Sign In
            </Button>
          )}
        </div>
        <div className="relative container mx-auto px-4 py-20 text-center text-white">
          <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20">
            Smart India Hackathon 2025 • Problem Statement 25002
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Smart Tourist Safety
            <br />
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Monitoring System
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            AI-powered safety monitoring with blockchain digital IDs, real-time geo-fencing, 
            and instant emergency response for secure tourism experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 shadow-medium"
              onClick={() => user ? navigate('/tourist') : navigate('/auth')}
            >
              <UserCheck className="mr-2 h-5 w-5" />
              Tourist Portal
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => user && userRole === 'authority' ? navigate('/authority') : navigate('/auth')}
            >
              <Shield className="mr-2 h-5 w-5" />
              Authority Dashboard
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/80 mb-2">{stat.label}</div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      stat.trend.startsWith('+') 
                        ? 'bg-safety/20 text-white border-safety/30' 
                        : 'bg-warning/20 text-white border-warning/30'
                    }`}
                  >
                    {stat.trend}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Globe className="mr-2 h-4 w-4" />
              Core Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comprehensive Safety Ecosystem
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Leveraging cutting-edge technology to ensure tourist safety through 
              proactive monitoring and instant response capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="gradient-card shadow-soft hover:shadow-medium transition-smooth">
                <CardHeader className="text-center">
                  <div className="inline-flex p-3 rounded-full gradient-primary mb-4 mx-auto">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="gradient-card shadow-soft hover:shadow-medium transition-smooth">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="mr-2 h-5 w-5 text-primary" />
                  Tourist Registration
                </CardTitle>
                <CardDescription>
                  Get your blockchain-based Digital Tourist ID with Aadhaar/Passport verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full gradient-primary text-white"
                  onClick={() => user ? navigate('/register') : navigate('/auth?tab=signup')}
                >
                  {user ? 'Register Now' : 'Sign Up to Register'}
                </Button>
              </CardContent>
            </Card>

            <Card className="gradient-card shadow-soft hover:shadow-medium transition-smooth">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-tourism" />
                  Authority Access
                </CardTitle>
                <CardDescription>
                  Police and tourism officials can monitor tourists and respond to incidents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full border-tourism text-tourism hover:bg-tourism hover:text-white"
                  onClick={() => user && userRole === 'authority' ? navigate('/authority') : navigate('/auth')}
                >
                  Authority Login
                </Button>
              </CardContent>
            </Card>

            <Card className="gradient-card shadow-soft hover:shadow-medium transition-smooth">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-warning" />
                  Admin Panel
                </CardTitle>
                <CardDescription>
                  System administrators can manage zones, analytics, and system configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full border-warning text-warning hover:bg-warning hover:text-white"
                  onClick={() => user && userRole === 'admin' ? navigate('/admin') : navigate('/auth')}
                >
                  Admin Access
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 mr-2" />
            <span className="text-2xl font-bold">Smart Tourist Safety</span>
          </div>
          <p className="text-primary-foreground/80 mb-4">
            Ministry of Tourism & Home Affairs • Smart India Hackathon 2025
          </p>
          <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
            Problem Statement ID: 25002
          </Badge>
        </div>
      </footer>
    </div>
  );
};

export default Index;