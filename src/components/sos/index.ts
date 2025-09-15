// SOS Components
export { SOSButton } from "./SOSButton";
export { SOSOverlay } from "./SOSOverlay";
export { SOSHistory } from "./SOSHistory";

// SOS Types
export interface SOSAlert {
  id: string;
  timestamp: Date;
  type: "panic" | "medical" | "security" | "general";
  status: "active" | "responded" | "resolved" | "cancelled";
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  touristId: string;
  responseTime?: number;
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  number: string;
  type: "primary" | "secondary" | "emergency";
}

export interface SOSConfig {
  holdDuration: number; // milliseconds
  autoResolveTime: number; // seconds
  emergencyContacts: EmergencyContact[];
}
