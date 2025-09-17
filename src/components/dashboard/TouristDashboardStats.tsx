import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, MapPin, AlertTriangle, Users } from "lucide-react";
import { TouristService } from "@/services/touristService";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

interface SafetyMetrics {
  score: number;
  safeZones: number;
  dangerZones: number;
  cautionAreas: number;
}

type DigitalTouristID =
  Database["public"]["Tables"]["digital_tourist_ids"]["Row"];
type TouristLocation = Database["public"]["Tables"]["tourist_locations"]["Row"];

interface TouristDashboardStatsProps {
  userId: string;
  className?: string;
}

export const TouristDashboardStats: React.FC<TouristDashboardStatsProps> = ({
  userId,
  className = "",
}) => {
  const [metrics, setMetrics] = useState<SafetyMetrics>({
    score: 0,
    safeZones: 0,
    dangerZones: 0,
    cautionAreas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [digitalIds, setDigitalIds] = useState<DigitalTouristID[]>([]);
  const [locations, setLocations] = useState<TouristLocation[]>([]);
  const { toast } = useToast();

  const touristService = TouristService.getInstance();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Load safety metrics from real data
      const safetyMetrics = await touristService.getSafetyMetrics();

      // Calculate score based on real data
      const calculatedScore = Math.max(
        0,
        100 - safetyMetrics.dangerZones * 20 + safetyMetrics.safeZones * 5
      );

      setMetrics({
        score: calculatedScore,
        safeZones: safetyMetrics.safeZones,
        dangerZones: safetyMetrics.dangerZones,
        cautionAreas: 1, // Default for now
      });

      // Load user's digital tourist IDs
      const userDigitalIds = await touristService.getAllDigitalTouristIDs();
      setDigitalIds(userDigitalIds);

      // Load recent locations
      const recentLocations = await touristService.getLatestTouristLocations();
      setLocations(recentLocations.slice(0, 5)); // Take first 5
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load dashboard statistics. Please refresh.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [touristService, toast]);

  useEffect(() => {
    loadDashboardData();

    // Set up real-time subscription for safety metrics updates
    const subscription = touristService.subscribeToSOSAlerts((alerts) => {
      // Recalculate metrics when alerts change
      loadDashboardData();
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, [loadDashboardData, touristService]);

  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
      >
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
    >
      {/* Safety Score */}
      <Card className="gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium">
            <Shield className="mr-2 h-4 w-4 text-safety" />
            Safety Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-safety mb-2">
            {metrics.score.toFixed(1)}
          </div>
          <Progress value={metrics.score} className="w-full mb-2" />
          <Badge
            variant="secondary"
            className={`text-xs ${
              metrics.score >= 80
                ? "bg-safety/10 text-safety border-safety/20"
                : metrics.score >= 60
                ? "bg-warning/10 text-warning border-warning/20"
                : "bg-danger/10 text-danger border-danger/20"
            }`}
          >
            {metrics.score >= 80
              ? "Safe"
              : metrics.score >= 60
              ? "Caution"
              : "Alert"}
          </Badge>
        </CardContent>
      </Card>

      {/* Safe Zones */}
      <Card className="gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium">
            <Shield className="mr-2 h-4 w-4 text-safety" />
            Safe Zones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-safety">
            {metrics.safeZones}
          </div>
          <p className="text-xs text-muted-foreground">
            Protected areas available
          </p>
        </CardContent>
      </Card>

      {/* Active Locations */}
      <Card className="gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium">
            <MapPin className="mr-2 h-4 w-4 text-primary" />
            Tracked Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {locations.length}
          </div>
          <p className="text-xs text-muted-foreground">
            Recent location updates
          </p>
        </CardContent>
      </Card>

      {/* Digital IDs */}
      <Card className="gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium">
            <Users className="mr-2 h-4 w-4 text-primary" />
            Digital Tourist IDs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {digitalIds.length}
          </div>
          <p className="text-xs text-muted-foreground">
            Active tourist registrations
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
