import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapPin,
  Clock,
  AlertTriangle,
  User,
  FileText,
  Search,
  Filter,
  Download,
  Phone,
  Eye,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  policeDashboardService,
  type TouristCluster,
  type RiskZone,
  type MissingPerson,
  type DigitalIDRecord,
  type AlertHistory,
} from "@/services/policeDashboardService";

interface DashboardStats {
  total_tourists: number;
  active_alerts: number;
  missing_persons: number;
  risk_zones: number;
  response_time_avg: number;
  recent_incidents: number;
}

const getRiskLevelColor = (level: string) => {
  switch (level) {
    case "low":
      return "bg-green-100 text-green-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "critical":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-red-100 text-red-800";
    case "investigating":
      return "bg-blue-100 text-blue-800";
    case "responded":
      return "bg-yellow-100 text-yellow-800";
    case "resolved":
    case "found":
    case "closed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const PoliceDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    total_tourists: 0,
    active_alerts: 0,
    missing_persons: 0,
    risk_zones: 0,
    response_time_avg: 0,
    recent_incidents: 0,
  });
  const [clusters, setClusters] = useState<TouristCluster[]>([]);
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>([]);
  const [digitalIDs, setDigitalIDs] = useState<DigitalIDRecord[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchStats(),
          fetchDigitalIDs(),
          fetchAlertHistory(),
          fetchClusters(),
          fetchRiskZones(),
          fetchMissingPersons(),
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchDigitalIDs(),
        fetchAlertHistory(),
        fetchClusters(),
        fetchRiskZones(),
        fetchMissingPersons(),
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const stats = await policeDashboardService.getDashboardStats();
      setStats(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchDigitalIDs = async () => {
    try {
      const { records } = await policeDashboardService.getDigitalIDRecords({
        limit: 20,
      });
      setDigitalIDs(records);
    } catch (error) {
      console.error("Error fetching digital IDs:", error);
    }
  };

  const fetchAlertHistory = async () => {
    try {
      const { alerts } = await policeDashboardService.getAlertHistory({
        limit: 20,
      });
      setAlertHistory(alerts);
    } catch (error) {
      console.error("Error fetching alert history:", error);
    }
  };

  const fetchClusters = async () => {
    try {
      const clusters = await policeDashboardService.getTouristClusters();
      setClusters(clusters);
    } catch (error) {
      console.error("Error fetching clusters:", error);
    }
  };

  const fetchRiskZones = async () => {
    try {
      const zones = await policeDashboardService.getRiskZones();
      setRiskZones(zones);
    } catch (error) {
      console.error("Error fetching risk zones:", error);
    }
  };

  const fetchMissingPersons = async () => {
    try {
      const { cases } = await policeDashboardService.getMissingPersons({
        limit: 20,
      });
      setMissingPersons(cases);
    } catch (error) {
      console.error("Error fetching missing persons:", error);
    }
  };

  const generateEFIR = async (missingPersonId: string) => {
    try {
      // Simulate E-FIR generation
      const updatedCases = missingPersons.map((case_) =>
        case_.id === missingPersonId
          ? {
              ...case_,
              efir_generated: true,
              efir_number: `EFIR${Date.now()}`,
              efir_data: {
                generated_at: new Date().toISOString(),
                case_details: case_.description,
                officer_id: user?.id,
              },
            }
          : case_
      );
      setMissingPersons(updatedCases);
      alert("E-FIR generated successfully!");
    } catch (error) {
      console.error("Error generating E-FIR:", error);
      alert("Error generating E-FIR");
    }
  };

  const filteredMissingPersons = missingPersons.filter((case_) => {
    const matchesSearch =
      searchTerm === "" ||
      case_.tourist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.case_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || case_.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredAlerts = alertHistory.filter((alert) => {
    const matchesSearch =
      searchTerm === "" ||
      alert.tourist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alert_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || alert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDigitalIDs = digitalIDs.filter((record) => {
    const matchesSearch =
      searchTerm === "" ||
      record.tourist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.aadhaar_number.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading police dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Police Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDashboardData}>
            Refresh Data
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tourists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_tourists}</div>
            <p className="text-xs text-muted-foreground">Active digital IDs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.active_alerts}
            </div>
            <p className="text-xs text-muted-foreground">Require response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Missing Persons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.missing_persons}
            </div>
            <p className="text-xs text-muted-foreground">Open cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.risk_zones}</div>
            <p className="text-xs text-muted-foreground">Active zones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.response_time_avg}m</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recent_incidents}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clusters">Tourist Clusters</TabsTrigger>
          <TabsTrigger value="missing">Missing Persons</TabsTrigger>
          <TabsTrigger value="alerts">Alert History</TabsTrigger>
          <TabsTrigger value="digital-ids">Digital IDs</TabsTrigger>
          <TabsTrigger value="risk-zones">Risk Zones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Tourist Heat Map</CardTitle>
                <CardDescription>
                  Real-time tourist concentration areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Interactive heat map would appear here
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Showing{" "}
                      {clusters.reduce((sum, c) => sum + c.tourist_count, 0)}{" "}
                      tourists across {clusters.length} clusters
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest alerts and incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {alertHistory.slice(0, 5).map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-start space-x-3 p-2 rounded-lg border"
                      >
                        <AlertTriangle className="w-4 h-4 mt-1 text-red-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {alert.tourist_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {alert.alert_type} alert
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(alert.status)}>
                          {alert.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clusters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tourist Clusters & Heat Maps</CardTitle>
              <CardDescription>
                Real-time visualization of tourist concentrations and
                high-traffic areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clusters.map((cluster) => (
                  <Card key={cluster.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {cluster.area_name}
                      </CardTitle>
                      <CardDescription>
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {cluster.center_lat.toFixed(4)},{" "}
                        {cluster.center_lng.toFixed(4)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Tourist Count:</span>
                          <span className="font-semibold">
                            {cluster.tourist_count}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Risk Level:</span>
                          <Badge
                            className={getRiskLevelColor(cluster.risk_level)}
                          >
                            {cluster.risk_level}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Radius:</span>
                          <span className="text-sm">
                            {cluster.radius_meters}m
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Last updated:{" "}
                          {new Date(cluster.last_updated).toLocaleTimeString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Missing Persons Cases</CardTitle>
              <CardDescription>
                Track and manage missing tourist cases with automated E-FIR
                generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name or case number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="found">Found</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredMissingPersons.map((case_) => (
                  <Card key={case_.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {case_.tourist_name}
                          </CardTitle>
                          <CardDescription>
                            Case #{case_.case_number}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(case_.status)}>
                            {case_.status}
                          </Badge>
                          <Badge
                            className={getRiskLevelColor(case_.priority_level)}
                          >
                            {case_.priority_level} priority
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">
                              Missing since:{" "}
                              {new Date(case_.missing_since).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">
                              Last known: {case_.last_known_location.address}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">
                              Officer: {case_.assigned_officer_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">
                              Emergency Contact:{" "}
                              {case_.emergency_contacts &&
                                Array.isArray(case_.emergency_contacts) &&
                                case_.emergency_contacts.length > 0 &&
                                typeof case_.emergency_contacts[0] ===
                                  "object" &&
                                case_.emergency_contacts[0] !== null && (
                                  <>
                                    {
                                      (
                                        case_.emergency_contacts[0] as Record<
                                          string,
                                          unknown
                                        >
                                      ).name
                                    }{" "}
                                    (
                                    {
                                      (
                                        case_.emergency_contacts[0] as Record<
                                          string,
                                          unknown
                                        >
                                      ).phone
                                    }
                                    )
                                  </>
                                )}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium">Description:</p>
                            <p className="text-sm text-gray-600">
                              {case_.description}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Physical Description:
                            </p>
                            <p className="text-sm text-gray-600">
                              {case_.physical_description}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {!case_.efir_generated && (
                          <Button
                            onClick={() => generateEFIR(case_.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Generate E-FIR
                          </Button>
                        )}
                        {case_.efir_generated && (
                          <Button variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View E-FIR #{case_.efir_number}
                          </Button>
                        )}
                        <Button variant="outline">View Location History</Button>
                        <Button variant="outline">Contact Family</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>
                Complete history of SOS alerts and emergency responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by tourist name or alert type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {filteredAlerts.map((alert) => (
                  <Card key={alert.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <h3 className="font-semibold">
                              {alert.tourist_name}
                            </h3>
                            <Badge className={getStatusColor(alert.status)}>
                              {alert.status}
                            </Badge>
                            <Badge variant="outline">{alert.alert_type}</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Location:</span>
                              <p>
                                {alert.address ||
                                  `${alert.latitude.toFixed(
                                    4
                                  )}, ${alert.longitude.toFixed(4)}`}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Time:</span>
                              <p>
                                {new Date(alert.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Response Time:
                              </span>
                              <p>
                                {alert.response_time
                                  ? `${alert.response_time} minutes`
                                  : "Pending"}
                              </p>
                            </div>
                          </div>
                          {alert.message && (
                            <div className="mt-2">
                              <span className="text-gray-500 text-sm">
                                Message:
                              </span>
                              <p className="text-sm">{alert.message}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          {alert.status === "active" && (
                            <Button size="sm">Respond</Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="digital-ids" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Digital ID Records</CardTitle>
              <CardDescription>
                Access tourist digital identification records and last known
                locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name or Aadhaar number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {filteredDigitalIDs.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <User className="w-5 h-5 text-blue-500" />
                            <h3 className="font-semibold">
                              {record.tourist_name}
                            </h3>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                            {record.active_alerts &&
                              record.active_alerts > 0 && (
                                <Badge className="bg-red-100 text-red-800">
                                  {record.active_alerts} active alerts
                                </Badge>
                              )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Aadhaar:</span>
                              <p className="font-mono">
                                {record.aadhaar_number}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Passport:</span>
                              <p className="font-mono">
                                {record.passport_number || "N/A"}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Valid Until:
                              </span>
                              <p>
                                {new Date(record.valid_to).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Current Location:
                              </span>
                              <p>
                                {record.current_location
                                  ? `${record.current_location.lat.toFixed(
                                      4
                                    )}, ${record.current_location.lng.toFixed(
                                      4
                                    )}`
                                  : "Unknown"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="text-gray-500 text-sm">
                              Trip Itinerary:
                            </span>
                            <p className="text-sm">{record.trip_itinerary}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Full Record
                          </Button>
                          <Button variant="outline" size="sm">
                            Track Location
                          </Button>
                          <Button variant="outline" size="sm">
                            Contact Tourist
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

        <TabsContent value="risk-zones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Zones Management</CardTitle>
              <CardDescription>
                Monitor and manage high-risk areas with safety recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskZones.map((zone) => (
                  <Card key={zone.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{zone.name}</CardTitle>
                          <CardDescription>
                            {zone.incident_count} incidents recorded
                            {zone.last_incident_date && (
                              <span>
                                {" "}
                                • Last incident:{" "}
                                {new Date(
                                  zone.last_incident_date
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <Badge className={getRiskLevelColor(zone.risk_level)}>
                          {zone.risk_level} risk
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Risk Factors:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {zone.risk_factors.map((factor, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Recommendations:
                          </p>
                          <p className="text-sm text-gray-600">
                            {zone.recommendations}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View on Map
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit Zone
                          </Button>
                          <Button variant="outline" size="sm">
                            Safety Report
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
      </Tabs>
    </div>
  );
};
