import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Users,
  Shield,
  BarChart3,
  MapPin,
  Database,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Globe,
  Lock,
  Download,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BlockchainService, mockGeoFences } from "@/lib/blockchain";
import GeoFenceEditor from "@/components/GeoFenceEditor";
import { PoliceDashboard } from "@/components/dashboard/PoliceDashboard";
import { TourismDashboard } from "@/components/dashboard/TourismDashboard";

// Define GeoFence type locally since we need it for state management
interface GeoFence {
  id: string;
  name: string;
  type: "safe" | "restricted" | "danger";
  coordinates: Array<{ lat: number; lng: number }>;
  description: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [geoFences, setGeoFences] = useState<GeoFence[]>([]);
  const [systemSettings, setSystemSettings] = useState({
    aiAnomalyDetection: true,
    geoFenceAlerts: true,
    autoEFIR: true,
    multilingualSupport: true,
    offlineMode: false,
    emergencyBroadcast: true,
  });

  const blockchain = BlockchainService.getInstance();
  const allTourists = blockchain.getAllDigitalIDs();
  const allAlerts = blockchain.getAllSOSAlerts();

  useEffect(() => {
    // Simple admin authentication for demo
    const adminAuth = localStorage.getItem("adminAuth");
    if (adminAuth) {
      setIsAuthenticated(true);
    }

    // Initialize with mock geofences
    setGeoFences(
      mockGeoFences.map((fence) => ({
        ...fence,
        description: fence.description || "No description provided",
      }))
    );
  }, []);

