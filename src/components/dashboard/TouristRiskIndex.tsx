import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { sosAIService, type TouristRiskProfile } from "@/services/sosAIService";

interface TouristRiskIndexProps {
  className?: string;
  showDetails?: boolean;
}

interface LocationRiskCheck {
  isRisky: boolean;
  riskLevel: string;
  warnings: string[];
  source: string;
}

export const TouristRiskIndex: React.FC<TouristRiskIndexProps> = ({
  className = "",
  showDetails = true,
}) => {
  const [riskProfile, setRiskProfile] = useState<TouristRiskProfile | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationRisk, setLocationRisk] = useState<LocationRiskCheck | null>(
    null
  );

  const { user } = useAuth();
  const { toast } = useToast();

  const loadRiskProfile = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const profile = await sosAIService.analyzeRiskProfile(user.id);
      setRiskProfile(profile);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load risk profile:", error);
      toast({
        title: "Risk Assessment Unavailable",
        description:
          "Unable to load current risk assessment. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  const checkLocationRisk = useCallback(async () => {
    if (!location) return;

    try {
      const risk = await sosAIService.checkLocationRisk(
        location.latitude,
        location.longitude
      );

      const locationRiskData: LocationRiskCheck = {
        isRisky: risk.isRisky,
        riskLevel: risk.riskLevel,
        warnings: risk.warnings,
        source: risk.source,
      };

      setLocationRisk(locationRiskData);
    } catch (error) {
      console.error("Location risk check failed:", error);
    }
  }, [location]);

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Location access denied:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadRiskProfile();
      getCurrentLocation();
    }
  }, [user?.id, loadRiskProfile, getCurrentLocation]);

  useEffect(() => {
    if (location) {
      checkLocationRisk();
    }
  }, [location, checkLocationRisk]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "CRITICAL":
        return "bg-red-500";
      case "HIGH":
        return "bg-orange-500";
      case "MEDIUM":
        return "bg-yellow-500";
      case "LOW":
      default:
        return "bg-green-500";
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case "CRITICAL":
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
      default:
        return "secondary";
    }
  };

  const getRiskDescription = (riskLevel: string, riskScore: number) => {
    switch (riskLevel) {
      case "CRITICAL":
        return "Immediate attention required. Consider emergency assistance.";
      case "HIGH":
        return "Elevated risk detected. Exercise extreme caution.";
      case "MEDIUM":
        return "Some risk factors present. Stay alert and cautious.";
      case "LOW":
      default:
        return "Low risk profile. Continue following safety guidelines.";
    }
  };

  const getLocationRiskInfo = () => {
    if (!locationRisk) return null;

    if (locationRisk.isRisky) {
      return {
        level: locationRisk.riskLevel,
        warning: `Current area has ${locationRisk.riskLevel.toLowerCase()} risk level`,
        icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      };
    }

    return {
      level: "SAFE",
      warning: "Current area appears safe",
      icon: <Shield className="h-4 w-4 text-green-500" />,
    };
  };

  // Helper function to get risk factor by type
  const getRiskFactorScore = (type: string) => {
    return riskProfile?.factors.find((f) => f.type === type)?.score || 0;
  };

  const locationRiskInfo = getLocationRiskInfo();

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Tourist Risk Index
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!riskProfile) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Tourist Risk Index
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-muted-foreground mb-4">
              Risk assessment not available
            </p>
            <Button onClick={loadRiskProfile} disabled={isLoading}>
              Load Risk Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Tourist Risk Index
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadRiskProfile}
            disabled={isLoading}
          >
            <TrendingUp className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Risk Score Display */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div
              className={`w-16 h-16 rounded-full ${getRiskColor(
                riskProfile.riskLevel
              )} flex items-center justify-center text-white text-2xl font-bold`}
            >
              {riskProfile.riskScore}
            </div>
          </div>
          <Badge
            variant={getRiskBadgeVariant(riskProfile.riskLevel)}
            className="text-sm px-3 py-1"
          >
            {riskProfile.riskLevel} RISK
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">
            {getRiskDescription(riskProfile.riskLevel, riskProfile.riskScore)}
          </p>
        </div>

        {/* Risk Score Breakdown */}
        {showDetails && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Risk Score</span>
                <span>{riskProfile.riskScore}/100</span>
              </div>
              <Progress value={riskProfile.riskScore} className="h-2" />
            </div>

            {/* Risk Factors */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Risk Factors:</h4>

              {getRiskFactorScore("frequency") > 30 && (
                <div className="flex items-center text-sm">
                  <AlertTriangle className="h-3 w-3 mr-2 text-orange-500" />
                  <span>
                    Frequent emergency alerts ({getRiskFactorScore("frequency")}
                    /100)
                  </span>
                </div>
              )}

              {getRiskFactorScore("time_pattern") > 30 && (
                <div className="flex items-center text-sm">
                  <Clock className="h-3 w-3 mr-2 text-yellow-500" />
                  <span>
                    Unusual time patterns ({getRiskFactorScore("time_pattern")}
                    /100)
                  </span>
                </div>
              )}

              {getRiskFactorScore("location") > 30 && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-3 w-3 mr-2 text-red-500" />
                  <span>
                    High-risk location history ({getRiskFactorScore("location")}
                    /100)
                  </span>
                </div>
              )}

              {getRiskFactorScore("frequency") <= 30 &&
                getRiskFactorScore("time_pattern") <= 30 &&
                getRiskFactorScore("location") <= 30 && (
                  <div className="flex items-center text-sm">
                    <Shield className="h-3 w-3 mr-2 text-green-500" />
                    <span>No significant risk factors detected</span>
                  </div>
                )}
            </div>

            {/* Current Location Risk */}
            {locationRiskInfo && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  {locationRiskInfo.icon}
                  <span className="ml-2 text-sm font-semibold">
                    Current Location
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {locationRiskInfo.warning}
                </p>
                {locationRisk?.warnings?.length > 0 && (
                  <div className="mt-2">
                    {locationRisk.warnings
                      .slice(0, 2)
                      .map((warning: string, index: number) => (
                        <p
                          key={index}
                          className="text-xs text-orange-600 flex items-center"
                        >
                          <Info className="h-3 w-3 mr-1" />
                          {warning}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Risk Factor Details */}
            {riskProfile.factors.length > 0 && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {riskProfile.factors.slice(0, 4).map((factor, index) => (
                  <div
                    key={index}
                    className="bg-muted/50 p-2 rounded text-center"
                  >
                    <div className="font-semibold capitalize">
                      {factor.type.replace("_", " ")}
                    </div>
                    <div className="text-muted-foreground">
                      {factor.score}/100
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Last Updated */}
            {lastUpdated && (
              <p className="text-xs text-muted-foreground text-center">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={loadRiskProfile}
            disabled={isLoading}
          >
            Refresh
          </Button>
          {riskProfile.riskLevel === "HIGH" ||
          riskProfile.riskLevel === "CRITICAL" ? (
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() =>
                toast({
                  title: "Emergency Contact",
                  description:
                    "Consider contacting emergency services or trusted contacts.",
                  duration: 5000,
                })
              }
            >
              Get Help
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() =>
                toast({
                  title: "Safety Tips",
                  description:
                    "Always share your location with trusted contacts and stay aware of your surroundings.",
                  duration: 5000,
                })
              }
            >
              Safety Tips
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
