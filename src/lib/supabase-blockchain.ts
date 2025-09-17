import { supabase } from "@/integrations/supabase/client";

export interface DigitalTouristID {
  id: string;
  tourist_name: string;
  aadhaar_number: string;
  passport_number?: string;
  trip_itinerary: string;
  emergency_contacts: EmergencyContact[];
  valid_from: Date;
  valid_to: Date;
  blockchain_hash: string;
  issued_at: Date;
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
  tourist_id: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  timestamp: Date;
  alert_type: "panic" | "medical" | "security" | "other";
  status: "active" | "responded" | "resolved";
  message?: string;
  blockchain_hash: string;
}

export interface GeoFence {
  id: string;
  name: string;
  type: "safe" | "restricted" | "danger";
  coordinates: Array<{ lat: number; lng: number }>;
  description: string;
}

// Database record types
interface DigitalIDRecord {
  id: string;
  tourist_name: string;
  aadhaar_number: string;
  passport_number?: string;
  trip_itinerary: string;
  emergency_contacts: unknown; // JSON from database
  valid_from: string;
  valid_to: string;
  blockchain_hash: string;
  issued_at: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SOSAlertRecord {
  id: string;
  tourist_id: string;
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: string;
  alert_type: string;
  status: string;
  message?: string;
  blockchain_hash: string;
}

interface GeoFenceRecord {
  id: string;
  name: string;
  type: string;
  coordinates: unknown;
  description: string;
}

interface LocationUpdateRecord {
  tourist_id: string;
  latitude: number;
  longitude: number;
}

export class SupabaseBlockchainService {
  private static instance: SupabaseBlockchainService;

  static getInstance(): SupabaseBlockchainService {
    if (!SupabaseBlockchainService.instance) {
      SupabaseBlockchainService.instance = new SupabaseBlockchainService();
    }
    return SupabaseBlockchainService.instance;
  }

  async generateDigitalID(
    touristData: Omit<
      DigitalTouristID,
      "id" | "blockchain_hash" | "issued_at" | "status"
    >
  ): Promise<DigitalTouristID> {
    try {
      const response = await supabase.functions.invoke(
        "blockchain-operations/create",
        {
          body: {
            tourist_name: touristData.tourist_name,
            aadhaar_number: touristData.aadhaar_number,
            passport_number: touristData.passport_number,
            trip_itinerary: touristData.trip_itinerary,
            emergency_contacts: touristData.emergency_contacts,
            valid_from: touristData.valid_from.toISOString(),
            valid_to: touristData.valid_to.toISOString(),
          },
        }
      );

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;
      return {
        ...data,
        valid_from: new Date(data.valid_from),
        valid_to: new Date(data.valid_to),
        issued_at: new Date(data.issued_at),
      };
    } catch (error) {
      console.error("Error generating digital ID:", error);
      throw error;
    }
  }

  async validateDigitalID(id: string): Promise<DigitalTouristID | null> {
    try {
      const response = await supabase.functions.invoke(
        `blockchain-operations/verify?id=${id}`,
        {
          method: "GET",
        }
      );

      if (response.error || !response.data?.valid) {
        return null;
      }

      const data = response.data.data;
      return {
        ...data,
        valid_from: new Date(data.valid_from),
        valid_to: new Date(data.valid_to),
        issued_at: new Date(data.issued_at),
      };
    } catch (error) {
      console.error("Error validating digital ID:", error);
      return null;
    }
  }

  async createSOSAlert(
    alert: Omit<SOSAlert, "id" | "blockchain_hash" | "timestamp" | "status">
  ): Promise<SOSAlert> {
    try {
      const response = await supabase.functions.invoke(
        "emergency-notifications/sos",
        {
          body: {
            tourist_id: alert.tourist_id,
            latitude: alert.location.latitude,
            longitude: alert.location.longitude,
            address: alert.location.address,
            alert_type: alert.alert_type,
            message: alert.message,
          },
        }
      );

      if (response.error) {
        throw new Error(response.error.message);
      }

      const sosAlert = response.data.alert;
      return {
        id: sosAlert.id,
        tourist_id: sosAlert.tourist_id,
        location: {
          latitude: sosAlert.latitude,
          longitude: sosAlert.longitude,
          address: sosAlert.address || "",
        },
        timestamp: new Date(sosAlert.timestamp),
        alert_type: sosAlert.alert_type,
        status: sosAlert.status,
        message: sosAlert.message,
        blockchain_hash: sosAlert.blockchain_hash,
      };
    } catch (error) {
      console.error("Error creating SOS alert:", error);
      throw error;
    }
  }

