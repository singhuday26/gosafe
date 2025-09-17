import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Save,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  Shield,
  Users,
  Edit3,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// Initialize Mapbox token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

interface GeoFence {
  id: string;
  name: string;
  description?: string;
  coordinates: unknown;
  type: "restricted" | "danger" | "tourist_zone";
  active: boolean;
  created_at?: string;
}

const GeoFenceEditor: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [existingFences, setExistingFences] = useState<GeoFence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFence, setSelectedFence] = useState<GeoFence | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "tourist_zone" as "restricted" | "danger" | "tourist_zone",
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [77.209, 28.6139], // Delhi
      zoom: 13,
    });

    // Initialize drawing tools
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: "simple_select",
    });

    map.current.addControl(draw.current);

    map.current.on("load", () => {
      setMapLoaded(true);
      loadExistingFences();
    });

    // Handle drawing events
    map.current.on("draw.create", handleDrawCreate);
    map.current.on("draw.update", handleDrawUpdate);
    map.current.on("draw.delete", handleDrawDelete);

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Load existing geofences
  const loadExistingFences = async () => {
    try {
      const { data, error } = await supabase
        .from("geo_fences")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setExistingFences(data || []);
      displayExistingFences(data || []);
    } catch (error) {
      console.error("Error loading geofences:", error);
      toast({
        title: "Error loading geofences",
        description: "Could not load existing geofences",
        variant: "destructive",
      });
    }
  };

  // Display existing fences on map
  const displayExistingFences = (fences: GeoFence[]) => {
    if (!map.current) return;

    fences.forEach((fence, index) => {
      const sourceId = `existing-fence-${fence.id}`;
      const layerId = `existing-fence-layer-${fence.id}`;

      try {
        // Convert coordinates to GeoJSON
        let geoJsonData;
        if (Array.isArray(fence.coordinates)) {
          const coordinates = fence.coordinates.map(
            (coord: { lng: number; lat: number }) => [coord.lng, coord.lat]
          );
          coordinates.push(coordinates[0]); // Close polygon

          geoJsonData = {
            type: "Feature",
            properties: { ...fence },
            geometry: {
              type: "Polygon",
              coordinates: [coordinates],
            },
          };
        } else {
          geoJsonData = {
            type: "Feature",
            properties: { ...fence },
            geometry: fence.coordinates,
          };
        }

        // Add source and layer
        map.current!.addSource(sourceId, {
          type: "geojson",
          data: geoJsonData,
        });

        const color =
          fence.type === "danger"
            ? "#ef4444"
            : fence.type === "restricted"
            ? "#f59e0b"
            : "#10b981";

        map.current!.addLayer({
          id: layerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": color,
            "fill-opacity": 0.2,
          },
        });

        map.current!.addLayer({
          id: `${layerId}-stroke`,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": color,
            "line-width": 2,
          },
        });

        // Add click handler
        map.current!.on("click", layerId, () => {
          setSelectedFence(fence);
          setFormData({
            name: fence.name,
            description: fence.description || "",
            type: fence.type,
          });
        });
      } catch (error) {
        console.error("Error displaying fence:", error);
      }
    });
  };

  // Handle drawing events
  const handleDrawCreate = (e: {
    features: Array<{ geometry: { type: string } }>;
  }) => {
    const feature = e.features[0];
    if (feature.geometry.type === "Polygon") {
      // Auto-populate form if empty
      if (!formData.name) {
        setFormData((prev) => ({
          ...prev,
          name: `New ${prev.type.replace("_", " ")} Zone`,
        }));
      }
    }
  };

  const handleDrawUpdate = (e: { features: unknown[] }) => {
    // Handle polygon updates
    console.log("Polygon updated:", e.features);
  };

  const handleDrawDelete = (e: { features: unknown[] }) => {
    // Handle polygon deletion
    console.log("Polygon deleted:", e.features);
  };

  // Save geofence
  const handleSave = async () => {
    if (!draw.current || !formData.name.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a name and draw a polygon",
        variant: "destructive",
      });
      return;
    }

    const drawnFeatures = draw.current.getAll();
    if (drawnFeatures.features.length === 0) {
      toast({
        title: "No polygon drawn",
        description: "Please draw a polygon on the map",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const polygon = drawnFeatures.features[0];

      if (selectedFence) {
        // Update existing fence
        const { error } = await supabase
          .from("geo_fences")
          .update({
            name: formData.name,
            description: formData.description,
            coordinates: polygon.geometry,
            type: formData.type,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedFence.id);

        if (error) throw error;

        toast({
          title: "Geofence updated",
          description: `${formData.name} has been updated successfully`,
        });
      } else {
        // Create new fence
        const { error } = await supabase.from("geo_fences").insert({
          name: formData.name,
          description: formData.description,
          coordinates: polygon.geometry,
          type: formData.type,
        });

        if (error) throw error;

        toast({
          title: "Geofence created",
          description: `${formData.name} has been created successfully`,
        });
      }

      // Reset form and reload
      setFormData({ name: "", description: "", type: "tourist_zone" });
      setSelectedFence(null);
      draw.current.deleteAll();
      await loadExistingFences();
    } catch (error) {
      console.error("Error saving geofence:", error);
      toast({
        title: "Error saving geofence",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete geofence
  const handleDelete = async (fence: GeoFence) => {
    if (!confirm(`Are you sure you want to delete "${fence.name}"?`)) return;

    try {
      const { error } = await supabase
        .from("geo_fences")
        .update({ active: false })
        .eq("id", fence.id);

      if (error) throw error;

      toast({
        title: "Geofence deleted",
        description: `${fence.name} has been deleted`,
      });

      await loadExistingFences();
      if (selectedFence?.id === fence.id) {
        setSelectedFence(null);
        setFormData({ name: "", description: "", type: "tourist_zone" });
        draw.current?.deleteAll();
      }
    } catch (error) {
      console.error("Error deleting geofence:", error);
      toast({
        title: "Error deleting geofence",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Load fence for editing
  const loadFenceForEditing = (fence: GeoFence) => {
    setSelectedFence(fence);
    setFormData({
      name: fence.name,
      description: fence.description || "",
      type: fence.type,
    });

    // Add to drawing layer
    if (draw.current) {
      draw.current.deleteAll();

      let feature;
      if (Array.isArray(fence.coordinates)) {
        const coordinates = fence.coordinates.map(
          (coord: { lng: number; lat: number }) => [coord.lng, coord.lat]
        );
        coordinates.push(coordinates[0]);

        feature = {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [coordinates],
          },
        };
      } else {
        feature = {
          type: "Feature",
          geometry: fence.coordinates,
        };
      }

      draw.current.add(feature);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="h-4 w-4" />;
      case "restricted":
        return <Shield className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "danger":
        return "destructive";
      case "restricted":
        return "secondary";
      default:
        return "default";
    }
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                Mapbox Token Required
              </h3>
              <p className="text-muted-foreground">
                Please add VITE_MAPBOX_ACCESS_TOKEN to your environment
                variables to use the geofence editor.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/admin")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
              <div>
                <h1 className="text-xl font-bold">Geofence Editor</h1>
                <p className="text-sm text-muted-foreground">
                  Create and manage safety zones
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Interactive Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={mapContainer}
                  className="w-full h-96 rounded-lg border"
                />
                {!mapLoaded && (
                  <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-muted-foreground">Loading map...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Form and Controls */}
          <div className="space-y-6">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit3 className="h-5 w-5 mr-2" />
                  {selectedFence ? "Edit Geofence" : "Create Geofence"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Zone name"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(
                      value: "restricted" | "danger" | "tourist_zone"
                    ) => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tourist_zone">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Tourist Zone
                        </div>
                      </SelectItem>
                      <SelectItem value="restricted">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Restricted Area
                        </div>
                      </SelectItem>
                      <SelectItem value="danger">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Danger Zone
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading
                      ? "Saving..."
                      : selectedFence
                      ? "Update"
                      : "Save"}
                  </Button>
                  {selectedFence && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedFence(null);
                        setFormData({
                          name: "",
                          description: "",
                          type: "tourist_zone",
                        });
                        draw.current?.deleteAll();
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Existing Fences */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Geofences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {existingFences.map((fence) => (
                    <div
                      key={fence.id}
                      className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted"
                      onClick={() => loadFenceForEditing(fence)}
                    >
                      <div className="flex items-center gap-2">
                        {getTypeIcon(fence.type)}
                        <div>
                          <p className="font-medium text-sm">{fence.name}</p>
                          <Badge
                            variant={
                              getTypeColor(fence.type) as
                                | "default"
                                | "secondary"
                                | "destructive"
                            }
                            className="text-xs"
                          >
                            {fence.type.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(fence);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {existingFences.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No geofences created yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoFenceEditor;
