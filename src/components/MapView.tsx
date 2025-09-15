import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  AlertTriangle,
  Shield,
  Eye,
  EyeOff,
  Layers,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import * as turf from "@turf/turf";

// Initialize Mapbox token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

interface Tourist {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: "active" | "sos" | "offline";
  last_seen?: string;
}

interface GeoFence {
  id: string;
  name: string;
  description?: string;
  coordinates: unknown; // GeoJSON Polygon or legacy format
  type: "safe" | "restricted" | "danger" | "tourist_zone";
  active?: boolean;
}

interface SOSAlert {
  id: string;
  latitude: number;
  longitude: number;
  alert_type: string;
  tourist_name?: string;
  timestamp: string;
  status: "active" | "responded" | "resolved";
}

interface MapViewProps {
  tourists?: Tourist[];
  geofences?: GeoFence[];
  sosAlerts?: SOSAlert[];
  center?: [number, number];
  zoom?: number;
  showControls?: boolean;
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  onGeofenceClick?: (geofence: GeoFence) => void;
  onTouristClick?: (tourist: Tourist) => void;
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [77.209, 28.6139]; // Delhi
const DEFAULT_ZOOM = 13;

// Geofence color mapping
const GEOFENCE_COLORS = {
  danger: {
    fill: "#ef4444",
    stroke: "#dc2626",
    opacity: 0.3,
  },
  restricted: {
    fill: "#f59e0b",
    stroke: "#d97706",
    opacity: 0.25,
  },
  tourist_zone: {
    fill: "#10b981",
    stroke: "#059669",
    opacity: 0.2,
  },
  safe: {
    fill: "#10b981",
    stroke: "#059669",
    opacity: 0.2,
  },
};

const MapView: React.FC<MapViewProps> = ({
  tourists = [],
  geofences = [],
  sosAlerts = [],
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  showControls = true,
  interactive = true,
  onLocationSelect,
  onGeofenceClick,
  onTouristClick,
  className = "",
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedGeofence, setSelectedGeofence] = useState<GeoFence | null>(
    null
  );
  const [showGeofences, setShowGeofences] = useState(true);
  const [showTourists, setShowTourists] = useState(true);
  const [showSOS, setShowSOS] = useState(true);
  const [geofenceOpacity, setGeofenceOpacity] = useState([30]);
  const [useMapbox, setUseMapbox] = useState(!!MAPBOX_TOKEN);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      if (useMapbox && MAPBOX_TOKEN) {
        // Use Mapbox GL JS
        mapboxgl.accessToken = MAPBOX_TOKEN;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: center,
          zoom: zoom,
          interactive: interactive,
        });

        map.current.on("load", () => {
          setMapLoaded(true);
        });

