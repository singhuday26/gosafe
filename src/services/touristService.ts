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

  // Anomaly-triggered SOS Alerts
  async createAnomalySOSAlert(
    touristId: string,
    anomalyType: string,
    severityLevel: "low" | "medium" | "high" | "critical",
    location: { lat: number; lng: number },
    details: Record<string, unknown>,
    recommendations: string[]
  ): Promise<SOSAlert | null> {
    try {
      // Generate blockchain hash for the anomaly alert
      const blockchainHash = `anomaly_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const alertData: Database["public"]["Tables"]["sos_alerts"]["Insert"] = {
        tourist_id: touristId,
        alert_type: `anomaly_${anomalyType}`,
        message: `AI Anomaly Detected: ${anomalyType
          .replace("_", " ")
          .toUpperCase()} - Severity: ${severityLevel.toUpperCase()}`,
        latitude: location.lat,
        longitude: location.lng,
        blockchain_hash: blockchainHash,
        status: severityLevel === "critical" ? "active" : "active", // All anomalies start as active
        address: `Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(
          6
        )}`,
      };

      const alert = await this.createSOSAlert(alertData);

      if (alert) {
        // Log anomaly details for tracking
        console.log(`Anomaly SOS Alert created:`, {
          alertId: alert.id,
          touristId,
          anomalyType,
          severityLevel,
          recommendations,
        });

        // Trigger additional emergency protocols for critical anomalies
        if (severityLevel === "critical") {
          await this.triggerEmergencyProtocol(
            touristId,
            anomalyType,
            location,
            recommendations
          );
        }
      }

      return alert;
    } catch (error) {
      console.error("Error creating anomaly SOS alert:", error);
      return null;
    }
  }

  /**
   * Trigger emergency protocols for critical anomalies
   */
  private async triggerEmergencyProtocol(
    touristId: string,
    anomalyType: string,
    location: { lat: number; lng: number },
    recommendations: string[]
  ): Promise<void> {
    try {
      // Get tourist details for emergency contact
      const tourist = await this.getDigitalTouristID(touristId);

      if (tourist) {
        // Create additional emergency alert with tourist details
        const emergencyAlert: Database["public"]["Tables"]["sos_alerts"]["Insert"] =
          {
            tourist_id: touristId,
            alert_type: "emergency_anomaly_critical",
            message: `CRITICAL EMERGENCY: ${
              tourist.tourist_name
            } - ${anomalyType.replace("_", " ").toUpperCase()}`,
            latitude: location.lat,
            longitude: location.lng,
            blockchain_hash: `emergency_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            status: "active",
            address: `Emergency Location: ${location.lat.toFixed(
              6
            )}, ${location.lng.toFixed(6)}`,
          };

        await this.createSOSAlert(emergencyAlert);

        // Here you could integrate with:
        // - Emergency notification systems
        // - Local authorities alert system
        // - Tourist's emergency contacts
        // - Nearby police stations
        console.log(
          `Emergency protocol triggered for tourist ${tourist.tourist_name}`
        );
      }
    } catch (error) {
      console.error("Error triggering emergency protocol:", error);
    }
  }

  /**
   * Get anomaly-specific alerts
   */
  async getAnomalyAlerts(): Promise<ExtendedSOSAlert[]> {
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
        .like("alert_type", "anomaly_%")
        .order("timestamp", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching anomaly alerts:", error);
      return [];
    }
  }

  /**
   * Get critical anomaly alerts that require immediate attention
   */
  async getCriticalAnomalyAlerts(): Promise<ExtendedSOSAlert[]> {
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
        .eq("alert_type", "anomaly_silent_distress")
        .eq("status", "active")
        .order("timestamp", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching critical anomaly alerts:", error);
      return [];
    }
  }

  /**
   * Auto-resolve anomaly alerts based on time and conditions
   */
  async autoResolveAnomalyAlerts(): Promise<void> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      // Auto-resolve non-critical anomaly alerts older than 1 hour
      const { error } = await supabase
        .from("sos_alerts")
        .update({
          status: "resolved",
          updated_at: new Date().toISOString(),
        })
        .like("alert_type", "anomaly_%")
        .not("alert_type", "eq", "anomaly_silent_distress") // Don't auto-resolve critical alerts
        .lt("created_at", oneHourAgo)
        .eq("status", "active");

      if (error) throw error;

      console.log("Auto-resolved old anomaly alerts");
    } catch (error) {
      console.error("Error auto-resolving anomaly alerts:", error);
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
