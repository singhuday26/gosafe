import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { anomalyDetectionService } from "@/services/anomalyDetectionService";
import type { Database } from "@/integrations/supabase/types";

type TouristLocation = Database["public"]["Tables"]["tourist_locations"]["Row"];

/**
 * Hook to automatically detect anomalies when tourist locations are updated
 * This hook sets up real-time monitoring of location updates and triggers
 * anomaly detection for each new location entry
 */
export const useAnomalyDetection = () => {
  useEffect(() => {
    // Set up real-time subscription for location updates
    const subscription = supabase
      .channel("location_updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tourist_locations",
        },
        async (payload) => {
          const newLocation = payload.new as TouristLocation;

          try {
            // Trigger anomaly detection for the new location
            const anomalies = await anomalyDetectionService.detectAnomalies(
              newLocation.tourist_id,
              newLocation // Pass the location as-is, service will handle missing fields
            );

            // Log detected anomalies for monitoring
            if (anomalies.length > 0) {
              console.log(
                `Anomalies detected for tourist ${newLocation.tourist_id}:`,
                anomalies
              );

              // Here you could trigger additional actions like:
              // - Send notifications to authorities
              // - Update dashboard with real-time alerts
              // - Trigger emergency protocols for critical anomalies
            }
          } catch (error) {
            console.error("Error in anomaly detection:", error);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);
};

/**
 * Manual trigger for anomaly detection - useful for testing or batch processing
 */
export const triggerAnomalyDetection = async (touristId: string) => {
  try {
    // Get the latest location for this tourist
    const { data: latestLocation } = await supabase
      .from("tourist_locations")
      .select("*")
      .eq("tourist_id", touristId)
      .order("timestamp", { ascending: false })
      .limit(1)
      .single();

    if (!latestLocation) {
      console.warn(`No location data found for tourist ${touristId}`);
      return [];
    }

    // Trigger anomaly detection
    const anomalies = await anomalyDetectionService.detectAnomalies(
      touristId,
      latestLocation // Pass the location as-is, service will handle missing fields
    );

    return anomalies;
  } catch (error) {
    console.error("Error triggering anomaly detection:", error);
    return [];
  }
};

/**
 * Get anomaly statistics for dashboard
 */
export const getAnomalyStats = async () => {
  try {
    const { data: alerts } = await supabase
      .from("sos_alerts")
      .select("*")
      .like("alert_type", "anomaly_%")
      .order("created_at", { ascending: false });

    if (!alerts) return { total: 0, critical: 0, high: 0, medium: 0, low: 0 };

    // Parse anomaly types and severity levels
    const stats = alerts.reduce(
      (acc, alert) => {
        const anomalyType =
          alert.alert_type?.replace("anomaly_", "") || "unknown";
        const severityMapping: Record<
          string,
          "low" | "medium" | "high" | "critical"
        > = {
          sudden_drop_off: "high",
          prolonged_inactivity: "medium",
          route_deviation: "medium",
          silent_distress: "critical",
          risk_zone_entry: "high",
        };

        const severity = severityMapping[anomalyType] || "low";

        return {
          ...acc,
          [severity]: acc[severity] + 1,
        };
      },
      { total: alerts.length, critical: 0, high: 0, medium: 0, low: 0 }
    );

    return stats;
  } catch (error) {
    console.error("Error getting anomaly stats:", error);
    return { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
  }
};
