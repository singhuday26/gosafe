import { supabase } from "@/lib/supabase";
import type { Database } from "@/integrations/supabase/types";

export type DigitalTouristID =
  Database["public"]["Tables"]["digital_tourist_ids"]["Row"];
export type SOSAlert = Database["public"]["Tables"]["sos_alerts"]["Row"];
export type GeoFence = Database["public"]["Tables"]["geo_fences"]["Row"];
export type TouristLocation =
  Database["public"]["Tables"]["tourist_locations"]["Row"];

export interface ExtendedSOSAlert extends SOSAlert {
  digital_tourist_ids?: {
    tourist_name: string;
  };
}

export interface SafetyMetrics {
  totalTourists: number;
  activeTourists: number;
  totalAlerts: number;
  activeAlerts: number;
  safeZones: number;
  dangerZones: number;
  restrictedZones: number;
}

export class TouristService {
  private static instance: TouristService;

  static getInstance(): TouristService {
    if (!TouristService.instance) {
      TouristService.instance = new TouristService();
    }
    return TouristService.instance;
  }

  // Digital Tourist IDs
  async getAllDigitalTouristIDs(): Promise<DigitalTouristID[]> {
    try {
      const { data, error } = await supabase
        .from("digital_tourist_ids")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching digital tourist IDs:", error);
      return [];
    }
  }

  async getDigitalTouristID(id: string): Promise<DigitalTouristID | null> {
    try {
      const { data, error } = await supabase
        .from("digital_tourist_ids")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching digital tourist ID:", error);
      return null;
    }
  }

  async createDigitalTouristID(
    touristData: Database["public"]["Tables"]["digital_tourist_ids"]["Insert"]
  ): Promise<DigitalTouristID | null> {
    try {
      const { data, error } = await supabase
        .from("digital_tourist_ids")
        .insert(touristData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating digital tourist ID:", error);
      return null;
    }
  }

  // SOS Alerts
  async getAllSOSAlerts(): Promise<ExtendedSOSAlert[]> {
    try {
      const { data, error } = await supabase
        .from("sos_alerts")
        .select(
          `
          *,
          digital_tourist_ids (
            tourist_name
          )
        `
        )
        .order("timestamp", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching SOS alerts:", error);
      return [];
    }
  }

  async getActiveSOSAlerts(): Promise<ExtendedSOSAlert[]> {
    try {
      const { data, error } = await supabase
        .from("sos_alerts")
        .select(
          `
          *,
          digital_tourist_ids (
            tourist_name
          )
        `
        )
        .eq("status", "active")
        .order("timestamp", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching active SOS alerts:", error);
      return [];
    }
  }

  async createSOSAlert(
    alertData: Database["public"]["Tables"]["sos_alerts"]["Insert"]
  ): Promise<SOSAlert | null> {
    try {
      const { data, error } = await supabase
        .from("sos_alerts")
        .insert(alertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating SOS alert:", error);
      return null;
    }
  }

  async updateSOSAlertStatus(
    alertId: string,
    status: "active" | "responded" | "resolved"
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("sos_alerts")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", alertId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating SOS alert status:", error);
      return false;
    }
  }

  // Geo-fences
  async getAllGeoFences(): Promise<GeoFence[]> {
    try {
      const { data, error } = await supabase
        .from("geo_fences")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching geo-fences:", error);
      return [];
    }
  }

  async createGeoFence(
    geoFenceData: Database["public"]["Tables"]["geo_fences"]["Insert"]
  ): Promise<GeoFence | null> {
    try {
      const { data, error } = await supabase
        .from("geo_fences")
        .insert(geoFenceData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating geo-fence:", error);
      return null;
    }
  }

  async updateGeoFence(
    geoFenceId: string,
    updates: Database["public"]["Tables"]["geo_fences"]["Update"]
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("geo_fences")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", geoFenceId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating geo-fence:", error);
      return false;
    }
  }

  async deleteGeoFence(geoFenceId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("geo_fences")
        .delete()
        .eq("id", geoFenceId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting geo-fence:", error);
      return false;
    }
  }

  // Tourist Locations
  async updateTouristLocation(
    touristId: string,
    latitude: number,
    longitude: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from("tourist_locations").insert({
        tourist_id: touristId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating tourist location:", error);
      return false;
    }
  }

  async getLatestTouristLocations(): Promise<TouristLocation[]> {
    try {
      const { data, error } = await supabase
        .from("tourist_locations")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100); // Get latest 100 locations

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching tourist locations:", error);
      return [];
    }
  }

  // Safety Metrics
  async getSafetyMetrics(): Promise<SafetyMetrics> {
    try {
      const [touristsData, alertsData, geoFencesData] = await Promise.all([
        supabase
          .from("digital_tourist_ids")
          .select("status", { count: "exact" }),
        supabase.from("sos_alerts").select("status", { count: "exact" }),
        supabase.from("geo_fences").select("type", { count: "exact" }),
      ]);

      const totalTourists = touristsData.count || 0;
      const activeTourists =
        touristsData.data?.filter((t) => t.status === "active").length || 0;

      const totalAlerts = alertsData.count || 0;
      const activeAlerts =
        alertsData.data?.filter((a) => a.status === "active").length || 0;

      const safeZones =
        geoFencesData.data?.filter((g) => g.type === "safe").length || 0;
      const dangerZones =
        geoFencesData.data?.filter((g) => g.type === "danger").length || 0;
      const restrictedZones =
        geoFencesData.data?.filter((g) => g.type === "restricted").length || 0;

      return {
        totalTourists,
        activeTourists,
        totalAlerts,
        activeAlerts,
        safeZones,
        dangerZones,
        restrictedZones,
      };
    } catch (error) {
      console.error("Error fetching safety metrics:", error);
      return {
        totalTourists: 0,
        activeTourists: 0,
        totalAlerts: 0,
        activeAlerts: 0,
        safeZones: 0,
        dangerZones: 0,
        restrictedZones: 0,
      };
    }
  }

  // Real-time subscriptions
  subscribeToSOSAlerts(callback: (alert: SOSAlert) => void) {
    return supabase
      .channel("sos_alerts_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sos_alerts",
        },
        (payload) => {
          callback(payload.new as SOSAlert);
        }
      )
      .subscribe();
  }

