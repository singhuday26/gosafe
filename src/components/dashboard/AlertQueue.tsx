import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, AlertTriangle, User, Phone } from "lucide-react";

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
  alerts: Alert[];
  onAssign?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  onViewDetails?: (alert: Alert) => void;
  className?: string;
}

export const AlertQueue: React.FC<AlertQueueProps> = ({
  alerts,
  onAssign,
  onResolve,
  onViewDetails,
  className = "",
}) => {
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
                {alert.status === "active" && onAssign && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAssign(alert.id)}
                  >
                    Assign
                  </Button>
                )}
                {alert.status !== "resolved" && onResolve && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onResolve(alert.id)}
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
