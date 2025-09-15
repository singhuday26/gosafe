import React, { useEffect, useRef, useState, useCallback } from "react";
import type { Map as MapboxMap, Marker, NavigationControl } from "mapbox-gl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Shield } from "lucide-react";
import { MapOverlay } from "./MapOverlay";
import { MapLegend } from "./MapLegend";
import { MapStats } from "./MapStats";
import { createMarkerElement, createSOSMarkerElement } from "./MapMarkers";
import { Tourist, GeoFence, SOSAlert, MapComponentProps } from "./types";

// Lazy load Mapbox GL and its CSS
const loadMapbox = () =>
  Promise.all([
    import("mapbox-gl"),
    import("mapbox-gl/dist/mapbox-gl.css"),
  ]).then(([mapboxgl]) => mapboxgl.default);

const MapComponent: React.FC<MapComponentProps> = ({
  tourists = [],
  geoFences = [],
  sosAlerts = [],
  center = [77.209, 28.6139], // Delhi coordinates
  zoom = 12,
  onLocationSelect,
  showControls = true,
  showStats = true,
  showLegend = true,
  className = "",
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMapboxToken, setHasMapboxToken] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);

  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    setHasMapboxToken(!!mapboxToken);
  }, [mapboxToken]);

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    if (markersRef.current) {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    }
  }, []);

  // Clear existing geofence layers
  const clearGeoFences = useCallback(() => {
    if (!map.current) return;

    // Get all layers and remove geofence ones
    const style = map.current.getStyle();
    if (style && style.layers) {
      style.layers.forEach((layer) => {
        if (layer.id.includes("geofence-layer")) {
          if (map.current!.getLayer(layer.id)) {
            map.current!.removeLayer(layer.id);
          }
        }
      });
    }

    // Get all sources and remove geofence ones
    if (style && style.sources) {
      Object.keys(style.sources).forEach((sourceId) => {
        if (sourceId.includes("geofence-")) {
          if (map.current!.getSource(sourceId)) {
            map.current!.removeSource(sourceId);
          }
        }
      });
    }
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!map.current || !mapInitialized) return;

    const loadMarkersAsync = async () => {
      try {
        const mapboxgl = await loadMapbox();

        // Clear existing markers
        clearMarkers();

        // Add tourist markers
        tourists.forEach((tourist) => {
          const marker = new mapboxgl.Marker({
            element: createMarkerElement(tourist),
          })
            .setLngLat([tourist.longitude, tourist.latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
                <div class="p-2">
                  <h3 class="font-semibold">${tourist.name}</h3>
                  <p class="text-sm">Status: ${tourist.status}</p>
                  <p class="text-xs text-gray-500">
                    ${tourist.latitude.toFixed(4)}, ${tourist.longitude.toFixed(
                4
              )}
                  </p>
                </div>
              `)
            )
            .addTo(map.current!);

          markersRef.current.push(marker);
        });

        // Add SOS alert markers
        sosAlerts.forEach((alert) => {
          const marker = new mapboxgl.Marker({
            element: createSOSMarkerElement(alert),
          })
            .setLngLat([alert.longitude, alert.latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
                <div class="p-2 border-l-4 border-red-500">
                  <h3 class="font-semibold text-red-700">🚨 SOS Alert</h3>
                  <p class="text-sm">Type: ${alert.type}</p>
                  ${
                    alert.tourist_name
                      ? `<p class="text-sm">Tourist: ${alert.tourist_name}</p>`
                      : ""
                  }
                  <p class="text-xs text-gray-500">
                    ${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}
                  </p>
                </div>
              `)
            )
            .addTo(map.current!);

          markersRef.current.push(marker);
        });
      } catch (error) {
        console.error("Error updating markers:", error);
      }
    };

    loadMarkersAsync();
  }, [tourists, sosAlerts, mapInitialized, clearMarkers]);

  // Update geofences when data changes
  useEffect(() => {
    if (!map.current || !mapInitialized) return;

    // Clear existing geofences
    clearGeoFences();

    // Add geo-fence layers
    geoFences.forEach((fence, index) => {
      const sourceId = `geofence-${index}`;
      const layerId = `geofence-layer-${index}`;

      // Convert coordinates to GeoJSON polygon
      const coordinates = fence.coordinates.map((coord) => [
        coord.lng,
        coord.lat,
      ]);
      coordinates.push(coordinates[0]); // Close the polygon

      if (map.current) {
        map.current.addSource(sourceId, {
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

        map.current.addLayer({
          id: layerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": fillColor,
            "fill-opacity": 0.2,
          },
        });

        map.current.addLayer({
          id: `${layerId}-outline`,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": fillColor,
            "line-width": 2,
          },
        });
      }
    });
  }, [geoFences, mapInitialized, clearGeoFences]);

  const initializeMap = useCallback(
    async (token: string) => {
      if (!mapContainer.current || !token) return;

      setIsLoading(true);

      try {
        const mapboxgl = await loadMapbox();
        mapboxgl.accessToken = token;

        if (map.current) {
          map.current.remove();
        }

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/light-v11",
          center,
          zoom,
          maxZoom: 18,
          minZoom: 3,
        });

        if (showControls) {
          const navigationControl = new mapboxgl.NavigationControl();
          map.current.addControl(navigationControl, "top-right");
        }

        map.current.on("load", () => {
          if (!map.current) return;

          setMapInitialized(true);
          setIsLoading(false);
        });

        // Add click handler for location selection
        if (onLocationSelect) {
          map.current.on("click", (e) => {
            const { lng, lat } = e.lngLat;
            onLocationSelect(lat, lng);
          });
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        setIsLoading(false);
      }
    },
    [center, zoom, onLocationSelect, showControls]
  );

  useEffect(() => {
    if (hasMapboxToken && mapboxToken) {
      initializeMap(mapboxToken);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [initializeMap, hasMapboxToken, mapboxToken]);

  if (!hasMapboxToken) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-64 bg-muted/20 rounded-lg p-6 ${className}`}
      >
        <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Map Configuration Required
        </h3>
        <p className="text-muted-foreground text-center max-w-md mb-4">
          Please add your Mapbox access token to the environment variables
          (VITE_MAPBOX_ACCESS_TOKEN) to enable the interactive map.
        </p>
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Get your token from{" "}
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              mapbox.com
            </a>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`relative h-full ${className}`}>
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />

      {/* Map Legend */}
      {showLegend && <MapLegend />}

      {/* Statistics Overlay */}
      {showStats && (
        <MapStats
          tourists={tourists}
          sosAlerts={sosAlerts}
          geoFences={geoFences}
        />
      )}

      {/* Loading Overlay */}
      <MapOverlay isLoading={isLoading} />
    </div>
  );
};

export default MapComponent;
