import React, { useEffect, useRef, useState, useCallback } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import type MapboxDraw from "@mapbox/mapbox-gl-draw";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit3, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define types for Mapbox Draw events
interface DrawEvent {
  features: GeoJSON.Feature<GeoJSON.Polygon>[];
}

// Lazy load Mapbox GL and Draw
const loadMapboxAndDraw = () =>
  Promise.all([
    import("mapbox-gl"),
    import("@mapbox/mapbox-gl-draw"),
    import("mapbox-gl/dist/mapbox-gl.css"),
    import("@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"),
  ]).then(([mapboxgl, MapboxDraw]) => ({
    mapboxgl: mapboxgl.default,
    MapboxDraw: MapboxDraw.default,
  }));

interface GeoFence {
  id: string;
  name: string;
  type: "safe" | "restricted" | "danger";
  coordinates: Array<{ lat: number; lng: number }>;
  description: string;
}

interface GeoFenceEditorProps {
  geoFences: GeoFence[];
  onGeoFenceCreate?: (geoFence: Omit<GeoFence, "id">) => void;
  onGeoFenceUpdate?: (id: string, geoFence: Partial<GeoFence>) => void;
  onGeoFenceDelete?: (id: string) => void;
  center?: [number, number];
  zoom?: number;
}

const GeoFenceEditor: React.FC<GeoFenceEditorProps> = ({
  geoFences,
  onGeoFenceCreate,
  onGeoFenceUpdate,
  onGeoFenceDelete,
  center = [77.209, 28.6139], // Delhi coordinates
  zoom = 10,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [hasMapboxToken, setHasMapboxToken] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingFence, setEditingFence] = useState<string | null>(null);

  // Form state for new/edited geofences
  const [formData, setFormData] = useState({
    name: "",
    type: "safe" as GeoFence["type"],
    description: "",
  });

  const [drawnFeature, setDrawnFeature] =
    useState<GeoJSON.Feature<GeoJSON.Polygon> | null>(null);

  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    setHasMapboxToken(!!mapboxToken);
  }, [mapboxToken]);

  const clearForm = () => {
    setFormData({ name: "", type: "safe", description: "" });
    setDrawnFeature(null);
    setIsCreating(false);
    setEditingFence(null);
    if (draw.current) {
      draw.current.deleteAll();
    }
  };

  const initializeMap = useCallback(async () => {
    if (!mapContainer.current || !mapboxToken) return;

    setIsLoading(true);

    try {
      const { mapboxgl, MapboxDraw } = await loadMapboxAndDraw();
      mapboxgl.accessToken = mapboxToken;

      if (map.current) {
        map.current.remove();
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center,
        zoom,
      });

      // Initialize drawing controls
      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        defaultMode: "draw_polygon",
      });

      map.current.addControl(draw.current, "top-left");

      map.current.on("load", () => {
        // Add existing geofences to map
        renderGeoFences();
        setIsLoading(false);
      });

      // Handle drawing events
      map.current.on("draw.create", (e: DrawEvent) => {
        if (e.features && e.features.length > 0) {
          setDrawnFeature(e.features[0]);
        }
      });

      map.current.on("draw.update", (e: DrawEvent) => {
        if (e.features && e.features.length > 0) {
          setDrawnFeature(e.features[0]);
        }
      });

      map.current.on("draw.delete", () => {
        setDrawnFeature(null);
      });
    } catch (error) {
      console.error("Failed to initialize map:", error);
      setIsLoading(false);
    }
  }, [mapboxToken, center, zoom]); // renderGeoFences will be called after map load

  const renderGeoFences = useCallback(() => {
    if (!map.current) return;

    // Remove existing geofence layers
    geoFences.forEach((_, index) => {
      const layerId = `geofence-layer-${index}`;
      const outlineLayerId = `${layerId}-outline`;

      if (map.current!.getLayer(layerId)) {
        map.current!.removeLayer(layerId);
      }
      if (map.current!.getLayer(outlineLayerId)) {
        map.current!.removeLayer(outlineLayerId);
      }
      if (map.current!.getSource(`geofence-${index}`)) {
        map.current!.removeSource(`geofence-${index}`);
      }
    });

    // Add geofences to map
    geoFences.forEach((fence, index) => {
      const sourceId = `geofence-${index}`;
      const layerId = `geofence-layer-${index}`;

      const coordinates = fence.coordinates.map((coord) => [
        coord.lng,
        coord.lat,
      ]);
      coordinates.push(coordinates[0]); // Close polygon

      map.current!.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [coordinates],
          },
          properties: {
            name: fence.name,
            type: fence.type,
          },
        },
      });

      const fillColor =
        fence.type === "safe"
          ? "#10B981"
          : fence.type === "restricted"
          ? "#F59E0B"
          : "#EF4444";

      map.current!.addLayer({
        id: layerId,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": fillColor,
          "fill-opacity": 0.2,
        },
      });

      map.current!.addLayer({
        id: `${layerId}-outline`,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": fillColor,
          "line-width": 2,
        },
      });
    });
  }, [geoFences]);

  useEffect(() => {
    if (hasMapboxToken) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [hasMapboxToken, initializeMap]);

  useEffect(() => {
    if (map.current && !isLoading) {
      renderGeoFences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoFences, isLoading]); // renderGeoFences depends on geoFences

  const handleSaveGeoFence = () => {
    if (!drawnFeature || !formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please draw a polygon and provide a name.",
        variant: "destructive",
      });
      return;
    }

    const coordinates = (
      drawnFeature.geometry as GeoJSON.Polygon
    ).coordinates[0].map((coord: number[]) => ({
      lat: coord[1],
      lng: coord[0],
    }));

    const newGeoFence: Omit<GeoFence, "id"> = {
      name: formData.name.trim(),
      type: formData.type,
      description: formData.description.trim(),
      coordinates,
    };

    if (editingFence) {
      onGeoFenceUpdate?.(editingFence, newGeoFence);
      toast({
        title: "Success",
        description: "Geofence updated successfully.",
      });
    } else {
      onGeoFenceCreate?.(newGeoFence);
      toast({
        title: "Success",
        description: "Geofence created successfully.",
      });
    }

    clearForm();
  };

  const handleEditGeoFence = (fence: GeoFence) => {
    setEditingFence(fence.id);
    setFormData({
      name: fence.name,
      type: fence.type,
      description: fence.description,
    });
    setIsCreating(true);

    // Add fence to drawing mode for editing
    if (draw.current) {
      draw.current.deleteAll();
      const coordinates = fence.coordinates.map((coord) => [
        coord.lng,
        coord.lat,
      ]);
      coordinates.push(coordinates[0]);

      const feature: GeoJSON.Feature<GeoJSON.Polygon> = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [coordinates],
        },
        properties: {},
      };

      draw.current.add(feature);
      setDrawnFeature(feature);
    }
  };

  const handleDeleteGeoFence = (id: string) => {
    onGeoFenceDelete?.(id);
    toast({
      title: "Success",
      description: "Geofence deleted successfully.",
    });
  };

  if (!hasMapboxToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>GeoFence Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Please add your Mapbox access token to the environment variables
              (VITE_MAPBOX_ACCESS_TOKEN) to use the map editor.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Map Container */}
      <Card>
        <CardHeader>
          <CardTitle>GeoFence Map Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div
              ref={mapContainer}
              className="h-96 w-full rounded-lg border min-h-96"
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">
                    Loading map...
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {editingFence ? "Edit GeoFence" : "Create New GeoFence"}
            </CardTitle>
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)}>
                <Edit3 className="mr-2 h-4 w-4" />
                New GeoFence
              </Button>
            )}
          </div>
        </CardHeader>

        {isCreating && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter geofence name"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: GeoFence["type"]) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="safe">Safe Zone</SelectItem>
                    <SelectItem value="restricted">Restricted Zone</SelectItem>
                    <SelectItem value="danger">Danger Zone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter description"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveGeoFence}
                disabled={!drawnFeature || !formData.name.trim()}
              >
                <Save className="mr-2 h-4 w-4" />
                {editingFence ? "Update" : "Save"} GeoFence
              </Button>
              <Button variant="outline" onClick={clearForm}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* GeoFence List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing GeoFences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {geoFences.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No geofences created yet.
              </p>
            ) : (
              geoFences.map((fence) => (
                <div
                  key={fence.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
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
                      <div className="text-sm text-muted-foreground">
                        {fence.description}
                      </div>
                    </div>
                    <Badge variant="outline">{fence.type}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditGeoFence(fence)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteGeoFence(fence.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeoFenceEditor;
