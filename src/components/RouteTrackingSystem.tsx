import React, { useState, useEffect } from "react";
import {
  Navigation,
  MapPin,
  Route,
  AlertTriangle,
  Clock,
  TrendingUp,
  Compass,
  Flag,
  Target,
  Activity,
  ArrowRight,
  Play,
  Pause,
  Square,
  RefreshCw,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import MapView from "@/components/MapView";

interface RouteWaypoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  estimated_arrival?: string;
  visit_duration?: number; // minutes
  poi_type?:
    | "attraction"
    | "restaurant"
    | "hotel"
    | "transport"
    | "safety_point";
  description?: string;
}

interface PlannedRoute {
  id: string;
  tourist_id: string;
  tourist_name: string;
  route_name: string;
  waypoints: RouteWaypoint[];
  start_time: string;
  estimated_end_time: string;
  total_distance: number; // meters
  estimated_duration: number; // minutes
  route_type: "walking" | "driving" | "transit" | "mixed";
  status: "planned" | "active" | "completed" | "paused" | "cancelled";
  current_waypoint_index: number;
  deviation_alerts_enabled: boolean;
  max_deviation_distance: number; // meters
}

interface RouteProgress {
  route_id: string;
  current_location: { latitude: number; longitude: number };
  distance_covered: number;
  time_elapsed: number; // minutes
  progress_percentage: number;
  current_deviation: number; // meters from planned route
  estimated_time_remaining: number; // minutes
  next_waypoint: RouteWaypoint | null;
  distance_to_next_waypoint: number;
  is_on_track: boolean;
  speed_kmh: number;
  route_alerts: Array<{
    type: "deviation" | "delay" | "safety" | "poi";
    message: string;
    timestamp: string;
    severity: "low" | "medium" | "high";
  }>;
}

interface Props {
  touristId?: string;
  onRouteUpdate?: (route: PlannedRoute, progress: RouteProgress) => void;
}

