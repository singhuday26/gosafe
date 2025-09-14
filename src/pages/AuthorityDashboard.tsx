import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Shield, Users, AlertTriangle, MapPin, Clock, FileText, 
  Search, Filter, RefreshCw, Phone, Eye, CheckCircle, XCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BlockchainService } from "@/lib/blockchain";

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authorityAuth, setAuthorityAuth] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('authorityAuth');
    if (!auth) {
      navigate('/authority/login');
      return;
    }
    setAuthorityAuth(JSON.parse(auth));
  }, [navigate]);

  const blockchain = BlockchainService.getInstance();
  const allTourists = blockchain.getAllDigitalIDs();
  const allAlerts = blockchain.getAllSOSAlerts();

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Dashboard data has been updated with latest information.",
    });
  };

  const handleResolveAlert = (alertId: string) => {
    blockchain.updateSOSStatus(alertId, 'resolved');
    toast({
      title: "Alert Resolved",
      description: "SOS alert has been marked as resolved.",
    });
  };

  const handleGenerateEFIR = (tourist: any, alert: any) => {
    toast({
      title: "E-FIR Generated",
      description: `Electronic FIR created for tourist ${tourist.touristName}`,
    });
  };

  const stats = [
    { 
      title: "Active Tourists", 
      value: allTourists.filter(t => t.status === 'active').length, 
      icon: Users,
      color: "text-primary"
    },
    { 
      title: "Active Alerts", 
      value: allAlerts.filter(a => a.status === 'active').length, 
      icon: AlertTriangle,
      color: "text-danger"
    },
    { 
      title: "Resolved Today", 
      value: allAlerts.filter(a => a.status === 'resolved').length, 
      icon: CheckCircle,
      color: "text-safety"
    },
    { 
      title: "Response Time", 
      value: "2.3 min", 
      icon: Clock,
      color: "text-warning"
    }
  ];

  if (!authorityAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Verifying authority credentials...</p>
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
                <h1 className="text-xl font-bold">Authority Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  {authorityAuth.department} • {authorityAuth.station || 'Central Command'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-safety/10 text-safety border-safety/20">
                <CheckCircle className="mr-1 h-3 w-3" />
                Online
              </Badge>
              <Button
                variant="ghost"
                onClick={() => {
                  localStorage.removeItem('authorityAuth');
                  navigate('/authority/login');
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="gradient-card shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tourists">Tourists</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tourists, alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Live Alerts */}
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center text-danger">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Live SOS Alerts
                </CardTitle>
                <CardDescription>Real-time emergency alerts requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                {allAlerts.filter(alert => alert.status === 'active').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-safety" />
                    <p>No active alerts. All tourists are safe.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allAlerts.filter(alert => alert.status === 'active').map((alert) => {
                      const tourist = allTourists.find(t => t.id === alert.touristId);
                      return (
                        <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg bg-danger/5 border-danger/20">
                          <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-danger rounded-full animate-pulse"></div>
                            <div>
                              <p className="font-semibold">{tourist?.touristName || 'Unknown Tourist'}</p>
                              <p className="text-sm text-muted-foreground">
                                {alert.location.address} • {alert.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <MapPin className="h-4 w-4 mr-1" />
                              Locate
                            </Button>
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4 mr-1" />
                              Contact
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-safety hover:bg-safety/90 text-white"
                              onClick={() => handleResolveAlert(alert.id)}
                            >
                              Resolve
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="gradient-card shadow-soft">
                <CardHeader>
                  <CardTitle>Recent Tourist Registrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allTourists.slice(0, 5).map((tourist) => (
                      <div key={tourist.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{tourist.touristName}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {tourist.id.slice(0, 16)}...
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-safety/10 text-safety border-safety/20">
                          {tourist.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card shadow-soft">
                <CardHeader>
                  <CardTitle>System Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Response Rate</span>
                      <span className="font-semibold text-safety">98.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg. Response Time</span>
                      <span className="font-semibold">2.3 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tourist Satisfaction</span>
                      <span className="font-semibold text-safety">4.8/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">System Uptime</span>
                      <span className="font-semibold text-safety">99.9%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tourists">
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Tourist Database
                </CardTitle>
                <CardDescription>
                  Complete list of registered tourists with Digital IDs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tourist Name</TableHead>
                      <TableHead>Digital ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTourists
                      .filter(tourist => 
                        searchQuery === '' || 
                        tourist.touristName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        tourist.id.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((tourist) => (
                      <TableRow key={tourist.id}>
                        <TableCell className="font-medium">{tourist.touristName}</TableCell>
                        <TableCell className="font-mono text-sm">{tourist.id.slice(0, 16)}...</TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={
                              tourist.status === 'active' 
                                ? 'bg-safety/10 text-safety border-safety/20'
                                : 'bg-warning/10 text-warning border-warning/20'
                            }
                          >
                            {tourist.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{tourist.validTo.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <MapPin className="h-4 w-4 mr-1" />
                              Track
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

          <TabsContent value="alerts">
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-danger" />
                  Alert Management
                </CardTitle>
                <CardDescription>
                  Manage and respond to tourist emergency alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alert ID</TableHead>
                      <TableHead>Tourist</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allAlerts.map((alert) => {
                      const tourist = allTourists.find(t => t.id === alert.touristId);
                      return (
                        <TableRow key={alert.id}>
                          <TableCell className="font-mono text-sm">{alert.id.slice(0, 12)}...</TableCell>
                          <TableCell>{tourist?.touristName || 'Unknown'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-danger/10 text-danger border-danger/20">
                              {alert.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{alert.location.address}</TableCell>
                          <TableCell className="text-sm">{alert.timestamp.toLocaleTimeString()}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary"
                              className={
                                alert.status === 'active' 
                                  ? 'bg-danger/10 text-danger border-danger/20'
                                  : alert.status === 'responded'
                                  ? 'bg-warning/10 text-warning border-warning/20'
                                  : 'bg-safety/10 text-safety border-safety/20'
                              }
                            >
                              {alert.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleGenerateEFIR(tourist, alert)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                E-FIR
                              </Button>
                              {alert.status === 'active' && (
                                <Button 
                                  size="sm" 
                                  className="bg-safety hover:bg-safety/90 text-white"
                                  onClick={() => handleResolveAlert(alert.id)}
                                >
                                  Resolve
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-primary" />
                  Real-time Map View
                </CardTitle>
                <CardDescription>
                  Live tourist locations and geo-fence monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                    <p className="text-muted-foreground mb-4">
                      Real-time tourist tracking with geo-fence boundaries
                    </p>
                    <Badge variant="outline">
                      Map integration would be implemented with Mapbox/Google Maps
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthorityDashboard;