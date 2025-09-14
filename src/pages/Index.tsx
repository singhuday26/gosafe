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
      <section className="relative overflow-hidden gradient-ne-hero">
        <div className="absolute inset-0 bg-black/10 gradient-ne-hills"></div>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <LanguageSelector />
          {user ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10 font-body"
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
                className="border-white/30 text-white hover:bg-white/10 font-body"
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
              className="border-white/30 text-white hover:bg-white/10 font-body"
              onClick={() => navigate('/auth')}
            >
              <LogIn className="h-4 w-4 mr-1" />
              Sign In
            </Button>
          )}
        </div>
        <div className="relative container mx-auto px-4 py-20 text-center text-white">
          <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20 font-body">
            Smart India Hackathon 2025 • Problem Statement 25002
          </Badge>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 leading-tight">
            Smart Tourist Safety
            <br />
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Monitoring System
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto font-body">
            AI-powered safety monitoring with blockchain digital IDs, real-time geo-fencing, 
            and instant emergency response for secure tourism experiences in North East India.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-ne-tea-brown text-white hover:bg-ne-maroon shadow-ne-medium transition-ne font-body font-medium"
              onClick={() => user ? navigate('/tourist') : navigate('/auth')}
            >
              <UserCheck className="mr-2 h-5 w-5" />
              Tourist Portal
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/30 text-white hover:bg-ne-forest-green hover:border-ne-forest-green transition-ne font-body"
              onClick={() => user && userRole === 'authority' ? navigate('/authority') : navigate('/auth')}
            >
              <Shield className="mr-2 h-5 w-5" />
              Authority Dashboard
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="ne-card bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1 font-heading">{stat.value}</div>
                  <div className="text-sm text-white/80 mb-2 font-body">{stat.label}</div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs font-body ${
                      stat.trend.startsWith('+') 
                        ? 'bg-ne-forest-green/20 text-white border-ne-forest-green/30' 
                        : 'bg-ne-sunset-orange/20 text-white border-ne-sunset-orange/30'
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
      <section className="py-20 gradient-ne-mist">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-ne-tea-brown text-ne-tea-brown font-body">
              <Globe className="mr-2 h-4 w-4" />
              Core Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-ne-tea-brown">
              Comprehensive Safety Ecosystem
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-body">
              Leveraging cutting-edge technology to ensure tourist safety through 
              proactive monitoring and instant response capabilities across North East India.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="ne-card ne-tribal-border shadow-ne-soft hover:shadow-ne-medium transition-ne animate-scale-in" style={{animationDelay: `${index * 0.1}s`}}>
                <CardHeader className="text-center">
                  <div className="inline-flex p-3 rounded-full bg-ne-tea-brown shadow-ne-glow mb-4 mx-auto">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-heading text-ne-tea-brown">{feature.title}</CardTitle>
                  <CardDescription className="text-base font-body">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="ne-card shadow-ne-soft hover:shadow-ne-medium transition-ne hover:scale-105">
              <CardHeader>
                <CardTitle className="flex items-center font-heading text-ne-tea-brown">
                  <UserCheck className="mr-2 h-5 w-5 text-ne-sunset-orange" />
                  Tourist Registration
                </CardTitle>
                <CardDescription className="font-body">
                  Get your blockchain-based Digital Tourist ID with Aadhaar/Passport verification for North East India travel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-ne-tea-brown text-white hover:bg-ne-maroon transition-ne font-body font-medium shadow-ne-soft"
                  onClick={() => user ? navigate('/register') : navigate('/auth?tab=signup')}
                >
                  {user ? 'Register Now' : 'Sign Up to Register'}
                </Button>
              </CardContent>
            </Card>

            <Card className="ne-card shadow-ne-soft hover:shadow-ne-medium transition-ne hover:scale-105">
              <CardHeader>
                <CardTitle className="flex items-center font-heading text-ne-tea-brown">
                  <Shield className="mr-2 h-5 w-5 text-ne-forest-green" />
                  Authority Access
                </CardTitle>
                <CardDescription className="font-body">
                  Police and tourism officials can monitor tourists and respond to incidents across NE states
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full border-ne-forest-green text-ne-forest-green hover:bg-ne-forest-green hover:text-white transition-ne font-body"
                  onClick={() => user && userRole === 'authority' ? navigate('/authority') : navigate('/auth')}
                >
                  Authority Login
                </Button>
              </CardContent>
            </Card>

            <Card className="ne-card shadow-ne-soft hover:shadow-ne-medium transition-ne hover:scale-105">
              <CardHeader>
                <CardTitle className="flex items-center font-heading text-ne-tea-brown">
                  <Users className="mr-2 h-5 w-5 text-ne-sunset-orange" />
                  Admin Panel
                </CardTitle>
                <CardDescription className="font-body">
                  System administrators can manage zones, analytics, and system configuration for the entire region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full border-ne-sunset-orange text-ne-sunset-orange hover:bg-ne-sunset-orange hover:text-white transition-ne font-body"
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
      <footer className="bg-ne-tea-brown text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 mr-2" />
            <span className="text-2xl font-bold font-heading">Smart Tourist Safety</span>
          </div>
          <p className="text-white/80 mb-4 font-body">
            Ministry of Tourism & Home Affairs • Smart India Hackathon 2025
          </p>
          <div className="mb-4 font-body text-white/70">
            Protecting tourists across the Seven Sister States and Sikkim
          </div>
          <Badge variant="secondary" className="bg-white/10 text-white border-white/20 font-body">
            Problem Statement ID: 25002
          </Badge>
        </div>
      </footer>
    </div>
  );
};

export default Index;