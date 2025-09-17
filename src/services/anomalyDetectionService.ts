import { supabase } from "@/lib/supabase";
import { touristService } from "@/services/touristService";
import { notificationService } from "@/services/notificationService";
import type { Database } from "@/integrations/supabase/types";

export type LocationData =
  Database["public"]["Tables"]["tourist_locations"]["Row"] & {
    battery_level?: number | null;
    network_type?: string | null;
    speed_kmh?: number | null;
  };
export type RouteData = {
  id: string;
  tourist_id: string;
  planned_waypoints: Array<{ lat: number; lng: number; name: string }>;
  status: string;
  created_at: string;
  updated_at: string;
};
export type AnomalyData = {
  id: string;
  tourist_id: string;
  anomaly_type: string;
  severity_score: number;
  severity_level: string;
  location_lat: number;
  location_lng: number;
  details: Record<string, unknown>;
  status: string;
  created_at: string;
  resolved_at?: string;
};

export interface AnomalyDetectionResult {
  detected: boolean;
  anomalyType:
    | "sudden_drop_off"
    | "prolonged_inactivity"
    | "route_deviation"
    | "silent_distress"
    | "risk_zone_entry";
  severityScore: number;
  severityLevel: "low" | "medium" | "high" | "critical";
  details: Record<string, unknown>;
  recommendations: string[];
}

export interface RiskFactors {
  distanceKm: number;
  timeGapMinutes: number;
  speedKmh: number;
  batteryLevel: number;
  networkType: string;
  riskZoneProximity: number;
  routeDeviationMeters: number;
  inactivityMinutes: number;
}

class AnomalyDetectionService {
  private static instance: AnomalyDetectionService;

  static getInstance(): AnomalyDetectionService {
    if (!AnomalyDetectionService.instance) {
      AnomalyDetectionService.instance = new AnomalyDetectionService();
    }
    return AnomalyDetectionService.instance;
  }

  /**
   * Main entry point for anomaly detection - called on every location update
   */
  async detectAnomalies(
    touristId: string,
    currentLocation: LocationData
  ): Promise<AnomalyDetectionResult[]> {
    const anomalies: AnomalyDetectionResult[] = [];

    try {
      // Get previous location for comparison
      const previousLocation = await this.getPreviousLocation(touristId);
      const userRoute = await this.getActiveRoute(touristId);
      const riskZones = await this.getNearbyRiskZones(
        currentLocation.latitude,
        currentLocation.longitude
      );

      // Check for sudden drop-off
      const dropOffResult = await this.detectSuddenDropOff(
        touristId,
        currentLocation,
        previousLocation
      );
      if (dropOffResult.detected) {
        anomalies.push(dropOffResult);
      }

      // Check for prolonged inactivity
      const inactivityResult = await this.detectProlongedInactivity(
        touristId,
        currentLocation
      );
      if (inactivityResult.detected) {
        anomalies.push(inactivityResult);
      }

      // Check for route deviation
      if (userRoute) {
        const deviationResult = await this.detectRouteDeviation(
          touristId,
          currentLocation,
          userRoute
        );
        if (deviationResult.detected) {
          anomalies.push(deviationResult);
        }
      }

      // Check for silent distress
      const distressResult = await this.detectSilentDistress(
        touristId,
        currentLocation,
        riskZones
      );
      if (distressResult.detected) {
        anomalies.push(distressResult);
      }

      // Check for risk zone entry
      if (riskZones.length > 0) {
        const riskZoneResult = await this.detectRiskZoneEntry(
          touristId,
          currentLocation,
          riskZones
        );
        if (riskZoneResult.detected) {
          anomalies.push(riskZoneResult);
        }
      }

      // Store detected anomalies
      for (const anomaly of anomalies) {
        await this.storeAnomaly(touristId, anomaly, currentLocation);
      }
    } catch (error) {
      console.error("Error in anomaly detection:", error);
    }

    return anomalies;
  }

