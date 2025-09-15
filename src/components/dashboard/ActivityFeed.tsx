import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ActivityItem {
  id: string;
  timestamp: Date;
  type: "login" | "logout" | "sos" | "location" | "geofence" | "alert";
  message: string;
  status?: "success" | "warning" | "error" | "info";
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  showTimestamps?: boolean;
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  maxItems = 10,
  showTimestamps = true,
  className = "",
}) => {
  const getStatusColor = (status?: ActivityItem["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      case "info":
      default:
        return "bg-blue-500";
    }
  };

  const getTypeIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "login":
        return "🔐";
      case "logout":
        return "🚪";
      case "sos":
        return "🚨";
      case "location":
        return "📍";
      case "geofence":
        return "🛡️";
      case "alert":
        return "⚠️";
    }
  };

  const displayedActivities = activities.slice(0, maxItems);

  if (activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-muted-foreground">No recent activity</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {displayedActivities.map((activity, index) => (
            <div key={activity.id} className="flex items-start gap-3">
              {/* Status Indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                  w-3 h-3 rounded-full 
                  ${getStatusColor(activity.status)}
                `}
                />
                {index < displayedActivities.length - 1 && (
                  <div className="w-px h-6 bg-muted mt-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{getTypeIcon(activity.type)}</span>
                  <p className="text-sm">{activity.message}</p>
                </div>
                {showTimestamps && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.timestamp.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {activities.length > maxItems && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Showing {maxItems} of {activities.length} activities
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
