import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  AlertTriangle,
  MapPin,
  Clock,
  User,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Shield,
  Navigation,
  Activity,
  Battery,
  Signal,
  Globe,
  ArrowLeft,
  RefreshCw,
  Download,
  Bell,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  anomalyDetectionService,
  type AnomalyDetectionResult,
} from "@/services/anomalyDetectionService";
import { TouristService } from "@/services/touristService";
import MapView from "@/components/MapView";
import MissingPersonAlertSystem from "@/components/MissingPersonAlertSystem";
import RouteTrackingSystem from "@/components/RouteTrackingSystem";

interface AnomalyInvestigation {
  id: string;
  tourist_id: string;
  tourist_name: string;
  anomaly_type: string;
  severity_level: "low" | "medium" | "high" | "critical";
  severity_score: number;
  location_lat: number;
  location_lng: number;
  details: Record<string, unknown>;
  status: "active" | "investigating" | "resolved" | "false_positive";
  created_at: string;
  resolved_at?: string;
  assigned_investigator?: string;
  investigation_notes?: string;
  evidence?: Array<{
    type: "location" | "communication" | "device" | "witness";
    description: string;
    timestamp: string;
    metadata: Record<string, unknown>;
  }>;
}

interface MissingPersonCase {
  id: string;
  tourist_id: string;
  tourist_name: string;
  last_known_location: { latitude: number; longitude: number };
  missing_since: string;
  risk_factors: string[];
  search_radius: number;
  priority: "low" | "medium" | "high" | "critical";
  status: "reported" | "searching" | "found" | "escalated";
  assigned_units: string[];
  evidence: Array<{
    type: "location" | "communication" | "witness" | "device";
    description: string;
    timestamp: string;
    metadata: Record<string, unknown>;
  }>;
}

interface LocationMonitoring {
  tourist_id: string;
  tourist_name: string;
  current_location: { latitude: number; longitude: number };
  last_update: string;
  movement_pattern: "stationary" | "walking" | "vehicle" | "unknown";
  activity_level: number;
  device_status: "online" | "offline" | "low_battery" | "no_signal";
  battery_level: number;
  route_deviation: number;
  inactivity_duration: number;
  risk_score: number;
  anomalies_count: number;
}

const AnomalyInvestigationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("anomalies");

  // Data states
  const [anomalies, setAnomalies] = useState<AnomalyInvestigation[]>([]);
  const [missingPersons, setMissingPersons] = useState<MissingPersonCase[]>([]);
  const [liveMonitoring, setLiveMonitoring] = useState<LocationMonitoring[]>(
    []
  );
  const [selectedAnomaly, setSelectedAnomaly] =
    useState<AnomalyInvestigation | null>(null);
  const [showMissingPersonDialog, setShowMissingPersonDialog] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalAnomalies: 0,
    criticalAnomalies: 0,
    activeMissingPersons: 0,
    resolvedToday: 0,
    averageResponseTime: 0,
  });

  const touristService = TouristService.getInstance();

  useEffect(() => {
    loadDashboardData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array is intentional for initial load

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load anomalies (simulated data for now)
      const anomaliesData: AnomalyInvestigation[] = [
        {
          id: "anom_001",
          tourist_id: "tourist_001",
          tourist_name: "John Smith",
          anomaly_type: "sudden_drop_off",
          severity_level: "critical",
          severity_score: 92,
          location_lat: 28.6139,
          location_lng: 77.209,
          details: {
            distanceKm: 45.2,
            timeGapMinutes: 15,
            speedKmh: 180,
            previousLocation: { lat: 28.5355, lng: 77.391 },
          },
          status: "active",
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          evidence: [
            {
              type: "location",
              description: "Sudden 45km movement in 15 minutes",
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              metadata: { speed: 180, accuracy: 5 },
            },
          ],
        },
        {
          id: "anom_002",
          tourist_id: "tourist_002",
          tourist_name: "Sarah Connor",
          anomaly_type: "prolonged_inactivity",
          severity_level: "high",
          severity_score: 75,
          location_lat: 28.5355,
          location_lng: 77.391,
          details: {
            inactivityMinutes: 120,
            lastActivity: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
            batteryLevel: 15,
          },
          status: "investigating",
          created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          assigned_investigator: "Officer Martinez",
          investigation_notes:
            "Attempting to contact tourist. Low battery detected.",
          evidence: [
            {
              type: "device",
              description: "No movement detected for 2 hours",
              timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
              metadata: { battery: 15, lastSignal: "weak" },
            },
          ],
        },
        {
          id: "anom_003",
          tourist_id: "tourist_003",
          tourist_name: "Mike Johnson",
          anomaly_type: "route_deviation",
          severity_level: "medium",
          severity_score: 58,
          location_lat: 28.7041,
          location_lng: 77.1025,
          details: {
            deviationMeters: 2500,
            plannedRoute: "Red Fort to India Gate",
            currentLocation: "Old Delhi Railway Station",
          },
          status: "resolved",
          created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
          resolved_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          investigation_notes: "Tourist took detour for food. False positive.",
          evidence: [],
        },
      ];

      const missingPersonsData: MissingPersonCase[] = [
        {
          id: "missing_001",
          tourist_id: "tourist_004",
          tourist_name: "Lisa Anderson",
          last_known_location: { latitude: 28.6562, longitude: 77.241 },
          missing_since: new Date(
            Date.now() - 6 * 60 * 60 * 1000
          ).toISOString(),
          risk_factors: [
            "device_offline",
            "route_deviation",
            "prolonged_silence",
          ],
          search_radius: 5000,
          priority: "critical",
          status: "searching",
          assigned_units: ["Unit-Alpha", "Unit-Bravo", "K9-Team-1"],
          evidence: [
            {
              type: "location",
              description: "Last GPS ping near Chandni Chowk",
              timestamp: new Date(
                Date.now() - 6 * 60 * 60 * 1000
              ).toISOString(),
              metadata: { accuracy: 10, signal_strength: "weak" },
            },
            {
              type: "witness",
              description: "Street vendor saw her asking for directions",
              timestamp: new Date(
                Date.now() - 5 * 60 * 60 * 1000
              ).toISOString(),
              metadata: {
                witness_contact: "+91-9876543210",
                reliability: "high",
              },
            },
          ],
        },
      ];

      const liveMonitoringData: LocationMonitoring[] = [
        {
          tourist_id: "tourist_005",
          tourist_name: "David Chen",
          current_location: { latitude: 28.6139, longitude: 77.209 },
          last_update: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          movement_pattern: "walking",
          activity_level: 75,
          device_status: "online",
          battery_level: 85,
          route_deviation: 50,
          inactivity_duration: 5,
          risk_score: 15,
          anomalies_count: 0,
        },
        {
          tourist_id: "tourist_006",
          tourist_name: "Emma Wilson",
          current_location: { latitude: 28.5355, longitude: 77.391 },
          last_update: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
          movement_pattern: "vehicle",
          activity_level: 90,
          device_status: "online",
          battery_level: 45,
          route_deviation: 0,
          inactivity_duration: 0,
          risk_score: 25,
          anomalies_count: 1,
        },
      ];

      setAnomalies(anomaliesData);
      setMissingPersons(missingPersonsData);
      setLiveMonitoring(liveMonitoringData);

      // Calculate statistics
      setStats({
        totalAnomalies: anomaliesData.length,
        criticalAnomalies: anomaliesData.filter(
          (a) => a.severity_level === "critical"
        ).length,
        activeMissingPersons: missingPersonsData.filter(
          (m) => m.status === "searching"
        ).length,
        resolvedToday: anomaliesData.filter(
          (a) =>
            a.status === "resolved" &&
            new Date(a.resolved_at || "").toDateString() ===
              new Date().toDateString()
        ).length,
        averageResponseTime: 45, // minutes
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load investigation data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnomalyStatusUpdate = async (
    anomalyId: string,
    newStatus: string
  ) => {
    try {
      const updatedAnomalies = anomalies.map((anomaly) =>
        anomaly.id === anomalyId
          ? {
              ...anomaly,
              status: newStatus as
                | "active"
                | "investigating"
                | "resolved"
                | "false_positive",
              resolved_at:
                newStatus === "resolved" ? new Date().toISOString() : undefined,
            }
          : anomaly
      );
      setAnomalies(updatedAnomalies);

      toast({
        title: "Status Updated",
        description: `Anomaly marked as ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating anomaly status:", error);
      toast({
        title: "Error",
        description: "Failed to update anomaly status",
        variant: "destructive",
      });
    }
  };

  const handleInvestigate = (anomaly: AnomalyInvestigation) => {
    setSelectedAnomaly(anomaly);
    handleAnomalyStatusUpdate(anomaly.id, "investigating");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-black";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "investigating":
        return <Eye className="h-4 w-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "false_positive":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const filteredAnomalies = anomalies.filter((anomaly) => {
    const matchesSearch =
      anomaly.tourist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anomaly.anomaly_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity =
      severityFilter === "all" || anomaly.severity_level === severityFilter;
    const matchesStatus =
      statusFilter === "all" || anomaly.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
          <p className="text-muted-foreground">
            Loading investigation dashboard...
          </p>
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
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-primary mr-3" />
                <div>
                  <h1 className="text-2xl font-bold">
                    AI Anomaly Investigation Center
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Real-time monitoring and investigation of tourist safety
                    anomalies
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200"
              >
                <Bell className="h-3 w-3 mr-1" />
                {stats.criticalAnomalies} Critical
              </Badge>
              <Button variant="outline" size="sm" onClick={loadDashboardData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowMissingPersonDialog(true)}
              >
                <User className="h-4 w-4 mr-2" />
                Report Missing Person
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Anomalies
                  </p>
                  <p className="text-2xl font-bold">{stats.totalAnomalies}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.criticalAnomalies}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Missing Persons
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.activeMissingPersons}
                  </p>
                </div>
                <User className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Resolved Today
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.resolvedToday}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                  <p className="text-2xl font-bold">
                    {stats.averageResponseTime}m
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="anomalies">Active Anomalies</TabsTrigger>
            <TabsTrigger value="missing">Missing Persons</TabsTrigger>
            <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
            <TabsTrigger value="routes">Route Tracking</TabsTrigger>
          </TabsList>

          {/* Anomalies Tab */}
          <TabsContent value="anomalies" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by tourist name or anomaly type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select
                    value={severityFilter}
                    onValueChange={setSeverityFilter}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="investigating">
                        Investigating
                      </SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="false_positive">
                        False Positive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Anomalies List */}
            <div className="grid gap-4">
              {filteredAnomalies.map((anomaly) => (
                <Card
                  key={anomaly.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(anomaly.status)}
                          <h3 className="text-lg font-semibold">
                            {anomaly.tourist_name}
                          </h3>
                          <Badge
                            className={getSeverityColor(anomaly.severity_level)}
                          >
                            {anomaly.severity_level}
                          </Badge>
                          <Badge variant="outline">
                            {anomaly.anomaly_type
                              .replace("_", " ")
                              .toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            {anomaly.location_lat.toFixed(4)},{" "}
                            {anomaly.location_lng.toFixed(4)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(anomaly.created_at).toLocaleString()}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Risk Score: {anomaly.severity_score}/100
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Details:</h4>
                          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                            {JSON.stringify(anomaly.details, null, 2)}
                          </div>
                        </div>

                        {anomaly.investigation_notes && (
                          <div className="mt-4 p-3 bg-blue-50 rounded">
                            <h4 className="font-medium text-blue-900">
                              Investigation Notes:
                            </h4>
                            <p className="text-sm text-blue-800">
                              {anomaly.investigation_notes}
                            </p>
                            {anomaly.assigned_investigator && (
                              <p className="text-xs text-blue-600 mt-1">
                                Assigned to: {anomaly.assigned_investigator}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {anomaly.status === "active" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleInvestigate(anomaly)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Investigate
                          </Button>
                        )}
                        {anomaly.status === "investigating" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleAnomalyStatusUpdate(
                                  anomaly.id,
                                  "resolved"
                                )
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleAnomalyStatusUpdate(
                                  anomaly.id,
                                  "false_positive"
                                )
                              }
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              False Positive
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`tel:+911234567890`)}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Missing Persons Tab */}
          <TabsContent value="missing" className="space-y-6">
            <div className="grid gap-4">
              {missingPersons.map((person) => (
                <Card
                  key={person.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <User className="h-5 w-5 text-red-500" />
                          <h3 className="text-lg font-semibold">
                            {person.tourist_name}
                          </h3>
                          <Badge className={getSeverityColor(person.priority)}>
                            {person.priority} Priority
                          </Badge>
                          <Badge variant="outline">
                            {person.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            Last seen:{" "}
                            {person.last_known_location.latitude.toFixed(
                              4
                            )},{" "}
                            {person.last_known_location.longitude.toFixed(4)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            Missing since:{" "}
                            {new Date(person.missing_since).toLocaleString()}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Navigation className="h-4 w-4 mr-1" />
                            Search radius:{" "}
                            {(person.search_radius / 1000).toFixed(1)} km
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Risk Factors:</h4>
                          <div className="flex flex-wrap gap-2">
                            {person.risk_factors.map((factor, index) => (
                              <Badge key={index} variant="secondary">
                                {factor.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {person.assigned_units.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium">Assigned Units:</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {person.assigned_units.map((unit, index) => (
                                <Badge key={index} variant="outline">
                                  {unit}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {person.evidence.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium">Evidence:</h4>
                            <div className="space-y-2 mt-2">
                              {person.evidence.map((evidence, index) => (
                                <div
                                  key={index}
                                  className="text-sm bg-muted p-2 rounded"
                                >
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {evidence.type}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(
                                        evidence.timestamp
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="mt-1">{evidence.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="default" size="sm">
                          <Shield className="h-4 w-4 mr-1" />
                          Deploy Units
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-1" />
                          Emergency Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Export Case
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Live Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid gap-4">
              {liveMonitoring.map((tourist) => (
                <Card
                  key={tourist.tourist_id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Activity className="h-5 w-5 text-green-500" />
                          <h3 className="text-lg font-semibold">
                            {tourist.tourist_name}
                          </h3>
                          <Badge
                            className={
                              tourist.risk_score > 70
                                ? "bg-red-500 text-white"
                                : tourist.risk_score > 40
                                ? "bg-yellow-500 text-black"
                                : "bg-green-500 text-white"
                            }
                          >
                            Risk: {tourist.risk_score}/100
                          </Badge>
                          <Badge variant="outline">
                            {tourist.movement_pattern}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            {tourist.current_location.latitude.toFixed(4)},{" "}
                            {tourist.current_location.longitude.toFixed(4)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            Updated:{" "}
                            {new Date(tourist.last_update).toLocaleTimeString()}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Battery className="h-4 w-4 mr-1" />
                            Battery: {tourist.battery_level}%
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Signal className="h-4 w-4 mr-1" />
                            Status: {tourist.device_status}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">
                              Activity Level
                            </div>
                            <Progress
                              value={tourist.activity_level}
                              className="h-2"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {tourist.activity_level}%
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">
                              Route Deviation
                            </div>
                            <div className="text-sm font-medium">
                              {tourist.route_deviation}m
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">
                              Inactivity Duration
                            </div>
                            <div className="text-sm font-medium">
                              {tourist.inactivity_duration} min
                            </div>
                          </div>
                        </div>

                        {tourist.anomalies_count > 0 && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              <span className="font-medium text-yellow-800">
                                {tourist.anomalies_count} anomalies detected
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <MapPin className="h-4 w-4 mr-1" />
                          Track
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Route Tracking Tab */}
          <TabsContent value="routes" className="space-y-6">
            <RouteTrackingSystem />
          </TabsContent>
        </Tabs>
      </div>

      {/* Missing Person Alert System Dialog */}
      <MissingPersonAlertSystem
        isOpen={showMissingPersonDialog}
        onClose={() => setShowMissingPersonDialog(false)}
      />

      {/* Investigation Modal/Sidebar could be added here for detailed anomaly investigation */}
    </div>
  );
};

export default AnomalyInvestigationDashboard;
