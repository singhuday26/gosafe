// Dashboard Components
export { StatCard } from "./StatCard";
export { AlertQueue } from "./AlertQueue";
export { ActivityFeed } from "./ActivityFeed";

// Dashboard Types
export interface DashboardStats {
  totalTourists: number;
  activeTourists: number;
  sosAlerts: number;
  safeZones: number;
}

export interface DashboardAlert {
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

export interface ActivityItem {
  id: string;
  timestamp: Date;
  type: "login" | "logout" | "sos" | "location" | "geofence" | "alert";
  message: string;
  status?: "success" | "warning" | "error" | "info";
}
