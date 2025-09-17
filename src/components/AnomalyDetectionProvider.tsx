import React, { useEffect } from "react";
import { useAnomalyDetection } from "@/hooks/useAnomalyDetection";

/**
 * Provider component that initializes anomaly detection monitoring
 * This component should be placed high in the component tree to ensure
 * anomaly detection is active throughout the application
 */
export const AnomalyDetectionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Initialize anomaly detection monitoring
  useAnomalyDetection();

  // Optional: Set up periodic cleanup of old anomaly alerts
  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      try {
        // This would be implemented in the TouristService
        // await touristService.autoResolveAnomalyAlerts();
        console.log(
          "Anomaly detection system active - monitoring tourist locations"
        );
      } catch (error) {
        console.error("Error during anomaly cleanup:", error);
      }
    }, 30 * 60 * 1000); // Run every 30 minutes

    return () => clearInterval(cleanupInterval);
  }, []);

  return <>{children}</>;
};