  /**
   * Calculate comprehensive anomaly score based on multiple risk factors
   */
  calculateAnomalyScore(riskFactors: RiskFactors): number {
    let score = 0;

    // Distance factor (0-30 points)
    if (riskFactors.distanceKm > 50) score += 30;
    else if (riskFactors.distanceKm > 20) score += 20;
    else if (riskFactors.distanceKm > 10) score += 10;
    else if (riskFactors.distanceKm > 5) score += 5;

    // Time gap factor (0-25 points)
    if (riskFactors.timeGapMinutes > 60) score += 25;
    else if (riskFactors.timeGapMinutes > 30) score += 15;
    else if (riskFactors.timeGapMinutes > 15) score += 8;
    else if (riskFactors.timeGapMinutes > 5) score += 3;

    // Speed factor (0-15 points) - unusually high speeds
    if (riskFactors.speedKmh > 150) score += 15;
    else if (riskFactors.speedKmh > 100) score += 10;
    else if (riskFactors.speedKmh > 80) score += 5;

    // Battery level factor (0-10 points) - low battery in risky situations
    if (riskFactors.batteryLevel < 20) score += 10;
    else if (riskFactors.batteryLevel < 30) score += 5;

    // Network factor (0-10 points) - poor connectivity
    if (riskFactors.networkType === "none" || riskFactors.networkType === "2g")
      score += 10;
    else if (riskFactors.networkType === "3g") score += 5;

    // Risk zone proximity (0-20 points)
    if (riskFactors.riskZoneProximity < 100) score += 20;
    else if (riskFactors.riskZoneProximity < 500) score += 15;
    else if (riskFactors.riskZoneProximity < 1000) score += 10;
    else if (riskFactors.riskZoneProximity < 2000) score += 5;

    // Route deviation (0-15 points)
    if (riskFactors.routeDeviationMeters > 5000) score += 15;
    else if (riskFactors.routeDeviationMeters > 2000) score += 10;
    else if (riskFactors.routeDeviationMeters > 1000) score += 5;

    // Inactivity factor (0-20 points)
    if (riskFactors.inactivityMinutes > 120) score += 20;
    else if (riskFactors.inactivityMinutes > 60) score += 15;
    else if (riskFactors.inactivityMinutes > 30) score += 10;
    else if (riskFactors.inactivityMinutes > 15) score += 5;

    // Cap at 100
    return Math.min(100, score);
  }

  /**
   * Determine severity level based on score
   */
  private getSeverityLevel(
    score: number
  ): "low" | "medium" | "high" | "critical" {
    if (score >= 80) return "critical";
    if (score >= 60) return "high";
    if (score >= 40) return "medium";
    return "low";
  }

  /**
   * Detect sudden location drop-off
   */
  private async detectSuddenDropOff(
    touristId: string,
    currentLocation: LocationData,
    previousLocation: LocationData | null
  ): Promise<AnomalyDetectionResult> {
    if (!previousLocation) {
      return {
        detected: false,
        anomalyType: "sudden_drop_off",
        severityScore: 0,
        severityLevel: "low",
        details: {},
        recommendations: [],
      };
    }

    const distance = this.calculateDistance(
      previousLocation.latitude,
      previousLocation.longitude,
      currentLocation.latitude,
      currentLocation.longitude
    );

    const timeGap =
      (new Date(currentLocation.timestamp).getTime() -
        new Date(previousLocation.timestamp).getTime()) /
      (1000 * 60); // minutes

    // Calculate speed (km/h)
    const speedKmh = timeGap > 0 ? (distance / timeGap) * 60 : 0;

    const riskFactors: RiskFactors = {
      distanceKm: distance,
      timeGapMinutes: timeGap,
      speedKmh,
      batteryLevel: 100, // Default since not available in current schema
      networkType: "unknown", // Default since not available in current schema
      riskZoneProximity: 10000, // Will be calculated if needed
      routeDeviationMeters: 0,
      inactivityMinutes: timeGap,
    };

    const severityScore = this.calculateAnomalyScore(riskFactors);

    // Threshold: >50km in <30 minutes or >30km in <10 minutes
    const detected =
      (distance > 50 && timeGap < 30) ||
      (distance > 30 && timeGap < 10) ||
      speedKmh > 200;

    return {
      detected,
      anomalyType: "sudden_drop_off",
      severityScore,
      severityLevel: this.getSeverityLevel(severityScore),
      details: {
        distanceKm: distance,
        timeGapMinutes: timeGap,
        speedKmh,
        previousLocation: {
          lat: previousLocation.latitude,
          lng: previousLocation.longitude,
        },
        currentLocation: {
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
        },
      },
      recommendations: [
        "Verify tourist safety and location accuracy",
        "Contact tourist if possible",
        "Check for transportation mode changes",
        "Monitor for additional anomalies",
      ],
    };
  }

