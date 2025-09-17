import { supabase } from "@/lib/supabase";
import { touristService } from "@/services/touristService";
import type { Database } from "@/integrations/supabase/types";

type SOSAlert = Database["public"]["Tables"]["sos_alerts"]["Row"];
type DigitalTouristID =
  Database["public"]["Tables"]["digital_tourist_ids"]["Row"];

export interface NotificationRecipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: "authority" | "emergency_contact" | "police" | "tourist_family";
  priority: "low" | "medium" | "high" | "critical";
}

export interface NotificationMessage {
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  location?: { lat: number; lng: number };
  touristInfo?: {
    id: string;
    name: string;
    emergencyContact?: string;
  };
  recommendations?: string[];
  timestamp: string;
}

export class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Send notifications for anomaly detection
   */
  async sendAnomalyNotification(
    anomalyType: string,
    severityLevel: "low" | "medium" | "high" | "critical",
    touristId: string,
    location: { lat: number; lng: number },
    details: Record<string, unknown>,
    recommendations: string[]
  ): Promise<void> {
    try {
      // Get tourist information
      const tourist = await touristService.getDigitalTouristID(touristId);
      if (!tourist) {
        console.error(`Tourist not found: ${touristId}`);
        return;
      }

      // Get relevant recipients based on severity
      const recipients = await this.getNotificationRecipients(
        severityLevel,
        location
      );

      // Create notification message
      const message: NotificationMessage = {
        title: `AI Anomaly Alert: ${anomalyType
          .replace("_", " ")
          .toUpperCase()}`,
        message: this.buildAnomalyMessage(
          anomalyType,
          severityLevel,
          tourist,
          location,
          details
        ),
        severity: severityLevel,
        location,
        touristInfo: {
          id: touristId,
          name: tourist.tourist_name,
          emergencyContact: tourist.emergency_contacts as string,
        },
        recommendations,
        timestamp: new Date().toISOString(),
      };

      // Send notifications to all recipients
      await this.sendToRecipients(recipients, message);

      // Log notification for tracking
      await this.logNotification(message, recipients);
    } catch (error) {
      console.error("Error sending anomaly notification:", error);
    }
  }

  /**
   * Send notifications for critical emergencies
   */
  async sendEmergencyNotification(
    touristId: string,
    location: { lat: number; lng: number },
    emergencyType: string,
    details: Record<string, unknown>
  ): Promise<void> {
    try {
      const tourist = await touristService.getDigitalTouristID(touristId);
      if (!tourist) return;

      // Get all emergency recipients (police, emergency services, etc.)
      const recipients = await this.getEmergencyRecipients(location);

      const message: NotificationMessage = {
        title: `CRITICAL EMERGENCY: ${tourist.tourist_name}`,
        message: `Emergency situation detected: ${emergencyType}. Immediate response required.`,
        severity: "critical",
        location,
        touristInfo: {
          id: touristId,
          name: tourist.tourist_name,
          emergencyContact: tourist.emergency_contacts as string,
        },
        recommendations: [
          "Dispatch emergency response team immediately",
          "Contact tourist's emergency contact",
          "Monitor location and provide updates",
          "Coordinate with local authorities",
        ],
        timestamp: new Date().toISOString(),
      };

      await this.sendToRecipients(recipients, message);
      await this.logNotification(message, recipients);
    } catch (error) {
      console.error("Error sending emergency notification:", error);
    }
  }

  /**
   * Get notification recipients based on severity and location
   */
  private async getNotificationRecipients(
    severity: "low" | "medium" | "high" | "critical",
    location: { lat: number; lng: number }
  ): Promise<NotificationRecipient[]> {
    const recipients: NotificationRecipient[] = [];

    try {
      // Get police stations within range
      const policeStations = await this.getNearbyPoliceStations(location);

      // Get emergency contacts for the tourist
      // Note: This would need to be implemented based on your tourist data structure

      // Add police stations as recipients
      policeStations.forEach((station) => {
        recipients.push({
          id: station.id,
          name: station.name,
          type: "police",
          priority: severity,
        });
      });

      // For high/critical severity, add additional emergency services
      if (severity === "high" || severity === "critical") {
        recipients.push({
          id: "emergency_services",
          name: "Emergency Services",
          type: "authority",
          priority: severity,
        });
      }
    } catch (error) {
      console.error("Error getting notification recipients:", error);
    }

    return recipients;
  }

  /**
   * Get emergency recipients for critical situations
   */
  private async getEmergencyRecipients(location: {
    lat: number;
    lng: number;
  }): Promise<NotificationRecipient[]> {
    const recipients: NotificationRecipient[] = [];

    try {
      // Get all nearby police stations
      const policeStations = await this.getNearbyPoliceStations(location);

      policeStations.forEach((station) => {
        recipients.push({
          id: station.id,
          name: station.name,
          type: "police",
          priority: "critical",
        });
      });

      // Add emergency services
      recipients.push({
        id: "emergency_services",
        name: "Emergency Response Team",
        type: "authority",
        priority: "critical",
      });

      // Add hospital/medical services if available
      recipients.push({
        id: "medical_services",
        name: "Medical Emergency Services",
        type: "authority",
        priority: "critical",
      });
    } catch (error) {
      console.error("Error getting emergency recipients:", error);
    }

    return recipients;
  }

  /**
   * Get nearby police stations (mock implementation)
   */
  private async getNearbyPoliceStations(location: {
    lat: number;
    lng: number;
  }): Promise<Array<{ id: string; name: string }>> {
    // This would integrate with a police station database or API
    // For now, return mock data
    return [
      { id: "police_station_1", name: "Central Police Station" },
      { id: "police_station_2", name: "Tourist Police Unit" },
    ];
  }

  /**
   * Build anomaly notification message
   */
  private buildAnomalyMessage(
    anomalyType: string,
    severity: string,
    tourist: DigitalTouristID,
    location: { lat: number; lng: number },
    details: Record<string, unknown>
  ): string {
    const anomalyDescriptions: Record<string, string> = {
      sudden_drop_off:
        "Sudden location change detected - possible transportation issue",
      prolonged_inactivity: "Tourist has been inactive for an extended period",
      route_deviation: "Tourist has deviated significantly from planned route",
      silent_distress: "Pattern indicates potential distress situation",
      risk_zone_entry: "Tourist has entered a high-risk area",
    };

    return `
AI Anomaly Detection Alert

Tourist: ${tourist.tourist_name}
Anomaly Type: ${anomalyType.replace("_", " ")}
Severity: ${severity.toUpperCase()}
Location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}
Time: ${new Date().toLocaleString()}

Description: ${anomalyDescriptions[anomalyType] || "Anomaly detected"}

Please assess the situation and take appropriate action.
    `.trim();
  }

  /**
   * Send notifications to recipients (mock implementation)
   */
  private async sendToRecipients(
    recipients: NotificationRecipient[],
    message: NotificationMessage
  ): Promise<void> {
    // This would integrate with actual notification services:
    // - SMS services (Twilio, etc.)
    // - Email services (SendGrid, etc.)
    // - Push notifications
    // - Police communication systems

    for (const recipient of recipients) {
      try {
        console.log(
          `Sending ${message.severity} notification to ${recipient.name}:`,
          message.title
        );

        // Mock notification sending
        await this.mockSendNotification(recipient, message);
      } catch (error) {
        console.error(
          `Failed to send notification to ${recipient.name}:`,
          error
        );
      }
    }
  }

  /**
   * Mock notification sending (replace with actual implementation)
   */
  private async mockSendNotification(
    recipient: NotificationRecipient,
    message: NotificationMessage
  ): Promise<void> {
    // Simulate notification delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log(
      `✅ Notification sent to ${recipient.name} (${recipient.type})`
    );
    console.log(`   Title: ${message.title}`);
    console.log(`   Severity: ${message.severity}`);
    console.log(`   Message: ${message.message.substring(0, 100)}...`);
  }

  /**
   * Log notification for tracking and audit
   */
  private async logNotification(
    message: NotificationMessage,
    recipients: NotificationRecipient[]
  ): Promise<void> {
    try {
      // Store notification log in database
      // This could be a separate notifications table or integrated with existing logging
      console.log(
        `📝 Notification logged: ${message.title} sent to ${recipients.length} recipients`
      );
    } catch (error) {
      console.error("Error logging notification:", error);
    }
  }

  /**
   * Send bulk notifications for system-wide alerts
   */
  async sendBulkNotification(
    title: string,
    message: string,
    severity: "low" | "medium" | "high" | "critical",
    targetGroups: ("police" | "authorities" | "emergency_contacts")[]
  ): Promise<void> {
    try {
      // Get all recipients for the specified groups
      const recipients = await this.getBulkRecipients(targetGroups);

      const notificationMessage: NotificationMessage = {
        title,
        message,
        severity,
        timestamp: new Date().toISOString(),
      };

      await this.sendToRecipients(recipients, notificationMessage);
      await this.logNotification(notificationMessage, recipients);
    } catch (error) {
      console.error("Error sending bulk notification:", error);
    }
  }

  /**
   * Get bulk recipients for system-wide notifications
   */
  private async getBulkRecipients(
    targetGroups: ("police" | "authorities" | "emergency_contacts")[]
  ): Promise<NotificationRecipient[]> {
    const recipients: NotificationRecipient[] = [];

    // Add recipients based on target groups
    if (targetGroups.includes("police")) {
      recipients.push({
        id: "all_police",
        name: "All Police Stations",
        type: "police",
        priority: "high",
      });
    }

    if (targetGroups.includes("authorities")) {
      recipients.push({
        id: "tourism_authority",
        name: "Tourism Authority",
        type: "authority",
        priority: "high",
      });
    }

    return recipients;
  }
}

export const notificationService = NotificationService.getInstance();
