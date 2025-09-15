import { GeoFence } from "../components/map/types";
import { supabase } from "../lib/supabase";

export interface LocationUpdate {
  touristId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
}

export interface GeoFenceAlert {
  id: string;
  touristId: string;
  geoFenceId: string;
  geoFenceName: string;
  alertType: "entry" | "exit" | "violation";
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
}

export interface RiskArea {
  id: string;
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in meters
  riskLevel: "low" | "medium" | "high" | "critical";
  description: string;
  activeIncidents: number;
}

export interface SafetyScore {
  score: number; // 0-100
  factors: {
    crime: number;
    traffic: number;
    crowding: number;
    infrastructure: number;
  };
  recommendations: string[];
}

export class GeoService {
  private static instance: GeoService;
  private geoFenceCache: Map<string, GeoFence[]> = new Map();
  private lastCacheUpdate: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): GeoService {
    if (!GeoService.instance) {
      GeoService.instance = new GeoService();
    }
    return GeoService.instance;
  }

  private validateCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
    );
  }

  private validateGeoFenceCoordinates(
    coordinates: Array<{ lat: number; lng: number }>
  ): boolean {
    if (!coordinates || coordinates.length < 3) {
      return false;
    }
    return coordinates.every((coord) =>
      this.validateCoordinates(coord.lat, coord.lng)
    );
  }

  async updateTouristLocation(update: LocationUpdate): Promise<void> {
    try {
      // Validate input
      if (!this.validateCoordinates(update.latitude, update.longitude)) {
        throw new Error("Invalid coordinates provided");
      }

      if (!update.touristId?.trim()) {
        throw new Error("Tourist ID is required");
      }

      const { error } = await supabase.from("tourist_locations").upsert([
        {
          tourist_id: update.touristId,
          latitude: update.latitude,
          longitude: update.longitude,
          accuracy: update.accuracy || null,
          updated_at: update.timestamp.toISOString(),
        },
      ]);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Check for geofence violations
      await this.checkGeoFenceViolations(update);
    } catch (error) {
      throw new Error(
        `Failed to update location: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getTouristLocation(touristId: string): Promise<LocationUpdate | null> {
    try {
      if (!touristId?.trim()) {
        throw new Error("Tourist ID is required");
      }

      const { data, error } = await supabase
        .from("tourist_locations")
        .select("*")
        .eq("tourist_id", touristId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // Not found is not an error, return null
        if (error.code === "PGRST116") {
          return null;
        }
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      return {
        touristId: data.tourist_id,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: new Date(data.updated_at),
        accuracy: data.accuracy,
      };
    } catch (error) {
      console.error("Failed to get tourist location:", error);
      throw error;
    }
  }

  async getAllTouristLocations(): Promise<LocationUpdate[]> {
    try {
      const { data, error } = await supabase
        .from("tourist_locations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((location) => ({
        touristId: location.tourist_id,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date(location.updated_at),
        accuracy: location.accuracy,
      }));
    } catch (error) {
      throw new Error(
        `Failed to get tourist locations: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async createGeoFence(geoFence: Omit<GeoFence, "id">): Promise<GeoFence> {
    try {
      // Validate input
      if (!geoFence.name?.trim()) {
        throw new Error("GeoFence name is required");
      }

      if (!this.validateGeoFenceCoordinates(geoFence.coordinates)) {
        throw new Error("Invalid coordinates for geofence");
      }

      const { data, error } = await supabase
        .from("geofences")
        .insert([
          {
            name: geoFence.name,
            type: geoFence.type,
            description: geoFence.description || "",
            coordinates: JSON.stringify(geoFence.coordinates),
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Clear cache
      this.geoFenceCache.clear();

      return {
        id: data.id,
        name: data.name,
        type: data.type,
        description: data.description,
        coordinates: JSON.parse(data.coordinates),
      };
    } catch (error) {
      throw new Error(
        `Failed to create geofence: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async updateGeoFence(id: string, updates: Partial<GeoFence>): Promise<void> {
    try {
      if (!id?.trim()) {
        throw new Error("GeoFence ID is required");
      }

      const updateData: Record<string, unknown> = {};

      if (updates.name?.trim()) updateData.name = updates.name;
      if (updates.type) updateData.type = updates.type;
      if (updates.description !== undefined)
        updateData.description = updates.description;
      if (
        updates.coordinates &&
        this.validateGeoFenceCoordinates(updates.coordinates)
      ) {
        updateData.coordinates = JSON.stringify(updates.coordinates);
      }

      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from("geofences")
        .update(updateData)
        .eq("id", id);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Clear cache
      this.geoFenceCache.clear();
    } catch (error) {
      throw new Error(
        `Failed to update geofence: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async deleteGeoFence(id: string): Promise<void> {
    try {
      if (!id?.trim()) {
        throw new Error("GeoFence ID is required");
      }

      const { error } = await supabase.from("geofences").delete().eq("id", id);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Clear cache
      this.geoFenceCache.clear();
    } catch (error) {
      throw new Error(
        `Failed to delete geofence: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getGeoFences(): Promise<GeoFence[]> {
    try {
      // Check cache first
      const now = Date.now();
      if (
        this.lastCacheUpdate > 0 &&
        now - this.lastCacheUpdate < this.CACHE_DURATION
      ) {
        const cached = this.geoFenceCache.get("all");
        if (cached) {
          return cached;
        }
      }

      const { data, error } = await supabase
        .from("geofences")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const geoFences = data.map((fence) => ({
        id: fence.id,
        name: fence.name,
        type: fence.type,
        description: fence.description,
        coordinates: JSON.parse(fence.coordinates),
      }));

      // Update cache
      this.geoFenceCache.set("all", geoFences);
      this.lastCacheUpdate = now;

      return geoFences;
    } catch (error) {
      console.error("Failed to get geofences:", error);
      return this.getMockGeoFences();
    }
  }

  async getGeoFenceAlerts(touristId?: string): Promise<GeoFenceAlert[]> {
    try {
      let query = supabase
        .from("geofence_alerts")
        .select(
          `
          *,
          geofences(name)
        `
        )
        .order("created_at", { ascending: false });

      if (touristId?.trim()) {
        query = query.eq("tourist_id", touristId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data.map((alert) => ({
        id: alert.id,
        touristId: alert.tourist_id,
        geoFenceId: alert.geofence_id,
        geoFenceName: alert.geofences?.name || "Unknown",
        alertType: alert.alert_type,
        location: {
          latitude: alert.latitude,
          longitude: alert.longitude,
        },
        timestamp: new Date(alert.created_at),
      }));
    } catch (error) {
      throw new Error(
        `Failed to get geofence alerts: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getRiskAreas(): Promise<RiskArea[]> {
    try {
      const { data, error } = await supabase
        .from("risk_areas")
        .select("*")
        .order("risk_level", { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data.map((area) => ({
        id: area.id,
        name: area.name,
        center: {
          latitude: area.center_latitude,
          longitude: area.center_longitude,
        },
        radius: area.radius,
        riskLevel: area.risk_level,
        description: area.description,
        activeIncidents: area.active_incidents || 0,
      }));
    } catch (error) {
      console.error("Failed to get risk areas:", error);
      return this.getMockRiskAreas();
    }
  }

  async calculateSafetyScore(location: {
    latitude: number;
    longitude: number;
  }): Promise<SafetyScore> {
    try {
      if (!this.validateCoordinates(location.latitude, location.longitude)) {
        throw new Error("Invalid coordinates provided");
      }

      // Call AI service for safety score calculation
      const { data, error } = await supabase.functions.invoke(
        "calculate-safety-score",
        {
          body: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        }
      );

      if (error) {
        throw new Error(`AI service error: ${error.message}`);
      }

      return data.safetyScore;
    } catch (error) {
      console.error("Failed to calculate safety score:", error);
      // Return mock score with proper structure
      return this.getMockSafetyScore();
    }
  }

  private async checkGeoFenceViolations(
    location: LocationUpdate
  ): Promise<void> {
    try {
      const geoFences = await this.getGeoFences();

      for (const fence of geoFences) {
        const isInside = this.isPointInPolygon(
          { lat: location.latitude, lng: location.longitude },
          fence.coordinates
        );

        // Check if this is a violation based on fence type
        if (fence.type === "danger" && isInside) {
          await this.createGeoFenceAlert({
            touristId: location.touristId,
            geoFenceId: fence.id,
            alertType: "violation",
            location: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
          });
        }
      }
    } catch (error) {
      console.error("Failed to check geofence violations:", error);
    }
  }

  private async createGeoFenceAlert(
    alert: Omit<GeoFenceAlert, "id" | "geoFenceName" | "timestamp">
  ): Promise<void> {
    try {
      const { error } = await supabase.from("geofence_alerts").insert([
        {
          tourist_id: alert.touristId,
          geofence_id: alert.geoFenceId,
          alert_type: alert.alertType,
          latitude: alert.location.latitude,
          longitude: alert.location.longitude,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
    } catch (error) {
      console.error("Failed to create geofence alert:", error);
    }
  }

  private isPointInPolygon(
    point: { lat: number; lng: number },
    polygon: Array<{ lat: number; lng: number }>
  ): boolean {
    if (polygon.length < 3) return false;

    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (
        polygon[i].lat > point.lat !== polygon[j].lat > point.lat &&
        point.lng <
          ((polygon[j].lng - polygon[i].lng) * (point.lat - polygon[i].lat)) /
            (polygon[j].lat - polygon[i].lat) +
            polygon[i].lng
      ) {
        inside = !inside;
      }
    }

    return inside;
  }

  private getMockGeoFences(): GeoFence[] {
    return [
      {
        id: "mock-safe-1",
        name: "Tourist Hub Area",
        type: "safe",
        description: "Main tourist area with high security",
        coordinates: [
          { lat: 28.6129, lng: 77.2295 },
          { lat: 28.6139, lng: 77.2305 },
          { lat: 28.6149, lng: 77.2295 },
          { lat: 28.6139, lng: 77.2285 },
        ],
      },
      {
        id: "mock-restricted-1",
        name: "Construction Zone",
        type: "restricted",
        description: "Temporary construction area - avoid during work hours",
        coordinates: [
          { lat: 28.61, lng: 77.22 },
          { lat: 28.611, lng: 77.221 },
          { lat: 28.612, lng: 77.22 },
          { lat: 28.611, lng: 77.219 },
        ],
      },
      {
        id: "mock-danger-1",
        name: "High Crime Area",
        type: "danger",
        description:
          "Area with elevated security risks - avoid especially at night",
        coordinates: [
          { lat: 28.6, lng: 77.21 },
          { lat: 28.601, lng: 77.211 },
          { lat: 28.602, lng: 77.21 },
          { lat: 28.601, lng: 77.209 },
        ],
      },
    ];
  }

  private getMockRiskAreas(): RiskArea[] {
    return [
      {
        id: "risk-1",
        name: "Crowded Market Area",
        center: { latitude: 28.6139, longitude: 77.2295 },
        radius: 500,
        riskLevel: "medium",
        description: "High pickpocket activity reported",
        activeIncidents: 3,
      },
      {
        id: "risk-2",
        name: "Traffic Congestion Zone",
        center: { latitude: 28.61, longitude: 77.22 },
        radius: 800,
        riskLevel: "high",
        description: "Heavy traffic with frequent accidents",
        activeIncidents: 7,
      },
    ];
  }

  private getMockSafetyScore(): SafetyScore {
    return {
      score: Math.floor(Math.random() * 40 + 60), // 60-100 range
      factors: {
        crime: Math.floor(Math.random() * 30 + 70),
        traffic: Math.floor(Math.random() * 40 + 60),
        crowding: Math.floor(Math.random() * 50 + 50),
        infrastructure: Math.floor(Math.random() * 20 + 80),
      },
      recommendations: [
        "Stay in well-lit areas",
        "Keep valuables secure",
        "Travel in groups when possible",
        "Avoid isolated areas after dark",
      ],
    };
  }
}

export const geoService = GeoService.getInstance();