  /**
   * Detect prolonged inactivity
   */
  private async detectProlongedInactivity(
    touristId: string,
    currentLocation: LocationData
  ): Promise<AnomalyDetectionResult> {
    // Get last activity timestamp
    const { data: lastActivity } = await supabase
      .from("tourist_locations")
      .select("timestamp")
      .eq("tourist_id", touristId)
      .neq("id", currentLocation.id)
      .order("timestamp", { ascending: false })
      .limit(1)
      .single();

    if (!lastActivity) {
      return {
        detected: false,
        anomalyType: "prolonged_inactivity",
        severityScore: 0,
        severityLevel: "low",
        details: {},
        recommendations: [],
      };
    }

    const inactivityMinutes =
      (new Date(currentLocation.timestamp).getTime() -
        new Date(lastActivity.timestamp).getTime()) /
      (1000 * 60);

    const riskFactors: RiskFactors = {
      distanceKm: 0,
      timeGapMinutes: inactivityMinutes,
      speedKmh: 0,
      batteryLevel: 100, // Default since not available in current schema
      networkType: "unknown", // Default since not available in current schema
      riskZoneProximity: 10000,
      routeDeviationMeters: 0,
      inactivityMinutes,
    };

    const severityScore = this.calculateAnomalyScore(riskFactors);

    // Threshold: >30 minutes of inactivity
    const detected = inactivityMinutes > 30;

    return {
      detected,
      anomalyType: "prolonged_inactivity",
      severityScore,
      severityLevel: this.getSeverityLevel(severityScore),
      details: {
        inactivityMinutes,
        lastActivity: lastActivity.timestamp,
        currentTime: currentLocation.timestamp,
        batteryLevel: 100, // Default since not available in current schema
      },
      recommendations: [
        "Attempt to contact tourist",
        "Check emergency contacts",
        "Monitor battery level and network connectivity",
        "Consider sending wellness check",
      ],
    };
  }

  /**
   * Detect route deviation
   */
  private async detectRouteDeviation(
    touristId: string,
    currentLocation: LocationData,
    route: RouteData
  ): Promise<AnomalyDetectionResult> {
    const waypoints = route.planned_waypoints as Array<{
      lat: number;
      lng: number;
      name: string;
    }>;

    let minDistance = Infinity;
    let nearestWaypoint = null;

    // Find nearest waypoint
    for (const waypoint of waypoints) {
      const distance = this.calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        waypoint.lat,
        waypoint.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestWaypoint = waypoint;
      }
    }

    const riskFactors: RiskFactors = {
      distanceKm: 0,
      timeGapMinutes: 0,
      speedKmh: 0,
      batteryLevel: 100, // Default since not available in current schema
      networkType: "unknown", // Default since not available in current schema
      riskZoneProximity: 10000,
      routeDeviationMeters: minDistance * 1000, // Convert to meters
      inactivityMinutes: 0,
    };

    const severityScore = this.calculateAnomalyScore(riskFactors);

    // Threshold: >2km deviation from planned route
    const detected = minDistance > 2;

