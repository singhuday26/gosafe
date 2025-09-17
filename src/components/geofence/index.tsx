// GeoFence Components
export { GeoFenceEditor } from "./GeoFenceEditor";

// GeoFence List Component
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2, MapPin } from "lucide-react";
import { GeoFence } from "@/components/map/types";

interface GeoFenceListProps {
  geoFences: GeoFence[];
  onEdit?: (fence: GeoFence) => void;
  onDelete?: (id: string) => void;
  onViewOnMap?: (fence: GeoFence) => void;
  className?: string;
}

const GeoFenceList: React.FC<GeoFenceListProps> = ({
  geoFences,
  onEdit,
  onDelete,
  onViewOnMap,
  className = "",
}) => {
  if (geoFences.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No GeoFences</h3>
          <p className="text-muted-foreground">
            Create your first geofence to start monitoring areas
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>GeoFences ({geoFences.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {geoFences.map((fence) => (
          <div
            key={fence.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  fence.type === "safe"
                    ? "bg-green-500"
                    : fence.type === "restricted"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
              <div>
                <div className="font-medium">{fence.name}</div>
                {fence.description && (
                  <div className="text-sm text-muted-foreground">
                    {fence.description}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {fence.coordinates.length} coordinates
                </div>
              </div>
              <Badge variant="outline" className="capitalize">
                {fence.type}
              </Badge>
            </div>
            <div className="flex gap-2">
              {onViewOnMap && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewOnMap(fence)}
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              )}
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(fence)}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(fence.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export { GeoFenceList };