import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Shield, MapPin, AlertTriangle, Users, Phone, Clock, 
  Battery, Signal, Navigation, AlertCircle, CheckCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { BlockchainService, calculateSafetyScore, checkGeoFenceStatus, mockGeoFences } from "@/lib/blockchain";

const TouristDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTouristId, setCurrentTouristId] = useState<string | null>(null);
  const [safetyScore, setSafetyScore] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [lastSOSTime, setLastSOSTime] = useState<Date | null>(null);

  useEffect(() => {
    // Check if user has valid Digital ID
    const touristId = localStorage.getItem('currentTouristId');
    if (!touristId) {
      navigate('/register');
      return;
    }

    const blockchain = BlockchainService.getInstance();
    const digitalID = blockchain.validateDigitalID(touristId);
    
    if (!digitalID || digitalID.status !== 'active') {
      toast({
        title: "Invalid Digital ID",
        description: "Please register for a new Digital Tourist ID.",
        variant: "destructive",
      });
      navigate('/register');
      return;
    }

    setCurrentTouristId(touristId);
    setSafetyScore(calculateSafetyScore(touristId));

    // Mock location tracking
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          // Use mock Delhi coordinates if location access denied
          setCurrentLocation({
            latitude: 28.6139,
            longitude: 77.2090
          });
        }
      );
    }
  }, [navigate, toast]);

  const handleSOS = () => {
    if (!currentTouristId || !currentLocation) return;

    setIsSOSActive(true);
    setLastSOSTime(new Date());

    const blockchain = BlockchainService.getInstance();
    const sosAlert = blockchain.createSOSAlert({
      touristId: currentTouristId,
      location: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: "Tourist Location Area, Delhi, India" // Mock address
      },
      type: 'panic',
      message: "Emergency SOS triggered by tourist"
    });

    toast({
      title: "SOS Alert Triggered!",
      description: "Emergency services have been notified. Help is on the way.",
      variant: "destructive",
    });

    // Auto-disable SOS after 30 seconds for demo
    setTimeout(() => {
      setIsSOSActive(false);
      blockchain.updateSOSStatus(sosAlert.id, 'responded');
      toast({
        title: "Help is Coming",
        description: "Local authorities are responding to your location.",
      });
    }, 30000);
  };

  const geoFenceStatus = currentLocation ? checkGeoFenceStatus(currentLocation.latitude, currentLocation.longitude) : null;

  if (!currentTouristId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading tourist portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary mr-3" />
              <div>
                <h1 className="text-xl font-bold">Tourist Portal</h1>
                <p className="text-sm text-muted-foreground">Digital ID: {currentTouristId}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-safety/10 text-safety border-safety/20">
                <CheckCircle className="mr-1 h-3 w-3" />
                Verified
              </Badge>
              <Button
                variant="ghost"
                onClick={() => {
                  localStorage.removeItem('currentTouristId');
                  navigate('/');
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Safety & Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Safety Score */}
            <Card className={`gradient-card shadow-soft ${safetyScore >= 80 ? 'safety-glow' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-safety" />
                    Safety Score
                  </CardTitle>
                  <Badge 
                    variant="secondary" 
                    className={`${
                      safetyScore >= 80 
                        ? 'bg-safety/10 text-safety border-safety/20' 
                        : safetyScore >= 60 
                        ? 'bg-warning/10 text-warning border-warning/20'
                        : 'bg-danger/10 text-danger border-danger/20'
                    }`}
                  >
                    {safetyScore >= 80 ? 'Safe' : safetyScore >= 60 ? 'Caution' : 'Alert'}
                  </Badge>
                </div>
                <CardDescription>AI-powered real-time safety assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-safety mb-2">{safetyScore.toFixed(1)}</div>
                    <Progress value={safetyScore} className="w-full" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-semibold text-safety">3</div>
                      <div className="text-xs text-muted-foreground">Safe Zones</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-warning">1</div>
                      <div className="text-xs text-muted-foreground">Caution Areas</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-danger">0</div>
                      <div className="text-xs text-muted-foreground">Danger Zones</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Geo-fencing */}
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-primary" />
                  Location & Geo-fencing
                </CardTitle>
                <CardDescription>Current location and zone monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentLocation && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Latitude</div>
                      <div className="font-mono text-sm">{currentLocation.latitude.toFixed(6)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Longitude</div>
                      <div className="font-mono text-sm">{currentLocation.longitude.toFixed(6)}</div>
                    </div>
                  </div>
                )}
                
                {geoFenceStatus && (
                  <div className={`p-3 rounded-lg border ${
                    geoFenceStatus.type === 'safe' 
                      ? 'bg-safety/10 border-safety/20' 
                      : geoFenceStatus.type === 'restricted'
                      ? 'bg-warning/10 border-warning/20'
                      : 'bg-danger/10 border-danger/20'
                  }`}>
                    <div className="flex items-center mb-2">
                      <Navigation className="mr-2 h-4 w-4" />
                      <span className="font-semibold">Current Zone: {geoFenceStatus.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{geoFenceStatus.description}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Nearby Zones</h4>
                  {mockGeoFences.map((fence) => (
                    <div key={fence.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          fence.type === 'safe' ? 'bg-safety' : 
                          fence.type === 'restricted' ? 'bg-warning' : 'bg-danger'
                        }`}></div>
                        <span className="text-sm">{fence.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {fence.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-safety rounded-full"></div>
                    <div className="text-sm">Entered safe zone: Tourist Hub Area</div>
                    <div className="text-xs text-muted-foreground ml-auto">2 min ago</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="text-sm">Location updated successfully</div>
                    <div className="text-xs text-muted-foreground ml-auto">5 min ago</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <div className="text-sm">Safety score updated: 94.2/100</div>
                    <div className="text-xs text-muted-foreground ml-auto">10 min ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Emergency & Controls */}
          <div className="space-y-6">
            {/* Emergency SOS */}
            <Card className={`gradient-card shadow-soft ${isSOSActive ? 'emergency-pulse shadow-emergency' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center text-danger">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Emergency SOS
                </CardTitle>
                <CardDescription>
                  Instant alert to authorities and emergency contacts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  size="lg"
                  className={`w-full ${
                    isSOSActive 
                      ? 'bg-danger/80 hover:bg-danger text-white' 
                      : 'bg-danger hover:bg-danger/90 text-white shadow-emergency'
                  }`}
                  onClick={handleSOS}
                  disabled={isSOSActive}
                >
                  {isSOSActive ? (
                    <>
                      <div className="animate-pulse mr-2">🚨</div>
                      SOS ACTIVE
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      TRIGGER SOS
                    </>
                  )}
                </Button>
                {lastSOSTime && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Last triggered: {lastSOSTime.toLocaleTimeString()}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Device Status */}
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Signal className="mr-2 h-5 w-5 text-muted-foreground" />
                  Device Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Battery className="mr-2 h-4 w-4 text-safety" />
                    <span className="text-sm">Battery</span>
                  </div>
                  <div className="text-sm font-semibold text-safety">87%</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Signal className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">Network</span>
                  </div>
                  <Badge variant="secondary" className="bg-safety/10 text-safety border-safety/20">
                    Strong
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">GPS</span>
                  </div>
                  <Badge variant="secondary" className="bg-safety/10 text-safety border-safety/20">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-danger" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Phone className="mr-2 h-4 w-4" />
                  Primary: +91-98765-43210
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Phone className="mr-2 h-4 w-4" />
                  Secondary: +91-87654-32109
                </Button>
                <Separator />
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Shield className="mr-2 h-4 w-4" />
                  Local Police: 100
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Tourism Helpline: 1363
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MapPin className="mr-2 h-4 w-4" />
                  Share Live Location
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  View Safety Tips
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Guide
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouristDashboard;