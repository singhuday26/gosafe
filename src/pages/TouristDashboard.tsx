import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Shield,
  MapPin,
  AlertTriangle,
  Users,
  Phone,
  Clock,
  Battery,
  Signal,
  Navigation,
  AlertCircle,
  CheckCircle,
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { TouristService } from "@/services/touristService";
import { AuthService, type AuthUser } from "@/services/authService";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

// Type definitions
type Geofence = Database["public"]["Tables"]["geo_fences"]["Row"];

import MapComponent from "@/components/MapComponent";
import MapView from "@/components/MapView";

// Types for real data
interface TouristLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

interface GeofenceStatus {
  id: string;
  name: string;
  type: "safe" | "restricted" | "danger" | "tourist_zone";
  description?: string;
}

interface SafetyMetrics {
  score: number;
  safeZones: number;
  cautionAreas: number;
  dangerZones: number;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  status?: "success" | "warning" | "error" | "info";
}

const TouristDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: { justRegistered?: boolean; qrValue?: string; name?: string };
  };
  const { toast } = useToast();
  const { t } = useTranslation();
  const { signOut } = useAuth();

  // Real state using Supabase data
  const [currentTouristId, setCurrentTouristId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [digitalId, setDigitalId] = useState<string | null>(null);
  const [safetyMetrics, setSafetyMetrics] = useState<SafetyMetrics>({
    score: 0,
    safeZones: 0,
    cautionAreas: 0,
    dangerZones: 0,
  });
  const [currentLocation, setCurrentLocation] =
    useState<TouristLocation | null>(null);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [lastSOSTime, setLastSOSTime] = useState<Date | null>(null);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [currentGeofence, setCurrentGeofence] = useState<GeofenceStatus | null>(
    null
  );
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [escalationType, setEscalationType] = useState<"police" | "ranger">(
    "police"
  );
  const [loading, setLoading] = useState(true);

  const touristService = TouristService.getInstance();
  const authService = AuthService.getInstance();

  // Utility function to check geofence status
  const checkGeoFenceStatus = (
    lat: number,
    lng: number
  ): GeofenceStatus | null => {
    for (const fence of geofences) {
      if (isPointInGeofence(lat, lng, fence)) {
        return {
          id: fence.id,
          name: fence.name,
          description: fence.description || "",
          type: fence.type as "safe" | "restricted" | "danger" | "tourist_zone",
        };
      }
    }
    return null;
  };

  // Helper function to check if a point is inside a geofence
  const isPointInGeofence = (
    lat: number,
    lng: number,
    fence: Geofence
  ): boolean => {
    // Simple implementation - in reality you'd use a proper point-in-polygon algorithm
    // For now, just return false as a placeholder
    return false;
  };

  useEffect(() => {
    initializeDashboard();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeDashboard = async () => {
    try {
      setLoading(true);

      // Get current user
      const user = await authService.getCurrentUser();
      if (!user) {
        navigate("/register");
        return;
      }

      setCurrentUser(user);
      setCurrentTouristId(user.id);

      // Get digital tourist ID
      const touristIds = await touristService.getAllDigitalTouristIDs();
      const userTouristId = touristIds.find(
        (id) => id.tourist_name === user.name
      );
      if (userTouristId) {
        setDigitalId(userTouristId.id);
      }

      // Get current location
      await getCurrentLocation();

      // Load safety metrics
      const metrics = await touristService.getSafetyMetrics();
      setSafetyMetrics({
        score: metrics.safeZones * 20 + metrics.dangerZones * -10 + 80, // Calculate score
        safeZones: metrics.safeZones,
        cautionAreas: 1, // Default value
        dangerZones: metrics.dangerZones,
      });

      // Load geofences
      const allGeofences = await touristService.getAllGeoFences();
      setGeofences(allGeofences);

      // Update location in database
      if (currentLocation) {
        try {
          await touristService.updateTouristLocation(
            user.id,
            currentLocation.latitude,
            currentLocation.longitude
          );
        } catch (error) {
          console.error("Failed to update location:", error);
        }
      }

      // Load recent activities (mock for now, can be extended)
      setRecentActivities([
        {
          id: "1",
          type: "location",
          message: "Location updated successfully",
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          status: "success",
        },
        {
          id: "2",
          type: "safety",
          message: "Safety score updated",
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          status: "info",
        },
      ]);
    } catch (error) {
      console.error("Failed to initialize dashboard:", error);
      toast({
        title: "Initialization Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async (): Promise<void> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location: TouristLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setCurrentLocation(location);

            // Update location in database
            if (currentTouristId) {
              try {
                await touristService.updateTouristLocation(
                  currentTouristId,
                  location.latitude,
                  location.longitude
                );
              } catch (error) {
                console.error("Failed to update location:", error);
              }
            }

            // Check current geofence
            await checkCurrentGeofence(location);
            resolve();
          },
          () => {
            // Use mock Delhi coordinates if location access denied
            const location: TouristLocation = {
              latitude: 28.6139,
              longitude: 77.209,
              address: "Delhi, India",
            };
            setCurrentLocation(location);
            resolve();
          }
        );
      } else {
        resolve();
      }
    });
  };

  const checkCurrentGeofence = async (location: TouristLocation) => {
    try {
      const activeGeofences = await touristService.getAllGeoFences();
      // Simple point-in-polygon check (simplified for demo)
      const currentFence = activeGeofences.find((fence) => {
        // This is a simplified check - in reality you'd use proper geo calculations
        return (
          fence.type &&
          ["safe", "restricted", "danger", "tourist_zone"].includes(fence.type)
        );
      });

      if (currentFence) {
        setCurrentGeofence({
          id: currentFence.id,
          name: currentFence.name,
          type: currentFence.type as
            | "safe"
            | "restricted"
            | "danger"
            | "tourist_zone",
          description: currentFence.description,
        });
      }
    } catch (error) {
      console.error("Failed to check geofence:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Clear any local storage items
      localStorage.removeItem("currentTouristId");
      // Navigate to home page (auth context will handle redirect to login if needed)
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "There was an issue logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSOS = async () => {
    if (!currentTouristId || !currentLocation || !currentUser) return;

    try {
      setIsSOSActive(true);
      setLastSOSTime(new Date());

      // Determine escalation type based on current geofence
      const currentEscalation =
        currentGeofence?.type === "danger" ? "ranger" : "police";
      setEscalationType(currentEscalation);

      // Create SOS alert in database
      const sosAlert = await touristService.createSOSAlert({
        tourist_id: currentTouristId,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        alert_type: "panic",
        message: `Emergency SOS triggered by tourist. Escalation: ${currentEscalation}${
          currentGeofence ? ` (${currentGeofence.name})` : ""
        }`,
        blockchain_hash: `sos_${currentTouristId}_${Date.now()}`,
      });

      toast({
        title: "SOS Alert Triggered!",
        description: `Emergency services notified. ${
          currentEscalation === "ranger" ? "Rangers" : "Police"
        } dispatched to your location.`,
        variant: "destructive",
      });

      // Redirect to SOS confirmation page for proper emergency flow
      setTimeout(() => {
        navigate("/tourist/sos-confirmation", {
          state: {
            alert_id: sosAlert.id,
            tourist_id: currentTouristId,
            location: currentLocation,
            escalation: currentEscalation,
          },
        });
      }, 1000); // Shorter delay for immediate feedback

      // Auto-disable SOS after 30 seconds for demo
      setTimeout(async () => {
        setIsSOSActive(false);
        try {
          await touristService.updateSOSAlertStatus(sosAlert.id, "responded");
          toast({
            title: "Help is Coming",
            description: `Local ${
              currentEscalation === "ranger" ? "rangers" : "authorities"
            } are responding to your location.`,
          });
        } catch (error) {
          console.error("Failed to update SOS status:", error);
        }
      }, 30000);
    } catch (error) {
      console.error("Failed to create SOS alert:", error);
      setIsSOSActive(false);
      toast({
        title: "SOS Error",
        description: "Failed to send SOS alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  const justRegistered = Boolean(location.state?.justRegistered);
  const qrValue =
    location.state?.qrValue || digitalId || currentTouristId || "";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading tourist portal...</p>
        </div>
      </div>
    );
  }

  if (!currentTouristId || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Please register to access the portal.
          </p>
          <Button className="mt-4" onClick={() => navigate("/register")}>
            Go to Registration
          </Button>
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
                <p className="text-sm text-muted-foreground">
                  Digital ID: {currentTouristId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant="secondary"
                className="bg-safety/10 text-safety border-safety/20"
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Verified
              </Badge>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {justRegistered && qrValue && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Welcome! Your Digital ID</CardTitle>
              <CardDescription>
                Scan this QR to quickly verify your identity
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  qrValue
                )}`}
                alt="Digital ID QR"
                className="rounded border"
                width={180}
                height={180}
              />
              <div>
                <div className="text-sm text-muted-foreground">Digital ID</div>
                <div className="font-mono break-all">{qrValue}</div>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Safety & Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive Map */}
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-primary" />
                  Live Location & Safety Zones
                </CardTitle>
                <CardDescription>
                  Real-time location tracking with geofence monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 rounded-lg border overflow-hidden">
                  <MapView
                    tourists={
                      currentLocation
                        ? [
                            {
                              id: currentTouristId || "current",
                              name: "You",
                              latitude: currentLocation.latitude,
                              longitude: currentLocation.longitude,
                              status: isSOSActive ? "sos" : "active",
                            },
                          ]
                        : []
                    }
                    geofences={geofences.map((fence) => ({
                      id: fence.id,
                      name: fence.name,
                      description: fence.description || "",
                      coordinates: fence.coordinates,
                      type: fence.type as
                        | "safe"
                        | "restricted"
                        | "danger"
                        | "tourist_zone",
                      active: true,
                    }))}
                    sosAlerts={
                      isSOSActive && currentLocation
                        ? [
                            {
                              id: "current-sos",
                              latitude: currentLocation.latitude,
                              longitude: currentLocation.longitude,
                              alert_type: "panic",
                              tourist_name: "Current User",
                              timestamp: new Date().toISOString(),
                              status: "active",
                            },
                          ]
                        : []
                    }
                    center={
                      currentLocation
                        ? [currentLocation.longitude, currentLocation.latitude]
                        : undefined
                    }
                    zoom={14}
                    showControls={true}
                    interactive={true}
                    className="w-full h-full"
                  />
                </div>

                {/* Current Zone Status */}
                {currentLocation && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Zone:</span>
                      {(() => {
                        const zone = checkGeoFenceStatus(
                          currentLocation.latitude,
                          currentLocation.longitude
                        );
                        if (zone) {
                          return (
                            <Badge
                              variant={
                                zone.type === "danger"
                                  ? "destructive"
                                  : zone.type === "restricted"
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {zone.name}
                            </Badge>
                          );
                        }
                        return <Badge variant="outline">Open Area</Badge>;
                      })()}
                    </div>
                    {escalationType === "ranger" && (
                      <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        ⚠️ You're in a high-risk area. Rangers will respond to
                        emergencies.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Safety Score */}
            <Card
              className={`gradient-card shadow-soft ${
                safetyMetrics.score >= 80 ? "safety-glow" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-safety" />
                    Safety Score
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className={`${
                      safetyMetrics.score >= 80
                        ? "bg-safety/10 text-safety border-safety/20"
                        : safetyMetrics.score >= 60
                        ? "bg-warning/10 text-warning border-warning/20"
                        : "bg-danger/10 text-danger border-danger/20"
                    }`}
                  >
                    {safetyMetrics.score >= 80
                      ? "Safe"
                      : safetyMetrics.score >= 60
                      ? "Caution"
                      : "Alert"}
                  </Badge>
                </div>
                <CardDescription>
                  AI-powered real-time safety assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-safety mb-2">
                      {safetyMetrics.score.toFixed(1)}
                    </div>
                    <Progress value={safetyMetrics.score} className="w-full" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-semibold text-safety">
                        {safetyMetrics.safeZones}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Safe Zones
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-warning">
                        {safetyMetrics.cautionAreas}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Caution Areas
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-danger">
                        {safetyMetrics.dangerZones}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Danger Zones
                      </div>
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
                <CardDescription>
                  Current location and zone monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentLocation && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Latitude
                      </div>
                      <div className="font-mono text-sm">
                        {currentLocation.latitude.toFixed(6)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Longitude
                      </div>
                      <div className="font-mono text-sm">
                        {currentLocation.longitude.toFixed(6)}
                      </div>
                    </div>
                  </div>
                )}

                {currentGeofence && (
                  <div
                    className={`p-3 rounded-lg border ${
                      currentGeofence.type === "safe"
                        ? "bg-safety/10 border-safety/20"
                        : currentGeofence.type === "restricted"
                        ? "bg-warning/10 border-warning/20"
                        : "bg-danger/10 border-danger/20"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Navigation className="mr-2 h-4 w-4" />
                      <span className="font-semibold">
                        Current Zone: {currentGeofence.name}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentGeofence.description}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Nearby Zones</h4>
                  {geofences.map((fence) => (
                    <div
                      key={fence.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded"
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            fence.type === "safe"
                              ? "bg-safety"
                              : fence.type === "restricted"
                              ? "bg-warning"
                              : "bg-danger"
                          }`}
                        ></div>
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

            {/* Live Map View */}
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Navigation className="mr-2 h-5 w-5 text-primary" />
                  Live Map View
                </CardTitle>
                <CardDescription>
                  Interactive map with geofences and your location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 rounded-lg overflow-hidden border">
                  <MapComponent
                    tourists={
                      currentLocation
                        ? [
                            {
                              id: currentTouristId || "tourist-1",
                              name: "You",
                              latitude: currentLocation.latitude,
                              longitude: currentLocation.longitude,
                              status: isSOSActive ? "sos" : "active",
                            },
                          ]
                        : []
                    }
                    geoFences={geofences.map((fence) => ({
                      id: fence.id,
                      name: fence.name,
                      description: fence.description || "",
                      type: fence.type as "safe" | "restricted" | "danger",
                      coordinates: Array.isArray(fence.coordinates)
                        ? (fence.coordinates as { lat: number; lng: number }[])
                        : [],
                    }))}
                    sosAlerts={
                      isSOSActive && currentLocation
                        ? [
                            {
                              id: "current-sos",
                              latitude: currentLocation.latitude,
                              longitude: currentLocation.longitude,
                              type: "emergency",
                              tourist_name: "You",
                            },
                          ]
                        : []
                    }
                    center={
                      currentLocation
                        ? [currentLocation.longitude, currentLocation.latitude]
                        : [77.209, 28.6139]
                    }
                    zoom={13}
                  />
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
                    <div className="text-sm">
                      Entered safe zone: Tourist Hub Area
                    </div>
                    <div className="text-xs text-muted-foreground ml-auto">
                      2 min ago
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="text-sm">Location updated successfully</div>
                    <div className="text-xs text-muted-foreground ml-auto">
                      5 min ago
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <div className="text-sm">
                      Safety score updated: 94.2/100
                    </div>
                    <div className="text-xs text-muted-foreground ml-auto">
                      10 min ago
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Emergency & Controls */}
          <div className="space-y-6">
            {/* Emergency SOS */}
            <Card
              className={`gradient-card shadow-soft ${
                isSOSActive ? "emergency-pulse shadow-emergency" : ""
              }`}
            >
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
                      ? "bg-danger/80 hover:bg-danger text-white"
                      : "bg-danger hover:bg-danger/90 text-white shadow-emergency"
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
                  <Badge
                    variant="secondary"
                    className="bg-safety/10 text-safety border-safety/20"
                  >
                    Strong
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">GPS</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-safety/10 text-safety border-safety/20"
                  >
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
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Primary: +91-98765-43210
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Secondary: +91-87654-32109
                </Button>
                <Separator />
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Local Police: 100
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
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
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Share Live Location
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  View Safety Tips
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
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
