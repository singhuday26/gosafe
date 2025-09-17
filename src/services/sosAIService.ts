import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// AI Risk Assessment Types
export interface TouristRiskProfile {
  touristId: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  riskScore: number; // 0-100
  lastUpdated: Date;
  factors: RiskFactor[];
}

export interface RiskFactor {
  type: "frequency" | "location" | "time_pattern" | "network" | "battery";
  score: number; // 0-100
  description: string;
  weight: number; // multiplier for final score
}

export interface SOSAnalytics {
  totalAlerts: number;
  alertsLast24h: number;
  alertsLast7d: number;
  commonTimePatterns: string[];
  riskLocations: LocationRisk[];
  averageResponseTime: number;
}

export interface DeviceContext {
  batteryLevel: number;
  networkStrength: number;
  deviceInfo: Record<string, unknown>;
}

export interface LocationRisk {
  latitude: number;
  longitude: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  description: string;
  source: "user_reports" | "google_reviews" | "government_data";
  lastUpdated: Date;
}

export interface EnhancedSOSRequest {
  // Basic SOS data
  touristId: string;
  type: "panic" | "medical" | "security" | "general";
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  message?: string;

  // Enhanced context data
  batteryLevel: number;
  networkStrength: number; // 0-100
  timestamp: Date;
  deviceInfo: {
    userAgent: string;
    isOnline: boolean;
    connectionType?: string;
  };

  // AI computed fields
  riskScore: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  suggestedEscalation:
    | "local_police"
    | "ranger"
    | "medical"
    | "fire_department";
}

class SOSAIService {
  private riskNegativeKeywords = [
    "unsafe",
    "robbery",
    "bad lighting",
    "isolated",
    "unsafe at night",
    "dangerous",
    "avoid",
    "crime",
    "theft",
    "mugging",
    "scam",
    "dark",
    "empty",
    "sketchy",
    "rough area",
    "not safe",
  ];

  // AI Risk Analysis - Rule-based system (easily replaceable with ML)
  async analyzeRiskProfile(touristId: string): Promise<TouristRiskProfile> {
    try {
      const analytics = await this.getSOSAnalytics(touristId);
      const factors: RiskFactor[] = [];

      // Frequency analysis
      if (analytics.alertsLast24h >= 3) {
        factors.push({
          type: "frequency",
          score: 85,
          description: "Multiple alerts in 24h (high stress indicator)",
          weight: 1.5,
        });
      } else if (analytics.alertsLast7d >= 5) {
        factors.push({
          type: "frequency",
          score: 65,
          description: "Frequent alerts this week",
          weight: 1.2,
        });
      }

      // Time pattern analysis
      const nightAlerts = analytics.commonTimePatterns.filter(
        (time) => time.includes("night") || time.includes("late")
      ).length;

      if (nightAlerts > 2) {
        factors.push({
          type: "time_pattern",
          score: 70,
          description: "Multiple night-time alerts",
          weight: 1.3,
        });
      }

      // Calculate composite risk score
      const baseScore = Math.min(analytics.totalAlerts * 5, 40); // Base risk from alert count
      const factorScore =
        factors.reduce((sum, factor) => sum + factor.score * factor.weight, 0) /
          factors.length || 0;

      const finalScore = Math.min(baseScore + factorScore, 100);

      let riskLevel: TouristRiskProfile["riskLevel"] = "LOW";
      if (finalScore >= 80) riskLevel = "CRITICAL";
      else if (finalScore >= 60) riskLevel = "HIGH";
      else if (finalScore >= 35) riskLevel = "MEDIUM";

      return {
        touristId,
        riskLevel,
        riskScore: Math.round(finalScore),
        lastUpdated: new Date(),
        factors,
      };
    } catch (error) {
      console.error("Risk analysis failed:", error);
      return {
        touristId,
        riskLevel: "LOW",
        riskScore: 0,
        lastUpdated: new Date(),
        factors: [],
      };
    }
  }

  // Get SOS analytics for a tourist
  async getSOSAnalytics(touristId: string): Promise<SOSAnalytics> {
    try {
      const { data: alerts, error } = await supabase
        .from("sos_alerts")
        .select("*")
        .eq("tourist_id", touristId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const alertsLast24h =
        alerts?.filter((alert) => new Date(alert.created_at) >= last24h)
          .length || 0;

      const alertsLast7d =
        alerts?.filter((alert) => new Date(alert.created_at) >= last7d)
          .length || 0;

      // Analyze time patterns
      const timePatterns =
        alerts?.map((alert) => {
          const hour = new Date(alert.created_at).getHours();
          if (hour >= 22 || hour <= 5) return "night";
          if (hour >= 6 && hour <= 11) return "morning";
          if (hour >= 12 && hour <= 17) return "afternoon";
          return "evening";
        }) || [];

      const commonTimePatterns = [...new Set(timePatterns)];

      return {
        totalAlerts: alerts?.length || 0,
        alertsLast24h,
        alertsLast7d,
        commonTimePatterns,
        riskLocations: [], // Will be populated by location analysis
        averageResponseTime: 0, // Can be calculated from response data
      };
    } catch (error) {
      console.error("Failed to get SOS analytics:", error);
      return {
        totalAlerts: 0,
        alertsLast24h: 0,
        alertsLast7d: 0,
        commonTimePatterns: [],
        riskLocations: [],
        averageResponseTime: 0,
      };
    }
  }

  // Enhanced SOS creation with AI context
  async createEnhancedSOS(
    request: Omit<
      EnhancedSOSRequest,
      "riskScore" | "priority" | "suggestedEscalation"
    >
  ): Promise<{
    success: boolean;
    sosId?: string;
    riskProfile?: TouristRiskProfile;
    error?: string;
  }> {
    try {
      // 1. Analyze risk profile
      const riskProfile = await this.analyzeRiskProfile(request.touristId);

      // 2. Determine priority based on multiple factors
      let priority: EnhancedSOSRequest["priority"] = "MEDIUM";
      let riskScore = riskProfile.riskScore;

      // Boost priority for low battery
      if (request.batteryLevel < 20) riskScore += 15;

      // Boost priority for poor network
      if (request.networkStrength < 30) riskScore += 10;

      // Boost priority for repeat alerts
      if (
        riskProfile.factors.some((f) => f.type === "frequency" && f.score > 80)
      ) {
        riskScore += 20;
      }

      // Determine final priority
      if (riskScore >= 85) priority = "CRITICAL";
      else if (riskScore >= 65) priority = "HIGH";
      else if (riskScore >= 35) priority = "MEDIUM";
      else priority = "LOW";

      // 3. Suggest escalation type
      let suggestedEscalation: EnhancedSOSRequest["suggestedEscalation"] =
        "local_police";

      if (request.type === "medical") suggestedEscalation = "medical";
      else if (priority === "CRITICAL") suggestedEscalation = "local_police";
      else suggestedEscalation = "ranger"; // Default for tourist areas

      // 4. Create SOS record in database
      const sosData = {
        tourist_id: request.touristId,
        alert_type: request.type,
        status: "active",
        latitude: request.location.latitude,
        longitude: request.location.longitude,
        message: request.message || "",
        battery_level: request.batteryLevel,
        network_strength: request.networkStrength,
        risk_score: Math.round(riskScore),
        priority,
        suggested_escalation: suggestedEscalation,
        device_info: JSON.stringify(request.deviceInfo),
        blockchain_hash: `sos_${request.touristId}_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      };

      const { data: sosRecord, error } = await supabase
        .from("sos_alerts")
        .insert([sosData])
        .select()
        .single();

      if (error) throw error;

      // 5. Store risk profile update
      await this.updateRiskProfile(riskProfile);

      // 6. Trigger notifications based on priority
      await this.triggerAlertNotifications(sosRecord, priority, riskProfile);

      return {
        success: true,
        sosId: sosRecord.id,
        riskProfile,
      };
    } catch (error) {
      console.error("Enhanced SOS creation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Check if location is flagged as risky (Google Maps integration)
  async checkLocationRisk(
    latitude: number,
    longitude: number
  ): Promise<{
    isRisky: boolean;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    warnings: string[];
    source: string;
  }> {
    try {
      // For demo purposes, we'll simulate the Google Maps API call
      // In production, this would call Google Places API with reviews

      // Simulate API call to Google Places
      const mockGoogleResponse = await this.simulateGooglePlacesReview(
        latitude,
        longitude
      );

      const warnings: string[] = [];
      let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
      let isRisky = false;

      // Analyze reviews for negative keywords
      if (mockGoogleResponse.reviews) {
        for (const review of mockGoogleResponse.reviews) {
          const reviewText = review.text.toLowerCase();
          const foundKeywords = this.riskNegativeKeywords.filter((keyword) =>
            reviewText.includes(keyword)
          );

          if (foundKeywords.length > 0) {
            warnings.push(`Reviews mention: ${foundKeywords.join(", ")}`);
            isRisky = true;

            if (foundKeywords.length >= 3) riskLevel = "HIGH";
            else if (foundKeywords.length >= 2) riskLevel = "MEDIUM";
          }
        }
      }

      // Check against our database of known risky locations
      // For now, we'll simulate this check since the table might not exist
      let knownRisks: Record<string, unknown>[] = [];
      try {
        const { data } = await supabase
          .from("sos_alerts")
          .select("*")
          .gte("latitude", latitude - 0.01)
          .lte("latitude", latitude + 0.01)
          .gte("longitude", longitude - 0.01)
          .lte("longitude", longitude + 0.01)
          .eq("alert_type", "security");

        knownRisks = data || [];
      } catch (error) {
        console.warn("Unable to check known risks:", error);
      }

      if (knownRisks && knownRisks.length > 0) {
        isRisky = true;
        riskLevel = "HIGH";
        warnings.push("Area flagged in our safety database");
      }

      return {
        isRisky,
        riskLevel,
        warnings,
        source: "google_reviews_and_database",
      };
    } catch (error) {
      console.error("Location risk check failed:", error);
      return {
        isRisky: false,
        riskLevel: "LOW",
        warnings: [],
        source: "error",
      };
    }
  }

  // Simulate Google Places API call (replace with real API in production)
  private async simulateGooglePlacesReview(lat: number, lng: number) {
    // Mock data that simulates Google Places API response
    const mockReviews = [
      {
        text: "Nice place but can be unsafe at night, bad lighting in some areas",
        rating: 3,
      },
      {
        text: "Beautiful location, very safe during the day",
        rating: 5,
      },
      {
        text: "Avoid this area after dark, heard about some robbery incidents",
        rating: 2,
      },
    ];

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      reviews: mockReviews.slice(0, 2), // Return first 2 reviews
    };
  }

  // Update risk profile in database (store in sos_alerts table for now)
  private async updateRiskProfile(profile: TouristRiskProfile) {
    try {
      // For demo purposes, we'll store risk profile in a simple format
      // In production, you'd create a dedicated table
      console.log("Risk Profile Updated:", {
        touristId: profile.touristId,
        riskLevel: profile.riskLevel,
        riskScore: profile.riskScore,
        factorsCount: profile.factors.length,
      });
    } catch (error) {
      console.error("Failed to update risk profile:", error);
    }
  }

  // Trigger notifications based on priority
  private async triggerAlertNotifications(
    sosRecord: Record<string, unknown>,
    priority: string,
    riskProfile: TouristRiskProfile
  ) {
    try {
      // High priority alerts get immediate escalation
      if (priority === "CRITICAL") {
        await this.sendHighPriorityAlert(sosRecord);
      }

      // For demo, we'll log notifications instead of creating new tables
      console.log("🔔 SOS Notification:", {
        touristId: sosRecord.tourist_id,
        priority,
        riskLevel: riskProfile.riskLevel,
        location: `${sosRecord.latitude}, ${sosRecord.longitude}`,
        time: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to trigger notifications:", error);
    }
  }

  // Send high priority alert (can be extended with real SMS/email services)
  private async sendHighPriorityAlert(sosRecord: Record<string, unknown>) {
    console.log("🚨 HIGH PRIORITY ALERT:", {
      sosId: sosRecord.id,
      location: `${sosRecord.latitude}, ${sosRecord.longitude}`,
      time: new Date().toISOString(),
    });

    // In production, integrate with:
    // - Twilio for SMS
    // - SendGrid for email
    // - WebSocket for real-time dashboard updates
    // - Push notifications
  }

  // Get device context (battery, network, etc.)
  getDeviceContext(): {
    batteryLevel: number;
    networkStrength: number;
    deviceInfo: EnhancedSOSRequest["deviceInfo"];
  } {
    // Note: Some of these APIs may not be available in all browsers
    const nav = navigator as unknown as Record<string, unknown>;
    const networkInfo =
      nav.connection || nav.mozConnection || nav.webkitConnection;

    return {
      batteryLevel: 75, // Simulated - real implementation would use Battery API
      networkStrength: networkInfo
        ? Math.round(
            (((networkInfo as Record<string, number>).downlink || 5) / 10) * 100
          )
        : 80,
      deviceInfo: {
        userAgent: navigator.userAgent,
        isOnline: navigator.onLine,
        connectionType:
          (networkInfo as Record<string, string>)?.effectiveType || "unknown",
      },
    };
  }
}

export const sosAIService = new SOSAIService();