        // Add click handler for location selection
        if (onLocationSelect) {
          map.current.on("click", (e) => {
            const { lng, lat } = e.lngLat;
            onLocationSelect(lat, lng);
          });
        }
      } else {
        // Fallback to Leaflet (would need to be implemented)
        console.warn("Mapbox token not available, implement Leaflet fallback");
        setMapLoaded(true);
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      setUseMapbox(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [center, zoom, interactive, onLocationSelect, useMapbox]);

  // Add geofence layers
  useEffect(() => {
    if (!mapLoaded || !map.current || !showGeofences) return;

    // Remove existing geofence layers
    geofences.forEach((_, index) => {
      const layerId = `geofence-${index}`;
      const sourceId = `geofence-source-${index}`;

      if (map.current!.getLayer(layerId)) {
        map.current!.removeLayer(layerId);
      }
      if (map.current!.getSource(sourceId)) {
        map.current!.removeSource(sourceId);
      }
    });

    // Add geofence layers
    geofences.forEach((geofence, index) => {
      if (!geofence.coordinates || !geofence.active) return;

      const layerId = `geofence-${index}`;
      const sourceId = `geofence-source-${index}`;
      const colors = GEOFENCE_COLORS[geofence.type] || GEOFENCE_COLORS.safe;

      try {
        // Convert coordinates to GeoJSON if needed
        let geoJsonData;
        if (Array.isArray(geofence.coordinates)) {
          // Legacy format: array of {lat, lng} objects
          const coordinates = geofence.coordinates.map(
            (coord: { lat: number; lng: number }) => [coord.lng, coord.lat]
          );
          coordinates.push(coordinates[0]); // Close the polygon

          geoJsonData = {
            type: "Feature",
            properties: {
              id: geofence.id,
              name: geofence.name,
              type: geofence.type,
              description: geofence.description,
            },
            geometry: {
              type: "Polygon",
              coordinates: [coordinates],
            },
          };
        } else {
          // GeoJSON format
          geoJsonData = {
            type: "Feature",
            properties: {
              id: geofence.id,
              name: geofence.name,
              type: geofence.type,
              description: geofence.description,
            },
            geometry: geofence.coordinates,
          };
        }

        // Add source
        map.current!.addSource(sourceId, {
          type: "geojson",
          data: geoJsonData,
        });

        // Add fill layer
        map.current!.addLayer({
          id: layerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": colors.fill,
            "fill-opacity": (geofenceOpacity[0] / 100) * colors.opacity,
          },
        });

        // Add stroke layer
        map.current!.addLayer({
          id: `${layerId}-stroke`,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": colors.stroke,
            "line-width": 2,
            "line-opacity": 0.8,
          },
        });

        // Add click handler
        map.current!.on("click", layerId, (e) => {
          if (e.features && e.features[0]) {
            const feature = e.features[0];
            const clickedGeofence = geofences.find(
              (g) => g.id === feature.properties?.id
            );
            if (clickedGeofence) {
              setSelectedGeofence(clickedGeofence);
              onGeofenceClick?.(clickedGeofence);
            }
          }
        });

        // Change cursor on hover
        map.current!.on("mouseenter", layerId, () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = "pointer";
          }
        });

        map.current!.on("mouseleave", layerId, () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = "";
          }
        });
      } catch (error) {
        console.error("Error adding geofence layer:", error);
      }
    });
  }, [mapLoaded, geofences, showGeofences, geofenceOpacity, onGeofenceClick]);

  // Add tourist markers
  useEffect(() => {
    if (!mapLoaded || !map.current || !showTourists) return;

    // Remove existing tourist markers
    tourists.forEach((_, index) => {
      const markerId = `tourist-${index}`;
      if (map.current!.getLayer(markerId)) {
        map.current!.removeLayer(markerId);
      }
      if (map.current!.getSource(markerId)) {
        map.current!.removeSource(markerId);
      }
    });

    // Add tourist markers
    tourists.forEach((tourist, index) => {
      const markerId = `tourist-${index}`;

      const color =
        tourist.status === "sos"
          ? "#ef4444"
          : tourist.status === "offline"
          ? "#6b7280"
          : "#10b981";

      map.current!.addSource(markerId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {
            id: tourist.id,
            name: tourist.name,
            status: tourist.status,
          },
          geometry: {
            type: "Point",
            coordinates: [tourist.longitude, tourist.latitude],
          },
        },
      });

      map.current!.addLayer({
        id: markerId,
        type: "circle",
        source: markerId,
        paint: {
          "circle-radius": 8,
          "circle-color": color,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      // Add click handler
      map.current!.on("click", markerId, () => {
        onTouristClick?.(tourist);
      });
    });
  }, [mapLoaded, tourists, showTourists, onTouristClick]);

  // Add SOS alert markers
  useEffect(() => {
    if (!mapLoaded || !map.current || !showSOS) return;

    // Remove existing SOS markers
    sosAlerts.forEach((_, index) => {
      const markerId = `sos-${index}`;
      if (map.current!.getLayer(markerId)) {
        map.current!.removeLayer(markerId);
      }
      if (map.current!.getSource(markerId)) {
        map.current!.removeSource(markerId);
      }
    });

    // Add SOS markers
    sosAlerts
      .filter((alert) => alert.status === "active")
      .forEach((alert, index) => {
        const markerId = `sos-${index}`;

        map.current!.addSource(markerId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {
              id: alert.id,
              type: alert.alert_type,
              tourist: alert.tourist_name,
              timestamp: alert.timestamp,
            },
            geometry: {
              type: "Point",
              coordinates: [alert.longitude, alert.latitude],
            },
          },
        });

        map.current!.addLayer({
          id: markerId,
          type: "circle",
          source: markerId,
          paint: {
            "circle-radius": 12,
            "circle-color": "#dc2626",
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 3,
          },
        });

        // Add pulsing animation
        map.current!.addLayer({
          id: `${markerId}-pulse`,
          type: "circle",
          source: markerId,
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              20,
              15,
              40,
            ],
            "circle-color": "#dc2626",
            "circle-opacity": 0.3,
          },
        });
      });
  }, [mapLoaded, sosAlerts, showSOS]);

  // Map control functions
  const zoomIn = useCallback(() => {
    if (map.current) {
      map.current.zoomIn();
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (map.current) {
      map.current.zoomOut();
    }
  }, []);

  const fitToData = useCallback(() => {
    if (!map.current) return;

    const allPoints: [number, number][] = [];

    // Add tourist locations
    tourists.forEach((tourist) => {
      allPoints.push([tourist.longitude, tourist.latitude]);
    });

    // Add SOS alert locations
    sosAlerts.forEach((alert) => {
      allPoints.push([alert.longitude, alert.latitude]);
    });

    if (allPoints.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      allPoints.forEach((point) => bounds.extend(point));
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [tourists, sosAlerts]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Map container */}
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: "400px" }}
      />

      {/* Map controls */}
      {showControls && (
        <>
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={zoomIn}
              className="bg-white/90"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={zoomOut}
              className="bg-white/90"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={fitToData}
              className="bg-white/90"
            >
              <Layers className="h-4 w-4" />
            </Button>
          </div>

          {/* Legend */}
          <Card className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Map Legend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Layer toggles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Geofences</span>
                  <Switch
                    checked={showGeofences}
                    onCheckedChange={setShowGeofences}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Tourists</span>
                  <Switch
                    checked={showTourists}
                    onCheckedChange={setShowTourists}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">SOS Alerts</span>
                  <Switch checked={showSOS} onCheckedChange={setShowSOS} />
                </div>
              </div>

              {/* Opacity control */}
              {showGeofences && (
                <div className="space-y-1">
                  <span className="text-xs">Fence Opacity</span>
                  <Slider
                    value={geofenceOpacity}
                    onValueChange={setGeofenceOpacity}
                    max={100}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                </div>
              )}

              {/* Zone types */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded opacity-30"></div>
                  <span className="text-xs">Danger Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded opacity-25"></div>
                  <span className="text-xs">Restricted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded opacity-20"></div>
                  <span className="text-xs">Tourist Zone</span>
                </div>
              </div>

              {/* Status indicators */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                  <span className="text-xs">Active Tourist</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                  <span className="text-xs">SOS Alert</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full border border-white"></div>
                  <span className="text-xs">Offline</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Selected geofence details */}
      {selectedGeofence && (
        <Card className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm max-w-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{selectedGeofence.name}</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedGeofence(null)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge
                variant={
                  selectedGeofence.type === "danger"
                    ? "destructive"
                    : selectedGeofence.type === "restricted"
                    ? "secondary"
                    : "default"
                }
              >
                {selectedGeofence.type.replace("_", " ")}
              </Badge>
              {selectedGeofence.description && (
                <p className="text-xs text-muted-foreground">
                  {selectedGeofence.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-pulse" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