const RouteTrackingSystem: React.FC<Props> = ({ touristId, onRouteUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "track" | "manage">(
    "track"
  );

  // Data states
  const [plannedRoutes, setPlannedRoutes] = useState<PlannedRoute[]>([]);
  const [routeProgress, setRouteProgress] = useState<
    Record<string, RouteProgress>
  >({});
  const [selectedRoute, setSelectedRoute] = useState<PlannedRoute | null>(null);

  // Create route form
  const [newRoute, setNewRoute] = useState({
    route_name: "",
    waypoints: [] as RouteWaypoint[],
    route_type: "walking" as "walking" | "driving" | "transit" | "mixed",
    max_deviation_distance: 500,
  });

  useEffect(() => {
    loadRoutes();
    // Set up real-time tracking
    const interval = setInterval(updateRouteProgress, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []); // loadRoutes is stable, updateRouteProgress is defined inline

  const loadRoutes = async () => {
    try {
      setLoading(true);

      // Mock data - would come from database
      const mockRoutes: PlannedRoute[] = [
        {
          id: "route_001",
          tourist_id: "tourist_001",
          tourist_name: "John Smith",
          route_name: "Delhi Historical Tour",
          waypoints: [
            {
              id: "wp_001",
              name: "Red Fort",
              latitude: 28.6562,
              longitude: 77.241,
              estimated_arrival: "09:00",
              visit_duration: 90,
              poi_type: "attraction",
              description: "Historic Mughal fort complex",
            },
            {
              id: "wp_002",
              name: "Chandni Chowk",
              latitude: 28.6506,
              longitude: 77.2334,
              estimated_arrival: "11:00",
              visit_duration: 60,
              poi_type: "attraction",
              description: "Traditional market area",
            },
            {
              id: "wp_003",
              name: "India Gate",
              latitude: 28.6129,
              longitude: 77.2295,
              estimated_arrival: "14:00",
              visit_duration: 45,
              poi_type: "attraction",
              description: "War memorial monument",
            },
          ],
          start_time: new Date().toISOString(),
          estimated_end_time: new Date(
            Date.now() + 8 * 60 * 60 * 1000
          ).toISOString(),
          total_distance: 15000, // 15km
          estimated_duration: 480, // 8 hours
          route_type: "mixed",
          status: "active",
          current_waypoint_index: 1,
          deviation_alerts_enabled: true,
          max_deviation_distance: 500,
        },
        {
          id: "route_002",
          tourist_id: "tourist_002",
          tourist_name: "Sarah Connor",
          route_name: "Mumbai Marine Drive Walk",
          waypoints: [
            {
              id: "wp_004",
              name: "Gateway of India",
              latitude: 18.922,
              longitude: 72.8347,
              estimated_arrival: "16:00",
              visit_duration: 30,
              poi_type: "attraction",
            },
            {
              id: "wp_005",
              name: "Marine Drive",
              latitude: 18.9441,
              longitude: 72.8239,
              estimated_arrival: "17:00",
              visit_duration: 120,
              poi_type: "attraction",
            },
          ],
          start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          estimated_end_time: new Date(
            Date.now() + 2 * 60 * 60 * 1000
          ).toISOString(),
          total_distance: 5000,
          estimated_duration: 240,
          route_type: "walking",
          status: "active",
          current_waypoint_index: 0,
          deviation_alerts_enabled: true,
          max_deviation_distance: 300,
        },
      ];

      const mockProgress: Record<string, RouteProgress> = {
        route_001: {
          route_id: "route_001",
          current_location: { latitude: 28.652, longitude: 77.235 },
          distance_covered: 8000,
          time_elapsed: 180,
          progress_percentage: 53,
          current_deviation: 150,
          estimated_time_remaining: 300,
          next_waypoint: mockRoutes[0].waypoints[2],
          distance_to_next_waypoint: 7000,
          is_on_track: true,
          speed_kmh: 4.5,
          route_alerts: [
            {
              type: "deviation",
              message:
                "Minor route deviation detected - tourist exploring side street",
              timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              severity: "low",
            },
          ],
        },
        route_002: {
          route_id: "route_002",
          current_location: { latitude: 18.93, longitude: 72.832 },
          distance_covered: 3000,
          time_elapsed: 120,
          progress_percentage: 60,
          current_deviation: 50,
          estimated_time_remaining: 120,
          next_waypoint: mockRoutes[1].waypoints[1],
          distance_to_next_waypoint: 2000,
          is_on_track: true,
          speed_kmh: 3.2,
          route_alerts: [],
        },
      };

      setPlannedRoutes(mockRoutes);
      setRouteProgress(mockProgress);

      if (mockRoutes.length > 0) {
        setSelectedRoute(mockRoutes[0]);
      }
    } catch (error) {
      console.error("Error loading routes:", error);
      toast({
        title: "Error",
        description: "Failed to load route data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRouteProgress = async () => {
    // Simulate real-time updates
    setRouteProgress((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((routeId) => {
        const progress = updated[routeId];
        // Simulate small progress updates
        progress.distance_covered += Math.random() * 100;
        progress.time_elapsed += 0.5;
        progress.progress_percentage = Math.min(
          100,
          (progress.distance_covered / 15000) * 100
        );
        progress.estimated_time_remaining = Math.max(
          0,
          progress.estimated_time_remaining - 0.5
        );

        // Simulate occasional deviations
        if (Math.random() < 0.1) {
          progress.current_deviation = Math.random() * 800;
          if (progress.current_deviation > 500) {
            progress.route_alerts.push({
              type: "deviation",
              message: `Significant deviation detected: ${progress.current_deviation.toFixed(
                0
              )}m from planned route`,
              timestamp: new Date().toISOString(),
              severity: progress.current_deviation > 700 ? "high" : "medium",
            });
          }
        }
      });
      return updated;
    });
  };

  const handleStartRoute = async (routeId: string) => {
    try {
      const updatedRoutes = plannedRoutes.map((route) =>
        route.id === routeId
          ? {
              ...route,
              status: "active" as const,
              start_time: new Date().toISOString(),
            }
          : route
      );
      setPlannedRoutes(updatedRoutes);

      toast({
        title: "Route Started",
        description: "Route tracking is now active. AI monitoring enabled.",
      });
    } catch (error) {
      console.error("Error starting route:", error);
      toast({
        title: "Error",
        description: "Failed to start route tracking",
        variant: "destructive",
      });
    }
  };

  const handlePauseRoute = async (routeId: string) => {
    try {
      const updatedRoutes = plannedRoutes.map((route) =>
        route.id === routeId ? { ...route, status: "paused" as const } : route
      );
      setPlannedRoutes(updatedRoutes);

      toast({
        title: "Route Paused",
        description: "Route tracking has been paused.",
      });
    } catch (error) {
      console.error("Error pausing route:", error);
    }
  };

  const handleCompleteRoute = async (routeId: string) => {
    try {
      const updatedRoutes = plannedRoutes.map((route) =>
        route.id === routeId
          ? { ...route, status: "completed" as const }
          : route
      );
      setPlannedRoutes(updatedRoutes);

      toast({
        title: "Route Completed",
        description: "Route has been marked as completed.",
      });
    } catch (error) {
      console.error("Error completing route:", error);
    }
  };

  const calculateRouteHealth = (
    route: PlannedRoute,
    progress: RouteProgress
  ) => {
    let health = 100;

    if (progress.current_deviation > route.max_deviation_distance) {
      health -= 30;
    }

    const expectedProgress =
      (progress.time_elapsed / route.estimated_duration) * 100;
    const progressDifference = Math.abs(
      progress.progress_percentage - expectedProgress
    );
    if (progressDifference > 20) {
      health -= 20;
    }

    if (progress.route_alerts.some((alert) => alert.severity === "high")) {
      health -= 25;
    }

    return Math.max(0, health);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 text-white";
      case "planned":
        return "bg-blue-500 text-white";
      case "paused":
        return "bg-yellow-500 text-black";
      case "completed":
        return "bg-gray-500 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="h-4 w-4" />;
      case "planned":
        return <Clock className="h-4 w-4" />;
      case "paused":
        return <Pause className="h-4 w-4" />;
      case "completed":
        return <Target className="h-4 w-4" />;
      case "cancelled":
        return <Square className="h-4 w-4" />;
      default:
        return <Navigation className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-orange-600 bg-orange-50";
      case "low":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Route className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Route Tracking System</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadRoutes}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setActiveTab("create")}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Create Route
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <Button
          variant={activeTab === "track" ? "default" : "ghost"}
          onClick={() => setActiveTab("track")}
          className="rounded-none border-b-2 border-transparent"
        >
          <Activity className="h-4 w-4 mr-2" />
          Live Tracking
        </Button>
        <Button
          variant={activeTab === "manage" ? "default" : "ghost"}
          onClick={() => setActiveTab("manage")}
          className="rounded-none border-b-2 border-transparent"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Manage Routes
        </Button>
        <Button
          variant={activeTab === "create" ? "default" : "ghost"}
          onClick={() => setActiveTab("create")}
          className="rounded-none border-b-2 border-transparent"
        >
          <Route className="h-4 w-4 mr-2" />
          Create Route
        </Button>
      </div>

      {/* Live Tracking Tab */}
      {activeTab === "track" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Route List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold">Active Routes</h3>
            {plannedRoutes
              .filter((route) => route.status === "active")
              .map((route) => {
                const progress = routeProgress[route.id];
                const health = progress
                  ? calculateRouteHealth(route, progress)
                  : 0;

                return (
                  <Card
                    key={route.id}
                    className={`cursor-pointer transition-all ${
                      selectedRoute?.id === route.id
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{route.route_name}</h4>
                        <Badge className={getStatusColor(route.status)}>
                          {getStatusIcon(route.status)}
                          <span className="ml-1">{route.status}</span>
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Tourist: {route.tourist_name}
                        </div>

                        {progress && (
                          <>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Progress</span>
                                <span>
                                  {progress.progress_percentage.toFixed(0)}%
                                </span>
                              </div>
                              <Progress
                                value={progress.progress_percentage}
                                className="h-2"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">
                                  Time Left:
                                </span>
                                <div>
                                  {Math.round(
                                    progress.estimated_time_remaining
                                  )}
                                  m
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Health:
                                </span>
                                <div
                                  className={`font-medium ${
                                    health > 80
                                      ? "text-green-600"
                                      : health > 60
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {health.toFixed(0)}%
                                </div>
                              </div>
                            </div>

                            {progress.current_deviation >
                              route.max_deviation_distance && (
                              <div className="flex items-center text-xs text-orange-600">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {progress.current_deviation.toFixed(0)}m
                                deviation
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          {/* Route Details & Map */}
          <div className="lg:col-span-2 space-y-6">
            {selectedRoute && routeProgress[selectedRoute.id] && (
              <>
                {/* Route Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedRoute.route_name}</span>
                      <div className="flex gap-2">
                        {selectedRoute.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePauseRoute(selectedRoute.id)}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        )}
                        {selectedRoute.status === "paused" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartRoute(selectedRoute.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCompleteRoute(selectedRoute.id)}
                        >
                          <Target className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Live tracking for {selectedRoute.tourist_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {routeProgress[
                            selectedRoute.id
                          ].progress_percentage.toFixed(0)}
                          %
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Progress
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {Math.round(
                            routeProgress[selectedRoute.id]
                              .estimated_time_remaining
                          )}
                          m
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Time Left
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {routeProgress[selectedRoute.id].speed_kmh.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          km/h
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {routeProgress[
                            selectedRoute.id
                          ].current_deviation.toFixed(0)}
                          m
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Deviation
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Waypoints Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>Route Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedRoute.waypoints.map((waypoint, index) => (
                        <div
                          key={waypoint.id}
                          className="flex items-center gap-3"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              index < selectedRoute.current_waypoint_index
                                ? "bg-green-500 text-white"
                                : index === selectedRoute.current_waypoint_index
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{waypoint.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ETA: {waypoint.estimated_arrival} •{" "}
                              {waypoint.visit_duration}min visit
                            </div>
                          </div>
                          {index === selectedRoute.current_waypoint_index && (
                            <Badge variant="default">Current</Badge>
                          )}
                          {index < selectedRoute.current_waypoint_index && (
                            <Badge variant="secondary">Completed</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Route Alerts */}
                {routeProgress[selectedRoute.id].route_alerts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Route Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {routeProgress[selectedRoute.id].route_alerts.map(
                          (alert, index) => (
                            <div
                              key={index}
                              className={`p-3 rounded border-l-4 ${getSeverityColor(
                                alert.severity
                              )}`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{alert.type}</Badge>
                                <Badge variant="outline">
                                  {alert.severity}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(
                                    alert.timestamp
                                  ).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm">{alert.message}</p>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Manage Routes Tab */}
      {activeTab === "manage" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">All Routes</h3>
          {plannedRoutes.map((route) => (
            <Card key={route.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold">
                        {route.route_name}
                      </h4>
                      <Badge className={getStatusColor(route.status)}>
                        {getStatusIcon(route.status)}
                        <span className="ml-1">{route.status}</span>
                      </Badge>
                      <Badge variant="outline">{route.route_type}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Navigation className="h-4 w-4 mr-1" />
                        {(route.total_distance / 1000).toFixed(1)} km
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {Math.round(route.estimated_duration / 60)}h{" "}
                        {route.estimated_duration % 60}m
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Flag className="h-4 w-4 mr-1" />
                        {route.waypoints.length} waypoints
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Compass className="h-4 w-4 mr-1" />
                        Max deviation: {route.max_deviation_distance}m
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-medium">Waypoints:</h5>
                      <div className="flex flex-wrap gap-2">
                        {route.waypoints.map((waypoint, index) => (
                          <div
                            key={waypoint.id}
                            className="flex items-center gap-1 text-sm"
                          >
                            <span className="text-muted-foreground">
                              {index + 1}.
                            </span>
                            <span>{waypoint.name}</span>
                            {index < route.waypoints.length - 1 && (
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {route.status === "planned" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleStartRoute(route.id)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {route.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePauseRoute(route.id)}
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Navigation className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Route Tab */}
      {activeTab === "create" && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Route</CardTitle>
            <CardDescription>
              Plan a new route with waypoints and AI monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Route className="h-12 w-12 mx-auto mb-4" />
              <p>Route creation interface would be implemented here</p>
              <p className="text-sm">
                Features: Drag & drop waypoints, route optimization, time
                estimation
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RouteTrackingSystem;