  subscribeToLocationUpdates(callback: (location: TouristLocation) => void) {
    return supabase
      .channel("tourist_locations_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tourist_locations",
        },
        (payload) => {
          callback(payload.new as TouristLocation);
        }
      )
      .subscribe();
  }

  subscribeToGeoFenceChanges(callback: (geoFence: GeoFence) => void) {
    return supabase
      .channel("geo_fences_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "geo_fences",
        },
        (payload) => {
          callback(payload.new as GeoFence);
        }
      )
      .subscribe();
  }

  // Utility functions
  calculateSafetyScore(
    touristId: string,
    currentLocation?: { lat: number; lng: number }
  ): number {
    // This is a simplified calculation - in production, this would consider:
    // - Current location safety rating
    // - Recent alerts in the area
    // - Time of day
    // - Weather conditions
    // - Tourist's behavior patterns

    const baseScore = 85;

    // Reduce score if there are recent alerts in the area
    // Add other factors as needed

    const randomVariation = Math.random() * 10 - 5; // ±5 points
    return Math.max(0, Math.min(100, baseScore + randomVariation));
  }

  isPointInGeoFence(lat: number, lng: number, geoFence: GeoFence): boolean {
    try {
      const coordinates = geoFence.coordinates as Array<{
        lat: number;
        lng: number;
      }>;

      // Simple point-in-polygon check (for complex polygons, use a proper library)
      let inside = false;
      for (
        let i = 0, j = coordinates.length - 1;
        i < coordinates.length;
        j = i++
      ) {
        const xi = coordinates[i].lat;
        const yi = coordinates[i].lng;
        const xj = coordinates[j].lat;
        const yj = coordinates[j].lng;

        if (
          yi > lng !== yj > lng &&
          lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi
        ) {
          inside = !inside;
        }
      }
      return inside;
    } catch (error) {
      console.error("Error checking point in geofence:", error);
      return false;
    }
  }

  checkCurrentGeoFence(
    lat: number,
    lng: number,
    geoFences: GeoFence[]
  ): GeoFence | null {
    for (const geoFence of geoFences) {
      if (this.isPointInGeoFence(lat, lng, geoFence)) {
        return geoFence;
      }
    }
    return null;
  }
}

export const touristService = TouristService.getInstance();
