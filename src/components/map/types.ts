export interface Tourist {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: "active" | "sos" | "offline";
}

export interface GeoFence {
  id: string;
  name: string;
  type: "safe" | "restricted" | "danger";
  coordinates: Array<{ lat: number; lng: number }>;
  description?: string;
}

export interface SOSAlert {
  id: string;
  latitude: number;
  longitude: number;
  type: string;
  tourist_name?: string;
  timestamp?: Date;
  status?: "active" | "responded" | "resolved";
}

export interface MapComponentProps {
  tourists?: Tourist[];
  geoFences?: GeoFence[];
  sosAlerts?: SOSAlert[];
  center?: [number, number];
  zoom?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  showControls?: boolean;
  showStats?: boolean;
  showLegend?: boolean;
  className?: string;
}

export interface LocationCoordinate {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export type MapTheme = "light" | "dark" | "satellite" | "streets";

export interface HeatmapDataPoint {
  lat: number;
  lng: number;
  intensity: number;
  type?: "incident" | "crowd" | "safety" | "risk";
}
// File refreshed