    return {
      detected,
      anomalyType: "route_deviation",
      severityScore,
      severityLevel: this.getSeverityLevel(severityScore),
      details: {
        deviationMeters: minDistance * 1000,
        nearestWaypoint,
        plannedWaypoints: waypoints,
        currentLocation: {
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
        },
      },
      recommendations: [
        "Verify if route change was intentional",
        "Check for transportation issues",
        "Update route if necessary",
        "Monitor for safety concerns in new area",
      ],
    };
  }

  /**
   * Detect silent distress patterns
   */
  private async detectSilentDistress(
    touristId: string,
    currentLocation: LocationData,
    riskZones: Array<{
      id: string;
      name: string;
      latitude?: number;
      longitude?: number;
      center_lat?: number;
      center_lng?: number;
      risk_level?: string;
      type?: string;
      description?: string;
      risk_factors?: string;
    }>
  ): Promise<AnomalyDetectionResult> {
    // Check for combination of factors indicating distress
    const inactivityCheck = await this.detectProlongedInactivity(
      touristId,
      currentLocation
    );
    const riskZoneProximity =
      riskZones.length > 0
        ? Math.min(
            ...riskZones.map((zone) =>
              this.calculateDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                zone.latitude || zone.center_lat || 0,
                zone.longitude || zone.center_lng || 0
              )
            )
          )
        : 10000;

    const distressFactors = {
      inactivity: inactivityCheck.detected,
      lowBattery: false, // Not available in current schema
      poorNetwork: false, // Not available in current schema
      inRiskZone: riskZoneProximity < 1, // Within 1km of risk zone
      unusualSpeed: false, // Not available in current schema
    };

    const distressScore = Object.values(distressFactors).filter(Boolean).length;

    const riskFactors: RiskFactors = {
      distanceKm: 0,
      timeGapMinutes:
        (inactivityCheck.details as { inactivityMinutes?: number })
          .inactivityMinutes || 0,
      speedKmh: 0, // Not available in current schema
      batteryLevel: 100, // Default since not available in current schema
      networkType: "unknown", // Default since not available in current schema
      riskZoneProximity: riskZoneProximity * 1000,
      routeDeviationMeters: 0,
      inactivityMinutes:
        (inactivityCheck.details as { inactivityMinutes?: number })
          .inactivityMinutes || 0,
    };

    const severityScore = this.calculateAnomalyScore(riskFactors);

    // Threshold: 2+ distress factors (adjusted for available data)
    const detected = distressScore >= 2;

    return {
      detected,
      anomalyType: "silent_distress",
      severityScore,
      severityLevel: this.getSeverityLevel(severityScore),
      details: {
        distressFactors,
        distressScore,
        riskZoneProximityKm: riskZoneProximity,
        ...inactivityCheck.details,
      },
      recommendations: [
        "Immediate contact attempt required",
        "Consider emergency response activation",
        "Monitor vital signs if wearable data available",
        "Alert emergency contacts immediately",
      ],
    };
  }

  /**
   * Detect risk zone entry
   */
  private async detectRiskZoneEntry(
    touristId: string,
    currentLocation: LocationData,
    riskZones: Array<{
      id: string;
      name: string;
      latitude?: number;
      longitude?: number;
      center_lat?: number;
      center_lng?: number;
      risk_level?: string;
      type?: string;
      description?: string;
      risk_factors?: string;
    }>
  ): Promise<AnomalyDetectionResult> {
    const riskZone = riskZones.find((zone) => {
      const distance = this.calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        zone.latitude || zone.center_lat || 0,
        zone.longitude || zone.center_lng || 0
      );
      return distance < 1; // Within 1km
    });

    if (!riskZone) {
      return {
        detected: false,
        anomalyType: "risk_zone_entry",
        severityScore: 0,
        severityLevel: "low",
        details: {},
        recommendations: [],
      };
    }

    const riskFactors: RiskFactors = {
      distanceKm: 0,
      timeGapMinutes: 0,
      speedKmh: 0, // Not available in current schema
      batteryLevel: 100, // Default since not available in current schema
      networkType: "unknown", // Default since not available in current schema
      riskZoneProximity: 0,
      routeDeviationMeters: 0,
      inactivityMinutes: 0,
    };

    const severityScore = this.calculateAnomalyScore(riskFactors);

    return {
      detected: true,
      anomalyType: "risk_zone_entry",
      severityScore,
      severityLevel: this.getSeverityLevel(severityScore),
      details: {
        riskZone: {
          name: riskZone.name,
          riskLevel: riskZone.risk_level || riskZone.type || "unknown",
          description:
            riskZone.description ||
            riskZone.risk_factors ||
            "Risk zone detected",
        },
        entryLocation: {
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
        },
      },
      recommendations: [
        "Monitor tourist closely in risk zone",
        "Ensure emergency contacts are updated",
        "Consider providing additional safety guidance",
        "Track exit from risk zone",
      ],
    };
  }

  /**
   * Store detected anomaly in database
   */
  private async storeAnomaly(
    touristId: string,
    anomaly: AnomalyDetectionResult,
    location: LocationData
  ): Promise<void> {
    try {
      // Use TouristService to create anomaly-based SOS alert
      await touristService.createAnomalySOSAlert(
        touristId,
        anomaly.anomalyType,
        anomaly.severityLevel,
        { lat: location.latitude, lng: location.longitude },
        anomaly.details,
        anomaly.recommendations
      );

      // Send notifications for high/critical anomalies
      if (
        anomaly.severityLevel === "high" ||
        anomaly.severityLevel === "critical"
      ) {
        await notificationService.sendAnomalyNotification(
          anomaly.anomalyType,
          anomaly.severityLevel,
          touristId,
          { lat: location.latitude, lng: location.longitude },
          anomaly.details,
          anomaly.recommendations
        );
      }

      // Trigger emergency notification for critical silent distress
      if (
        anomaly.anomalyType === "silent_distress" &&
        anomaly.severityLevel === "critical"
      ) {
        await notificationService.sendEmergencyNotification(
          touristId,
          { lat: location.latitude, lng: location.longitude },
          "Silent Distress Pattern Detected",
          anomaly.details
        );
      }
    } catch (error) {
      console.error("Error storing anomaly:", error);
    }
  }

  /**
   * Helper methods
   */
  private async getPreviousLocation(
    touristId: string
  ): Promise<LocationData | null> {
    const { data } = await supabase
      .from("tourist_locations")
      .select("*")
      .eq("tourist_id", touristId)
      .order("timestamp", { ascending: false })
      .limit(2);

    return data && data.length > 1 ? data[1] : null;
  }

  private async getActiveRoute(touristId: string): Promise<RouteData | null> {
    // For now, return null since routes table doesn't exist yet
    // This will be implemented when the routes table is created
    return null;
  }

  private async getNearbyRiskZones(
    lat: number,
    lng: number
  ): Promise<
    Array<{
      id: string;
      name: string;
      latitude?: number;
      longitude?: number;
      center_lat?: number;
      center_lng?: number;
      risk_level?: string;
      type?: string;
      description?: string;
      risk_factors?: string;
    }>
  > {
    // Get risk zones within 5km
    const { data } = await supabase
      .from("geo_fences")
      .select("*")
      .eq("type", "danger");

    return data || [];
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const anomalyDetectionService = AnomalyDetectionService.getInstance();
