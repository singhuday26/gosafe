// Mock Blockchain Implementation for SIH 2025 Demo
// Browser-compatible hash function for mock blockchain

export interface DigitalTouristID {
  id: string;
  touristName: string;
  aadhaarNumber: string;
  passportNumber?: string;
  tripItinerary: string;
  emergencyContacts: EmergencyContact[];
  validFrom: Date;
  validTo: Date;
  blockchainHash: string;
  issuedAt: Date;
  status: "active" | "expired" | "revoked";
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface SOSAlert {
  id: string;
  touristId: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  timestamp: Date;
  type: "panic" | "medical" | "security" | "other";
  status: "active" | "responded" | "resolved";
  message?: string;
  blockchainHash: string;
}

// Mock Blockchain Functions
export class BlockchainService {
  private static instance: BlockchainService;
  private digitalIDs: Map<string, DigitalTouristID> = new Map();
  private sosAlerts: Map<string, SOSAlert> = new Map();

  static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  private generateHash(data: Record<string, unknown>): string {
    // Simple browser-compatible hash function for mock blockchain
    const str = JSON.stringify(data) + Date.now();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  generateDigitalID(
    touristData: Omit<
      DigitalTouristID,
      "id" | "blockchainHash" | "issuedAt" | "status"
    >
  ): DigitalTouristID {
    const id = `TID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const blockchainHash = this.generateHash({ ...touristData, id });

    const digitalID: DigitalTouristID = {
      ...touristData,
      id,
      blockchainHash,
      issuedAt: new Date(),
      status: "active",
    };

    this.digitalIDs.set(id, digitalID);
    return digitalID;
  }

  validateDigitalID(id: string): DigitalTouristID | null {
    const digitalID = this.digitalIDs.get(id);
    if (!digitalID) return null;

    const now = new Date();
    if (now > digitalID.validTo) {
      digitalID.status = "expired";
    }

    return digitalID;
  }

  createSOSAlert(
    alert: Omit<SOSAlert, "id" | "blockchainHash" | "timestamp" | "status">
  ): SOSAlert {
    const id = `SOS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const blockchainHash = this.generateHash({ ...alert, id });

    const sosAlert: SOSAlert = {
      ...alert,
      id,
      blockchainHash,
      timestamp: new Date(),
      status: "active",
    };

    this.sosAlerts.set(id, sosAlert);
    return sosAlert;
  }

  getAllDigitalIDs(): DigitalTouristID[] {
    return Array.from(this.digitalIDs.values());
  }

  getAllSOSAlerts(): SOSAlert[] {
    return Array.from(this.sosAlerts.values());
  }

  updateSOSStatus(alertId: string, status: SOSAlert["status"]): boolean {
    const alert = this.sosAlerts.get(alertId);
    if (alert) {
      alert.status = status;
      return true;
    }
    return false;
  }
}

// Mock Safety Score Calculation
export const calculateSafetyScore = (touristId: string): number => {
  // Mock AI-powered safety score (0-100)
  const baseScore = 85;
  const randomVariation = Math.random() * 15 - 7.5; // ±7.5 variation
  return Math.max(0, Math.min(100, baseScore + randomVariation));
};

// Mock Geo-fence Detection
export interface GeoFence {
  id: string;
  name: string;
  type: "safe" | "restricted" | "danger";
  coordinates: Array<{ lat: number; lng: number }>;
  description: string;
}

export const mockGeoFences: GeoFence[] = [
  {
    id: "safe-1",
    name: "Tourist Hub Area",
    type: "safe",
    coordinates: [
      { lat: 28.6139, lng: 77.209 }, // Delhi coordinates
      { lat: 28.6145, lng: 77.2095 },
      { lat: 28.6135, lng: 77.21 },
      { lat: 28.613, lng: 77.2085 },
    ],
    description: "Main tourist area with high security",
  },
  {
    id: "restricted-1",
    name: "Construction Zone",
    type: "restricted",
    coordinates: [
      { lat: 28.612, lng: 77.207 },
      { lat: 28.6125, lng: 77.2075 },
      { lat: 28.6115, lng: 77.208 },
      { lat: 28.611, lng: 77.2065 },
    ],
    description: "Active construction area - avoid after 6 PM",
  },
];

export const checkGeoFenceStatus = (
  latitude: number,
  longitude: number
): GeoFence | null => {
  // Simplified point-in-polygon check (mock implementation)
  for (const fence of mockGeoFences) {
    const isInside =
      Math.abs(latitude - fence.coordinates[0].lat) < 0.005 &&
      Math.abs(longitude - fence.coordinates[0].lng) < 0.005;
    if (isInside) return fence;
  }
  return null;
};
