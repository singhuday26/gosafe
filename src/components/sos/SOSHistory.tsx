import React from "react";
import {
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SOSHistoryItem {
  id: string;
  timestamp: Date;
  type: "panic" | "medical" | "security" | "general";
  status: "active" | "responded" | "resolved" | "cancelled";
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  responseTime?: number; // in minutes
  notes?: string;
}

interface SOSHistoryProps {
  history: SOSHistoryItem[];
  onViewDetails?: (item: SOSHistoryItem) => void;
  className?: string;
}

export const SOSHistory: React.FC<SOSHistoryProps> = ({
  history,
  onViewDetails,
  className = "",
}) => {
  const getStatusIcon = (status: SOSHistoryItem["status"]) => {
    switch (status) {
      case "active":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "responded":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: SOSHistoryItem["status"]) => {
    switch (status) {
      case "active":
        return "destructive";
      case "responded":
        return "secondary";
      case "resolved":
        return "default";
      case "cancelled":
        return "outline";
    }
  };

  const getTypeEmoji = (type: SOSHistoryItem["type"]) => {
    switch (type) {
      case "panic":
        return "🚨";
      case "medical":
        return "🏥";
      case "security":
        return "🛡️";
      case "general":
        return "⚠️";
    }
  };

  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Emergency History</h3>
          <p className="text-muted-foreground">
            Your emergency alerts will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {history.map((item) => (
        <Card key={item.id} className="transition-all hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <span className="mr-2">{getTypeEmoji(item.type)}</span>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}{" "}
                Emergency
              </CardTitle>
              <Badge variant={getStatusColor(item.status)}>
                {getStatusIcon(item.status)}
                <span className="ml-1 capitalize">{item.status}</span>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Timestamp */}
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              {item.timestamp.toLocaleString()}
            </div>

            {/* Location */}
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-2 h-4 w-4" />
              {item.location.address ||
                `${item.location.latitude.toFixed(
                  4
                )}, ${item.location.longitude.toFixed(4)}`}
            </div>

            {/* Response Time */}
            {item.responseTime && (
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4 text-blue-500" />
                <span>Response time: {item.responseTime} minutes</span>
              </div>
            )}

            {/* Notes */}
            {item.notes && (
              <div className="bg-muted/50 p-2 rounded text-sm">
                <strong>Notes:</strong> {item.notes}
              </div>
            )}

            {/* Actions */}
            {onViewDetails && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(item)}
                >
                  View Details
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
