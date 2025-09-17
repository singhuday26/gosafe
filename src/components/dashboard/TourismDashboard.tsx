import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  TrendingUp,
  Users,
  AlertTriangle,
  Activity,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface TourismStats {
  total_tourists: number;
  active_tourists: number;
  popular_destinations: Array<{
    name: string;
    count: number;
    trend: "up" | "down" | "stable";
  }>;
  safety_incidents: number;
  average_visit_duration: number;
  tourist_satisfaction: number;
}

interface DestinationData {
  id: string;
  name: string;
  tourist_count: number;
  safety_rating: number;
  popular_times: string[];
  facilities: string[];
  last_updated: string;
}

export const TourismDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<TourismStats>({
    total_tourists: 0,
    active_tourists: 0,
    popular_destinations: [],
    safety_incidents: 0,
    average_visit_duration: 0,
    tourist_satisfaction: 0,
  });
  const [destinations, setDestinations] = useState<DestinationData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTourismData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchTourismStats(), fetchDestinationData()]);
    } catch (error) {
      console.error("Error fetching tourism data:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTourismData();
  }, [fetchTourismData]);

  const fetchTourismStats = async () => {
    try {
      const [
        { count: totalTourists },
        { count: activeTourists },
        { count: safetyIncidents },
      ] = await Promise.all([
        supabase
          .from("digital_tourist_ids")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("digital_tourist_ids")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("sos_alerts")
          .select("*", { count: "exact", head: true })
          .gte(
            "timestamp",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          ),
      ]);

      // Simulate popular destinations data
      const popularDestinations = [
        { name: "India Gate", count: 234, trend: "up" as const },
        { name: "Red Fort", count: 189, trend: "up" as const },
        { name: "Qutub Minar", count: 156, trend: "stable" as const },
        { name: "Lotus Temple", count: 143, trend: "down" as const },
        { name: "Humayun's Tomb", count: 98, trend: "up" as const },
      ];

      setStats({
        total_tourists: totalTourists || 0,
        active_tourists: activeTourists || 0,
        popular_destinations: popularDestinations,
        safety_incidents: safetyIncidents || 0,
        average_visit_duration: 4.2, // Simulated - hours
        tourist_satisfaction: 8.7, // Simulated - out of 10
      });
    } catch (error) {
      console.error("Error fetching tourism stats:", error);
    }
  };

  const fetchDestinationData = () => {
    // Simulate destination data
    const destinationData = [
      {
        id: "dest_1",
        name: "India Gate",
        tourist_count: 234,
        safety_rating: 9.2,
        popular_times: ["10:00-12:00", "16:00-18:00"],
        facilities: ["Parking", "Restrooms", "Food Stalls", "Security"],
        last_updated: new Date().toISOString(),
      },
      {
        id: "dest_2",
        name: "Red Fort",
        tourist_count: 189,
        safety_rating: 8.8,
        popular_times: ["09:00-11:00", "15:00-17:00"],
        facilities: ["Guided Tours", "Museum", "Audio Guides", "First Aid"],
        last_updated: new Date().toISOString(),
      },
      {
        id: "dest_3",
        name: "Qutub Minar",
        tourist_count: 156,
        safety_rating: 8.5,
        popular_times: ["08:00-10:00", "14:00-16:00"],
        facilities: ["Archaeological Museum", "Garden", "Photography Allowed"],
        last_updated: new Date().toISOString(),
      },
      {
        id: "dest_4",
        name: "Lotus Temple",
        tourist_count: 143,
        safety_rating: 9.5,
        popular_times: ["09:00-11:00", "15:00-17:00"],
        facilities: ["Information Center", "Meditation Hall", "Gardens"],
        last_updated: new Date().toISOString(),
      },
    ];

    setDestinations(destinationData);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSafetyRatingColor = (rating: number) => {
    if (rating >= 9) return "bg-green-100 text-green-800";
    if (rating >= 7) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading tourism dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tourism Department Dashboard</h1>
        <Button onClick={fetchTourismData}>Refresh Data</Button>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tourists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_tourists}</div>
            <p className="text-xs text-muted-foreground">Registered visitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Currently Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.active_tourists}
            </div>
            <p className="text-xs text-muted-foreground">Active IDs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Safety Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.safety_incidents}
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Visit Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.average_visit_duration}h
            </div>
            <p className="text-xs text-muted-foreground">Per destination</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Satisfaction Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.tourist_satisfaction}/10
            </div>
            <p className="text-xs text-muted-foreground">Tourist rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Destinations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{destinations.length}</div>
            <p className="text-xs text-muted-foreground">Monitored sites</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="destinations">Popular Destinations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="safety">Safety Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Destinations Ranking</CardTitle>
                <CardDescription>
                  Top visited locations with trend indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.popular_destinations.map((dest, index) => (
                    <div
                      key={dest.name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{dest.name}</p>
                          <p className="text-sm text-gray-500">
                            {dest.count} visitors today
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(dest.trend)}
                        <span className="text-sm text-gray-600">
                          {dest.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-time Tourist Distribution</CardTitle>
                <CardDescription>
                  Current tourist concentrations across Delhi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm text-gray-600">
                      Interactive distribution map
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Showing {stats.active_tourists} active tourists
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="destinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Destination Management</CardTitle>
              <CardDescription>
                Monitor tourist flow and safety ratings for key destinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {destinations.map((destination) => (
                  <Card key={destination.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {destination.name}
                          </CardTitle>
                          <CardDescription>
                            <Users className="w-3 h-3 inline mr-1" />
                            {destination.tourist_count} visitors today
                          </CardDescription>
                        </div>
                        <Badge
                          className={getSafetyRatingColor(
                            destination.safety_rating
                          )}
                        >
                          Safety: {destination.safety_rating}/10
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Popular Times:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {destination.popular_times.map((time, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {time}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Facilities:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {destination.facilities.map((facility, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {facility}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            Manage Alerts
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visitor Trends</CardTitle>
                <CardDescription>
                  Tourist arrival patterns and seasonal data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm text-gray-600">
                      Analytics charts would appear here
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Hourly, daily, and monthly trends
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators for tourism management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">
                      Tourist Engagement Rate
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      85.2%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">
                      Digital ID Adoption
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      92.7%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium">
                      Safety Response Time
                    </span>
                    <span className="text-lg font-bold text-yellow-600">
                      8.5 min
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium">
                      Tourist Retention Rate
                    </span>
                    <span className="text-lg font-bold text-purple-600">
                      78.3%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="safety" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Safety Monitoring</CardTitle>
              <CardDescription>
                Real-time safety alerts and incident management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-red-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-red-700">
                      Critical Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">2</div>
                    <p className="text-xs text-red-600">
                      Require immediate attention
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-2 w-full"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-yellow-700">
                      Medium Priority
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">7</div>
                    <p className="text-xs text-yellow-600">Under monitoring</p>
                    <Button variant="outline" size="sm" className="mt-2 w-full">
                      Review
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-green-700">
                      Resolved Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">15</div>
                    <p className="text-xs text-green-600">
                      Successfully handled
                    </p>
                    <Button variant="outline" size="sm" className="mt-2 w-full">
                      Reports
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">
                  Recent Safety Incidents
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      id: 1,
                      type: "Medical Emergency",
                      location: "Red Fort",
                      time: "2 hours ago",
                      status: "Resolved",
                      severity: "Medium",
                    },
                    {
                      id: 2,
                      type: "Lost Tourist",
                      location: "Connaught Place",
                      time: "4 hours ago",
                      status: "Active",
                      severity: "High",
                    },
                    {
                      id: 3,
                      type: "Security Alert",
                      location: "India Gate",
                      time: "6 hours ago",
                      status: "Investigating",
                      severity: "Critical",
                    },
                  ].map((incident) => (
                    <div
                      key={incident.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="font-medium">{incident.type}</p>
                          <p className="text-sm text-gray-500">
                            {incident.location} • {incident.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            incident.severity === "Critical"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {incident.severity}
                        </Badge>
                        <Badge
                          variant={
                            incident.status === "Resolved"
                              ? "default"
                              : "outline"
                          }
                        >
                          {incident.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
