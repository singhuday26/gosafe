import { Tourist, SOSAlert } from "./types";

// Utility functions for marker creation
export const createMarkerElement = (tourist: Tourist): HTMLDivElement => {
  const el = document.createElement("div");
  el.className = "tourist-marker";
  el.style.width = "20px";
  el.style.height = "20px";
  el.style.borderRadius = "50%";
  el.style.backgroundColor =
    tourist.status === "sos"
      ? "#EF4444"
      : tourist.status === "offline"
      ? "#6B7280"
      : "#10B981";
  el.style.border = "2px solid white";
  el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
  el.style.cursor = "pointer";

  // Add status indicator
  if (tourist.status === "sos") {
    el.style.animation = "pulse 2s infinite";
  }

  return el;
};

export const createSOSMarkerElement = (alert: SOSAlert): HTMLDivElement => {
  const el = document.createElement("div");
  el.className = "sos-marker animate-pulse";
  el.style.width = "24px";
  el.style.height = "24px";
  el.style.borderRadius = "50%";
  el.style.backgroundColor = "#DC2626";
  el.style.border = "3px solid white";
  el.style.boxShadow = "0 2px 8px rgba(220,38,38,0.5)";
  el.style.cursor = "pointer";
  el.style.zIndex = "1000";

  // Add pulsing animation for urgent alerts
  el.style.animation = "pulse 1.5s infinite, glow 2s infinite";

  return el;
};

export const createCustomMarkerElement = (
  color: string,
  size: number = 20,
  icon?: string
): HTMLDivElement => {
  const el = document.createElement("div");
  el.className = "custom-marker";
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.borderRadius = "50%";
  el.style.backgroundColor = color;
  el.style.border = "2px solid white";
  el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
  el.style.cursor = "pointer";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";

  if (icon) {
    el.innerHTML = `<span style="font-size: ${
      size * 0.6
    }px; color: white;">${icon}</span>`;
  }

  return el;
};

export const createClusterMarkerElement = (count: number): HTMLDivElement => {
  const el = document.createElement("div");
  el.className = "cluster-marker";
  el.style.width = "40px";
  el.style.height = "40px";
  el.style.borderRadius = "50%";
  el.style.backgroundColor = "#3B82F6";
  el.style.border = "3px solid white";
  el.style.boxShadow = "0 2px 8px rgba(59,130,246,0.3)";
  el.style.cursor = "pointer";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.color = "white";
  el.style.fontSize = "12px";
  el.style.fontWeight = "bold";
  el.innerHTML = count.toString();

  return el;
};
