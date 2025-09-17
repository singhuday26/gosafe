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
import {
  AlertTriangle,
  MapPin,
  Clock,
  Battery,
  Wifi,
  Shield,
  Navigation,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/integrations/supabase/types";

type SOSAlert = Database["public"]["Tables"]["sos_alerts"]["Row"];

interface AnomalyAlert {
  id: string;
  tourist_id: string;
  anomalyType: string;
  severityLevel: "low" | "medium" | "high" | "critical";
  severityScore: number;
  location: { lat: number; lng: number };
  timestamp: string;
  details: Record<string, unknown>;
  recommendations: string[];
}

export const AnomalyDashboard: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyAlert | null>(
    null
  );

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const { data: alerts } = await supabase
          .from("sos_alerts")
          .select("*")
          .like("alert_type", "anomaly_%")
          .order("created_at", { ascending: false })
          .limit(50);

        if (alerts) {
          const parsedAnomalies = alerts.map(parseAnomalyFromAlert);
          setAnomalies(parsedAnomalies);
        }
      } catch (error) {
        console.error("Error fetching anomalies:", error);
      } finally {
        setLoading(false);
      }
    };

    const parseAnomalyFromAlert = (alert: SOSAlert): AnomalyAlert => {
      const anomalyType =
        alert.alert_type?.replace("anomaly_", "") || "unknown";
      // For now, we'll use a simple severity mapping based on anomaly type
      // In a real implementation, this would come from the stored anomaly data
      const severityMapping: Record<
        string,
        "low" | "medium" | "high" | "critical"
      > = {
        sudden_drop_off: "high",
        prolonged_inactivity: "medium",
        route_deviation: "medium",
        silent_distress: "critical",
        risk_zone_entry: "high",
      };

      return {
        id: alert.id,
        tourist_id: alert.tourist_id || "",
        anomalyType,
        severityLevel: severityMapping[anomalyType] || "low",
        severityScore: 50, // Default score, would be calculated from stored data
        location: { lat: alert.latitude || 0, lng: alert.longitude || 0 },
        timestamp: alert.created_at || new Date().toISOString(),
        details: {},
        recommendations: getRecommendationsForAnomaly(anomalyType),
      };
    };

    fetchAnomalies();

    // Set up real-time subscription for new anomalies
    const subscription = supabase
      .channel("anomaly_alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sos_alerts",
          filter: "alert_type=like.anomaly_%",
        },
        (payload) => {
          const newAlert = payload.new as SOSAlert;
          if (newAlert.alert_type?.startsWith("anomaly_")) {
            const anomaly = parseAnomalyFromAlert(newAlert);
            setAnomalies((prev) => [anomaly, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchAnomalies = async () => {
    try {
      const { data: alerts } = await supabase
        .from("sos_alerts")
        .select("*")
        .like("alert_type", "anomaly_%")
        .order("created_at", { ascending: false })
        .limit(50);

      if (alerts) {
        const parsedAnomalies = alerts.map(parseAnomalyFromAlert);
        setAnomalies(parsedAnomalies);
      }
    } catch (error) {
      console.error("Error fetching anomalies:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseAnomalyFromAlert = (alert: SOSAlert): AnomalyAlert => {
    const anomalyType = alert.alert_type?.replace("anomaly_", "") || "unknown";
    // For now, we'll use a simple severity mapping based on anomaly type
    // In a real implementation, this would come from the stored anomaly data
    const severityMapping: Record<
      string,
      "low" | "medium" | "high" | "critical"
    > = {
      sudden_drop_off: "high",
      prolonged_inactivity: "medium",
      route_deviation: "medium",
      silent_distress: "critical",
      risk_zone_entry: "high",
    };

    return {
      id: alert.id,
      tourist_id: alert.tourist_id || "",
      anomalyType,
      severityLevel: severityMapping[anomalyType] || "low",
      severityScore: 50, // Default score, would be calculated from stored data
      location: { lat: alert.latitude || 0, lng: alert.longitude || 0 },
      timestamp: alert.created_at || new Date().toISOString(),
      details: {},
      recommendations: getRecommendationsForAnomaly(anomalyType),
    };
  };

  const getRecommendationsForAnomaly = (anomalyType: string): string[] => {
    const recommendations: Record<string, string[]> = {
      sudden_drop_off: [
        "Verify tourist safety and location accuracy",
        "Contact tourist if possible",
        "Check for transportation mode changes",
        "Monitor for additional anomalies",
      ],
      prolonged_inactivity: [
        "Attempt to contact tourist",
        "Check emergency contacts",
        "Monitor battery level and network connectivity",
        "Consider sending wellness check",
      ],
      route_deviation: [
        "Verify if route change was intentional",
        "Check for transportation issues",
        "Update route if necessary",
        "Monitor for safety concerns in new area",
      ],
      silent_distress: [
        "Immediate contact attempt required",
        "Consider emergency response activation",
        "Monitor vital signs if wearable data available",
        "Alert emergency contacts immediately",
      ],
      risk_zone_entry: [
        "Monitor tourist closely in risk zone",
        "Ensure emergency contacts are updated",
        "Consider providing additional safety guidance",
        "Track exit from risk zone",
      ],
    };

    return recommendations[anomalyType] || ["Monitor situation closely"];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getAnomalyIcon = (anomalyType: string) => {
    switch (anomalyType) {
      case "sudden_drop_off":
        return <Navigation className="h-4 w-4" />;
      case "prolonged_inactivity":
        return <Clock className="h-4 w-4" />;
      case "route_deviation":
        return <MapPin className="h-4 w-4" />;
      case "silent_distress":
        return <AlertTriangle className="h-4 w-4" />;
      case "risk_zone_entry":
        return <Shield className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleResolveAnomaly = async (anomalyId: string) => {
    try {
      await supabase
        .from("sos_alerts")
        .update({ status: "resolved" })
        .eq("id", anomalyId);

      setAnomalies((prev) => prev.filter((a) => a.id !== anomalyId));
      setSelectedAnomaly(null);
    } catch (error) {
      console.error("Error resolving anomaly:", error);
    }
  };

  const handleContactTourist = async (touristId: string) => {
    // This would integrate with your notification system
    console.log("Contacting tourist:", touristId);
    // TODO: Implement contact functionality
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading anomaly alerts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Anomaly Detection Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of tourist safety anomalies
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Active Monitoring</span>
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Anomalies
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{anomalies.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {anomalies.filter((a) => a.severityLevel === "critical").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {anomalies.filter((a) => a.severityLevel === "high").length}
            </div>
            <p className="text-xs text-muted-foreground">
              High priority monitoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {anomalies.filter((a) => a.severityLevel !== "low").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Under active monitoring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Anomalies List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Anomalies</CardTitle>
          <CardDescription>
            Latest anomaly detections requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {anomalies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No anomalies detected. All tourists appear to be safe.
              </div>
            ) : (
              anomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedAnomaly(anomaly)}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-full ${getSeverityColor(
                        anomaly.severityLevel
                      )}`}
                    >
                      {getAnomalyIcon(anomaly.anomalyType)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium capitalize">
                          {anomaly.anomalyType.replace("_", " ")}
                        </h4>
                        <Badge
                          variant="outline"
                          className={getSeverityColor(anomaly.severityLevel)}
                        >
                          {anomaly.severityLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tourist ID: {anomaly.tourist_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(anomaly.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContactTourist(anomaly.tourist_id);
                      }}
                    >
                      Contact
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResolveAnomaly(anomaly.id);
                      }}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Details Modal */}
      {selectedAnomaly && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getAnomalyIcon(selectedAnomaly.anomalyType)}
              <span className="capitalize">
                {selectedAnomaly.anomalyType.replace("_", " ")} Details
              </span>
              <Badge
                variant="outline"
                className={getSeverityColor(selectedAnomaly.severityLevel)}
              >
                {selectedAnomaly.severityLevel}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Location</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedAnomaly.location.lat.toFixed(6)},{" "}
                  {selectedAnomaly.location.lng.toFixed(6)}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Timestamp</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedAnomaly.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="list-disc list-inside space-y-1">
                {selectedAnomaly.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setSelectedAnomaly(null)}
              >
                Close
              </Button>
              <Button onClick={() => handleResolveAnomaly(selectedAnomaly.id)}>
                Mark as Resolved
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