  const handleAdminLogin = () => {
    // Demo password
    if (adminPassword === "admin2025") {
      localStorage.setItem("adminAuth", "true");
      setIsAuthenticated(true);
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the system administration panel.",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid administrator password.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
    navigate("/");
  };

  // GeoFence management functions
  const handleGeoFenceCreate = (newGeoFence: Omit<GeoFence, "id">) => {
    const id = `gf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const geoFence: GeoFence = { ...newGeoFence, id };
    setGeoFences((prev) => [...prev, geoFence]);
  };

  const handleGeoFenceUpdate = (id: string, updates: Partial<GeoFence>) => {
    setGeoFences((prev) =>
      prev.map((fence) => (fence.id === id ? { ...fence, ...updates } : fence))
    );
  };

  const handleGeoFenceDelete = (id: string) => {
    setGeoFences((prev) => prev.filter((fence) => fence.id !== id));
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    setSystemSettings((prev) => ({ ...prev, [setting]: value }));
    toast({
      title: "Setting Updated",
      description: `${setting} has been ${value ? "enabled" : "disabled"}.`,
    });
  };

  const systemStats = [
    {
      title: "Total Tourists",
      value: allTourists.length,
      change: "+12%",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Active Sessions",
      value: allTourists.filter((t) => t.status === "active").length,
      change: "+8%",
      icon: Activity,
      color: "text-safety",
    },
    {
      title: "Total Alerts",
      value: allAlerts.length,
      change: "-15%",
      icon: AlertTriangle,
      color: "text-warning",
    },
    {
      title: "System Uptime",
      value: "99.9%",
      change: "+0.1%",
      icon: TrendingUp,
      color: "text-safety",
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md gradient-card shadow-medium">
          <CardHeader className="text-center">
            <div className="inline-flex p-4 rounded-full gradient-primary mb-4 mx-auto">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>
              Enter administrator password to access system controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="adminPassword">Administrator Password</Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
              />
            </div>
            <Button
              onClick={handleAdminLogin}
              className="w-full gradient-primary text-white"
            >
              <Shield className="mr-2 h-4 w-4" />
              Access Admin Panel
            </Button>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Demo Password: admin2025
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="mt-2"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
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
              <Settings className="h-8 w-8 text-primary mr-3" />
              <div>
                <h1 className="text-xl font-bold">System Administration</h1>
                <p className="text-sm text-muted-foreground">
                  Smart Tourist Safety Portal • SIH 2025
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant="secondary"
                className="bg-danger/10 text-danger border-danger/20"
              >
                <Shield className="mr-1 h-3 w-3" />
                Admin Access
              </Badge>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {systemStats.map((stat, index) => (
            <Card key={index} className="gradient-card shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      stat.change.startsWith("+")
                        ? "bg-safety/10 text-safety border-safety/20"
                        : stat.change.startsWith("-")
                        ? "bg-warning/10 text-warning border-warning/20"
                        : "bg-muted/10 text-muted-foreground"
                    }`}
                  >
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">
                  {stat.title}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="geofences">Geo-fences</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="police">Police Dashboard</TabsTrigger>
            <TabsTrigger value="tourism">Tourism Dept</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* System Health */}
              <Card className="gradient-card shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-safety" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">API Response Time</span>
                      <span className="text-sm font-semibold text-safety">
                        145ms
                      </span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Database Performance</span>
                      <span className="text-sm font-semibold text-safety">
                        98%
                      </span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Blockchain Sync</span>
                      <span className="text-sm font-semibold text-safety">
                        100%
                      </span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">AI Model Accuracy</span>
                      <span className="text-sm font-semibold text-safety">
                        94.7%
                      </span>
                    </div>
                    <Progress value={94.7} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card className="gradient-card shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="mr-2 h-5 w-5 text-primary" />
                    System Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-safety rounded-full"></div>
                      <div className="text-sm">
                        New tourist registration batch processed
                      </div>
                      <div className="text-xs text-muted-foreground ml-auto">
                        2 min ago
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      <div className="text-sm">Geo-fence boundary updated</div>
                      <div className="text-xs text-muted-foreground ml-auto">
                        15 min ago
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div className="text-sm">
                        AI model retrained with new data
                      </div>
                      <div className="text-xs text-muted-foreground ml-auto">
                        1 hour ago
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-danger rounded-full"></div>
                      <div className="text-sm">
                        Emergency alert protocol tested
                      </div>
                      <div className="text-xs text-muted-foreground ml-auto">
                        2 hours ago
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Database className="h-6 w-6 mb-2" />
                    Backup System
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Shield className="h-6 w-6 mb-2" />
                    Security Scan
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Globe className="h-6 w-6 mb-2" />
                    System Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage tourist registrations and authority access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Digital ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTourists.slice(0, 10).map((tourist) => (
                      <TableRow key={tourist.id}>
                        <TableCell className="font-medium">
                          {tourist.touristName}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {tourist.id.slice(0, 16)}...
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20"
                          >
                            Tourist
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              tourist.status === "active"
                                ? "bg-safety/10 text-safety border-safety/20"
                                : "bg-warning/10 text-warning border-warning/20"
                            }
                          >
                            {tourist.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {tourist.issuedAt.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                            <Button size="sm" variant="outline">
                              Suspend
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geofences">
            <div className="flex justify-end mb-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Zones
              </Button>
            </div>
            <GeoFenceEditor
              geoFences={geoFences}
              onGeoFenceCreate={handleGeoFenceCreate}
              onGeoFenceUpdate={handleGeoFenceUpdate}
              onGeoFenceDelete={handleGeoFenceDelete}
              center={[77.209, 28.6139]}
              zoom={10}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                  System Analytics
                </CardTitle>
                <CardDescription>
                  Performance metrics and usage statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center mb-6">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Analytics Dashboard
                    </h3>
                    <p className="text-muted-foreground">
                      Real-time charts and graphs would be displayed here
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-primary">1,247</div>
                    <div className="text-sm text-muted-foreground">
                      Total Interactions
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-safety">98.2%</div>
                    <div className="text-sm text-muted-foreground">
                      Success Rate
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-warning">2.3s</div>
                    <div className="text-sm text-muted-foreground">
                      Avg Response
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-primary" />
                  System Configuration
                </CardTitle>
                <CardDescription>
                  Configure system features and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">AI Anomaly Detection</h4>
                      <p className="text-sm text-muted-foreground">
                        Enable intelligent threat detection and behavior
                        analysis
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.aiAnomalyDetection}
                      onCheckedChange={(checked) =>
                        handleSettingChange("aiAnomalyDetection", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Geo-fence Alerts</h4>
                      <p className="text-sm text-muted-foreground">
                        Send automatic notifications when tourists enter
                        restricted zones
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.geoFenceAlerts}
                      onCheckedChange={(checked) =>
                        handleSettingChange("geoFenceAlerts", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto E-FIR Generation</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically generate electronic FIRs for emergency
                        incidents
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.autoEFIR}
                      onCheckedChange={(checked) =>
                        handleSettingChange("autoEFIR", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Multilingual Support</h4>
                      <p className="text-sm text-muted-foreground">
                        Enable support for multiple Indian languages
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.multilingualSupport}
                      onCheckedChange={(checked) =>
                        handleSettingChange("multilingualSupport", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Offline Mode</h4>
                      <p className="text-sm text-muted-foreground">
                        Enable offline functionality for poor connectivity areas
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.offlineMode}
                      onCheckedChange={(checked) =>
                        handleSettingChange("offlineMode", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Emergency Broadcast</h4>
                      <p className="text-sm text-muted-foreground">
                        Send emergency alerts to all tourists in affected areas
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.emergencyBroadcast}
                      onCheckedChange={(checked) =>
                        handleSettingChange("emergencyBroadcast", checked)
                      }
                    />
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <Button className="gradient-primary text-white">
                    Save Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="police">
            <PoliceDashboard />
          </TabsContent>

          <TabsContent value="tourism">
            <TourismDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