  async updateLocation(
    touristId: string,
    latitude: number,
    longitude: number
  ): Promise<void> {
    try {
      await supabase.functions.invoke(
        "emergency-notifications/update-location",
        {
          body: {
            tourist_id: touristId,
            latitude,
            longitude,
          },
        }
      );
    } catch (error) {
      console.error("Error updating location:", error);
      throw error;
    }
  }

  async getAllDigitalIDs(): Promise<DigitalTouristID[]> {
    try {
      const { data, error } = await supabase
        .from("digital_tourist_ids")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((item: DigitalIDRecord) => ({
        ...item,
        valid_from: new Date(item.valid_from),
        valid_to: new Date(item.valid_to),
        issued_at: new Date(item.issued_at),
        emergency_contacts: item.emergency_contacts as EmergencyContact[],
        status: item.status as "active" | "expired" | "revoked",
      }));
    } catch (error) {
      console.error("Error getting all digital IDs:", error);
      return [];
    }
  }

  async getAllSOSAlerts(): Promise<SOSAlert[]> {
    try {
      const { data, error } = await supabase
        .from("sos_alerts")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;

      return data.map((item: SOSAlertRecord) => ({
        id: item.id,
        tourist_id: item.tourist_id,
        location: {
          latitude: item.latitude,
          longitude: item.longitude,
          address: item.address || "",
        },
        timestamp: new Date(item.timestamp),
        alert_type: item.alert_type as
          | "panic"
          | "medical"
          | "security"
          | "other",
        status: item.status as "active" | "responded" | "resolved",
        message: item.message,
        blockchain_hash: item.blockchain_hash,
      }));
    } catch (error) {
      console.error("Error getting all SOS alerts:", error);
      return [];
    }
  }

  async getAllGeoFences(): Promise<GeoFence[]> {
    try {
      const { data, error } = await supabase
        .from("geo_fences")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((item: GeoFenceRecord) => ({
        id: item.id,
        name: item.name,
        type: item.type as "safe" | "restricted" | "danger",
        coordinates: item.coordinates as Array<{ lat: number; lng: number }>,
        description: item.description,
      }));
    } catch (error) {
      console.error("Error getting geo-fences:", error);
      return [];
    }
  }

  async updateSOSStatus(
    alertId: string,
    status: SOSAlert["status"]
  ): Promise<boolean> {
    try {
      if (status === "resolved") {
        await supabase.functions.invoke("emergency-notifications/resolve", {
          body: { alert_id: alertId },
        });
      } else {
        const { error } = await supabase
          .from("sos_alerts")
          .update({ status })
          .eq("id", alertId);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error("Error updating SOS status:", error);
      return false;
    }
  }

  // Realtime subscriptions
  subscribeToSOSAlerts(callback: (alert: SOSAlert) => void) {
    return supabase
      .channel("sos-alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sos_alerts",
        },
        (payload) => {
          const item = payload.new as SOSAlertRecord;
          callback({
            id: item.id,
            tourist_id: item.tourist_id,
            location: {
              latitude: item.latitude,
              longitude: item.longitude,
              address: item.address || "",
            },
            timestamp: new Date(item.timestamp),
            alert_type: item.alert_type as
              | "panic"
              | "medical"
              | "security"
              | "other",
            status: item.status as "active" | "responded" | "resolved",
            message: item.message,
            blockchain_hash: item.blockchain_hash,
          });
        }
      )
      .subscribe();
  }

  subscribeToLocationUpdates(
    callback: (update: {
      tourist_id: string;
      latitude: number;
      longitude: number;
    }) => void
  ) {
    return supabase
      .channel("location-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tourist_locations",
        },
        (payload) => {
          const item = payload.new as LocationUpdateRecord;
          callback({
            tourist_id: item.tourist_id,
            latitude: item.latitude,
            longitude: item.longitude,
          });
        }
      )
      .subscribe();
  }
}

// Mock Safety Score Calculation (enhanced with real data)
export const calculateSafetyScore = (touristId: string): number => {
  // In a real implementation, this would consider:
  // - Current location safety rating
  // - Recent SOS alerts in area
  // - Time of day
  // - Tourist's travel pattern
  const baseScore = 85;
  const randomVariation = Math.random() * 15 - 7.5;
  return Math.max(0, Math.min(100, baseScore + randomVariation));
};

// Enhanced Geo-fence Detection
export const checkGeoFenceStatus = (
  latitude: number,
  longitude: number,
  geoFences: GeoFence[]
): GeoFence | null => {
  for (const fence of geoFences) {
    // Simplified point-in-polygon check
    const isInside = fence.coordinates.some(
      (coord) =>
        Math.abs(latitude - coord.lat) < 0.005 &&
        Math.abs(longitude - coord.lng) < 0.005
    );
    if (isInside) return fence;
  }
  return null;
};
