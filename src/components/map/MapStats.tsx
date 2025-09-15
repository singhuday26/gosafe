import React from "react";
import { Users, AlertTriangle, Shield } from "lucide-react";
import { Tourist, SOSAlert, GeoFence } from "./types";

interface MapStatsProps {
  tourists: Tourist[];
  sosAlerts: SOSAlert[];
  geoFences: GeoFence[];
  className?: string;
}

export const MapStats: React.FC<MapStatsProps> = ({
  tourists,
  sosAlerts,
  geoFences,
  className = "",
}) => {
  const activeTourists = tourists.filter((t) => t.status === "active").length;
  const sosCount = sosAlerts.filter((a) => a.status !== "resolved").length;
  const safeZones = geoFences.filter((f) => f.type === "safe").length;

  return (
    <div
      className={`absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg ${className}`}
    >
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <Users className="h-4 w-4 mx-auto mb-1 text-blue-500" />
          <div className="text-lg font-bold">{activeTourists}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </div>
        <div>
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-red-500" />
          <div className="text-lg font-bold">{sosCount}</div>
          <div className="text-xs text-muted-foreground">Alerts</div>
        </div>
        <div>
          <Shield className="h-4 w-4 mx-auto mb-1 text-green-500" />
          <div className="text-lg font-bold">{safeZones}</div>
          <div className="text-xs text-muted-foreground">Safe Zones</div>
        </div>
      </div>
    </div>
  );
};
