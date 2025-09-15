// Import only types from sos components to avoid JSX compilation issues
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

import { supabase } from "../lib/supabase";

export interface SOSRequest {
  type: "panic" | "medical" | "security" | "general";
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  message?: string;
  touristId: string;
}

export interface SOSResponse {
  id: string;
  status: "active" | "assigned" | "resolved";
  timestamp: Date;
  estimatedResponseTime?: number; // in minutes
  assignedResponder?: string;
}

export interface NotificationAlertData {
  id: string;
  type: "panic" | "medical" | "security" | "general";
  latitude: number;
  longitude: number;
  address?: string;
  tourist_id: string;
  timestamp?: Date;
  message?: string;
}

export class SOSService {
  private static instance: SOSService;

  static getInstance(): SOSService {
    if (!SOSService.instance) {
      SOSService.instance = new SOSService();
    }
    return SOSService.instance;
  }

  async createSOSAlert(request: SOSRequest): Promise<SOSResponse> {
    try {
      // Validate input
      if (!request.touristId?.trim()) {
        throw new Error("Tourist ID is required");
      }

      if (!request.location?.latitude || !request.location?.longitude) {
        throw new Error("Valid location coordinates are required");
      }

      if (request.location.latitude < -90 || request.location.latitude > 90) {
        throw new Error("Invalid latitude: must be between -90 and 90");
      }

      if (
        request.location.longitude < -180 ||
        request.location.longitude > 180
      ) {
        throw new Error("Invalid longitude: must be between -180 and 180");
      }

      const alertData = {
        type: request.type,
        latitude: request.location.latitude,
        longitude: request.location.longitude,
        address: request.location.address || null,
        message: request.message || null,
        tourist_id: request.touristId,
        status: "active" as const,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("sos_alerts")
        .insert([alertData])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Send notifications to authorities
      await this.notifyAuthorities(data);

      // Send notifications to emergency contacts
      await this.notifyEmergencyContacts(request.touristId, data);

      return {
        id: data.id,
        status: data.status,
        timestamp: new Date(data.created_at),
        estimatedResponseTime: this.calculateResponseTime(request.location),
      };
    } catch (error) {
      throw new Error(
        `Failed to create SOS alert: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async cancelSOSAlert(alertId: string): Promise<void> {
    try {
      // Validate input
      if (!alertId?.trim()) {
        throw new Error("Alert ID is required");
      }

      const { error } = await supabase
        .from("sos_alerts")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Notify authorities of cancellation
      await this.notifyAlertCancellation(alertId);
    } catch (error) {
      throw new Error(
        `Failed to cancel SOS alert: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getSOSHistory(touristId: string): Promise<SOSAlert[]> {
    try {
      // Validate input
      if (!touristId?.trim()) {
        throw new Error("Tourist ID is required");
      }

      const { data, error } = await supabase
        .from("sos_alerts")
        .select("*")
        .eq("tourist_id", touristId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((alert) => ({
        id: alert.id,
        timestamp: new Date(alert.created_at),
        type: alert.type,
        status: alert.status,
        location: {
          latitude: alert.latitude,
          longitude: alert.longitude,
          address: alert.address,
        },
        touristId: alert.tourist_id,
        responseTime: alert.response_time,
        notes: alert.notes,
      }));
    } catch (error) {
      throw new Error(
        `Failed to get SOS history: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getActiveAlerts(): Promise<SOSAlert[]> {
    try {
      const { data, error } = await supabase
        .from("sos_alerts")
        .select(
          `
          *,
          user_profiles(name)
        `
        )
        .in("status", ["active", "assigned"])
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data.map((alert) => ({
        id: alert.id,
        timestamp: new Date(alert.created_at),
        type: alert.type,
        status: alert.status,
        location: {
          latitude: alert.latitude,
          longitude: alert.longitude,
          address: alert.address,
        },
        touristId: alert.tourist_id,
        responseTime: alert.response_time,
        notes: alert.notes,
      }));
    } catch (error) {
      throw new Error(
        `Failed to get active alerts: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async assignAlert(alertId: string, responderId: string): Promise<void> {
    try {
      // Validate input
      if (!alertId?.trim()) {
        throw new Error("Alert ID is required");
      }

      if (!responderId?.trim()) {
        throw new Error("Responder ID is required");
      }

      const { error } = await supabase
        .from("sos_alerts")
        .update({
          status: "assigned",
          assigned_responder: responderId.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", alertId.trim());

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(
        `Failed to assign alert: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async resolveAlert(alertId: string, notes?: string): Promise<void> {
    try {
      // Validate input
      if (!alertId?.trim()) {
        throw new Error("Alert ID is required");
      }

      const { error } = await supabase
        .from("sos_alerts")
        .update({
          status: "resolved",
          notes: notes?.trim() || null,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", alertId.trim());

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(
        `Failed to resolve alert: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getEmergencyContacts(touristId: string): Promise<EmergencyContact[]> {
    try {
      // Validate input
      if (!touristId?.trim()) {
        throw new Error("Tourist ID is required");
      }

      const { data, error } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("tourist_id", touristId.trim());

      if (error) {
        throw new Error(error.message);
      }

      return data.map((contact) => ({
        name: contact.name,
        number: contact.phone_number,
        type: contact.type,
      }));
    } catch (error) {
      // Return mock contacts if service fails
      console.error("Failed to get emergency contacts:", error);
      return this.getMockEmergencyContacts();
    }
  }

  private async notifyAuthorities(
    alertData: NotificationAlertData
  ): Promise<void> {
    try {
      // Send notification to authorities through Supabase Edge Function
      const { error } = await supabase.functions.invoke("notify-authorities", {
        body: {
          alertId: alertData.id,
          type: alertData.type,
          location: {
            latitude: alertData.latitude,
            longitude: alertData.longitude,
            address: alertData.address,
          },
          touristId: alertData.tourist_id,
        },
      });

      if (error) {
        console.error("Failed to notify authorities:", error);
      }
    } catch (error) {
      console.error("Failed to notify authorities:", error);
    }
  }

  private async notifyEmergencyContacts(
    touristId: string,
    alertData: NotificationAlertData
  ): Promise<void> {
    try {
      const contacts = await this.getEmergencyContacts(touristId);

      // Send notifications through Supabase Edge Function
      const { error } = await supabase.functions.invoke(
        "notify-emergency-contacts",
        {
          body: {
            contacts,
            alertData,
          },
        }
      );

      if (error) {
        console.error("Failed to notify emergency contacts:", error);
      }
    } catch (error) {
      console.error("Failed to notify emergency contacts:", error);
    }
  }

  private async notifyAlertCancellation(alertId: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke(
        "notify-alert-cancellation",
        {
          body: { alertId },
        }
      );

      if (error) {
        console.error("Failed to notify alert cancellation:", error);
      }
    } catch (error) {
      console.error("Failed to notify alert cancellation:", error);
    }
  }

  private calculateResponseTime(location: {
    latitude: number;
    longitude: number;
  }): number {
    // Mock calculation - in reality, this would consider:
    // - Nearest emergency services
    // - Traffic conditions
    // - Time of day
    // - Alert type priority
    return Math.floor(Math.random() * 15) + 5; // 5-20 minutes
  }

  private getMockEmergencyContacts(): EmergencyContact[] {
    return [
      {
        name: "Primary Contact",
        number: "+91-98765-43210",
        type: "primary",
      },
      {
        name: "Secondary Contact",
        number: "+91-87654-32109",
        type: "secondary",
      },
      {
        name: "Local Police",
        number: "100",
        type: "emergency",
      },
      {
        name: "Tourism Helpline",
        number: "1363",
        type: "emergency",
      },
    ];
  }

  // Mock methods for development
  async mockCreateSOS(request: SOSRequest): Promise<SOSResponse> {
    const mockResponse: SOSResponse = {
      id: `sos-${Date.now()}`,
      status: "active",
      timestamp: new Date(),
      estimatedResponseTime: this.calculateResponseTime(request.location),
    };

    // Simulate notification delay
    setTimeout(() => {
      console.log("Mock SOS alert created:", mockResponse);
    }, 1000);

    return mockResponse;
  }
}
