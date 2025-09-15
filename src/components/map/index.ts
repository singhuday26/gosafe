// Main map component
export { default as MapComponent } from "./MapComponent";

// Map sub-components
export { MapLegend } from "./MapLegend";
export { MapStats } from "./MapStats";
export { MapOverlay } from "./MapOverlay";

// Map utilities
export {
  createMarkerElement,
  createSOSMarkerElement,
  createCustomMarkerElement,
  createClusterMarkerElement,
} from "./MapMarkers";

// Types
export type {
  Tourist,
  GeoFence,
  SOSAlert,
  MapComponentProps,
  LocationCoordinate,
  MapBounds,
  MapTheme,
  HeatmapDataPoint,
} from "./types";
