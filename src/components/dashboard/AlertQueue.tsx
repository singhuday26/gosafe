import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, AlertTriangle, User, Phone } from "lucide-react";
import {
  touristService,
  type ExtendedSOSAlert,
} from "@/services/touristService";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  type: "sos" | "geofence" | "security" | "medical";
  priority: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  touristId?: string;
  touristName?: string;
  message: string;
  status: "active" | "assigned" | "resolved";
}

interface AlertQueueProps {
  alerts?: Alert[];
  onAssign?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  onViewDetails?: (alert: Alert) => void;
  className?: string;
  useRealData?: boolean;
}

export const AlertQueue: React.FC<AlertQueueProps> = ({
  alerts: propAlerts,
  onAssign,
  onResolve,
  onViewDetails,
  className = "",
  useRealData = true,
}) => {
  const [realAlerts, setRealAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Convert Supabase SOS alert to Alert format
  const convertSOSAlert = (sosAlert: ExtendedSOSAlert): Alert => ({
    id: sosAlert.id,
    type:
      sosAlert.alert_type === "panic"
        ? "sos"
        : (sosAlert.alert_type as Alert["type"]),
    priority:
      sosAlert.alert_type === "panic"
        ? "critical"
        : sosAlert.alert_type === "medical"
        ? "high"
        : "medium",
    timestamp: new Date(sosAlert.timestamp),
    location: {
      latitude: sosAlert.latitude,
      longitude: sosAlert.longitude,
      address: sosAlert.address || undefined,
    },
    touristId: sosAlert.tourist_id,
    touristName:
      sosAlert.digital_tourist_ids?.tourist_name || "Unknown Tourist",
    message: sosAlert.message || `${sosAlert.alert_type} alert triggered`,
    status: sosAlert.status as Alert["status"],
  });

  // Fetch real alerts from Supabase
  const fetchAlerts = React.useCallback(async () => {
    setLoading(true);
    try {
      const sosAlerts = await touristService.getActiveSOSAlerts();
      const convertedAlerts = sosAlerts.map(convertSOSAlert);
      setRealAlerts(convertedAlerts);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
      toast({
        title: "Error",
        description: "Failed to load alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Set up real-time subscription
  useEffect(() => {
    if (!useRealData) return;

    fetchAlerts();

    const subscription = touristService.subscribeToSOSAlerts((newAlert) => {
      const convertedAlert = convertSOSAlert(newAlert as ExtendedSOSAlert);
      setRealAlerts((prev) => [convertedAlert, ...prev]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [useRealData, fetchAlerts]);

  // Handle alert actions with real Supabase updates
  const handleAssign = async (alertId: string) => {
    try {
      await touristService.updateSOSAlertStatus(alertId, "responded");
      setRealAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId
            ? { ...alert, status: "assigned" as const }
            : alert
        )
      );
      toast({
        title: "Alert Assigned",
        description: "Alert has been assigned to response team",
      });
      onAssign?.(alertId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign alert",
        variant: "destructive",
      });
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await touristService.updateSOSAlertStatus(alertId, "resolved");
      setRealAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      toast({
        title: "Alert Resolved",
        description: "Alert has been marked as resolved",
      });
      onResolve?.(alertId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  };

  const alerts = useRealData ? realAlerts : propAlerts || [];

  const getPriorityColor = (priority: Alert["priority"]) => {
    switch (priority) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
    }
  };

  const getTypeIcon = (type: Alert["type"]) => {
    switch (type) {
      case "sos":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medical":
        return <Phone className="h-4 w-4 text-blue-500" />;
      case "security":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "geofence":
        return <MapPin className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: Alert["status"]) => {
    switch (status) {
      case "active":
        return "destructive";
      case "assigned":
        return "secondary";
      case "resolved":
        return "default";
    }
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Alert Queue</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading alerts...</p>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Alert Queue</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No active alerts</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Alert Queue</span>
          <Badge variant="secondary">{alerts.length} active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedAlerts.map((alert) => (
            <div
              key={alert.id}
              className="border rounded-lg p-3 space-y-2 hover:bg-muted/50 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(alert.type)}
                  <span className="font-medium capitalize">{alert.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={getPriorityColor(alert.priority)}
                    className="text-xs"
                  >
                    {alert.priority}
                  </Badge>
                  <Badge
                    variant={getStatusColor(alert.status)}
                    className="text-xs"
                  >
                    {alert.status}
                  </Badge>
                </div>
              </div>

              {/* Message */}
              <p className="text-sm text-muted-foreground">{alert.message}</p>

              {/* Details */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {alert.timestamp.toLocaleTimeString()}
                </div>
                {alert.touristName && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {alert.touristName}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {alert.location.address ||
                    `${alert.location.latitude.toFixed(
                      2
                    )}, ${alert.location.longitude.toFixed(2)}`}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {alert.status === "active" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAssign(alert.id)}
                  >
                    Assign
                  </Button>
                )}
                {alert.status !== "resolved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolve(alert.id)}
                  >
                    Resolve
                  </Button>
                )}
                {onViewDetails && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewDetails(alert)}
                  >
                    Details
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
