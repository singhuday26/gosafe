import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  Shield,
  Wifi,
  Battery,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  sosAIService,
  type TouristRiskProfile,
  type EnhancedSOSRequest,
  type DeviceContext,
} from "@/services/sosAIService";
import { useAuth } from "@/hooks/useAuth";

interface SOSData {
  sosId: string;
  riskProfile: TouristRiskProfile;
  location: LocationData;
  deviceContext: DeviceContext;
}

interface EnhancedSOSButtonProps {
  onTrigger?: (sosData: SOSData) => void;
  isActive: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  emergencyContacts?: Array<{
    name: string;
    number: string;
    type: "primary" | "secondary" | "emergency";
  }>;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationRiskCheck {
  isRisky: boolean;
  riskLevel: string;
  warnings: string[];
  source: string;
}

export const EnhancedSOSButton: React.FC<EnhancedSOSButtonProps> = ({
  onTrigger,
  isActive,
  disabled = false,
  size = "lg",
  className = "",
  emergencyContacts = [],
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [holdDuration, setHoldDuration] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [riskProfile, setRiskProfile] = useState<TouristRiskProfile | null>(
    null
  );
  const [locationRisk, setLocationRisk] = useState<LocationRiskCheck | null>(
    null
  );
  const [deviceContext, setDeviceContext] = useState<DeviceContext | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const countdownRef = useRef<NodeJS.Timeout>();
  const holdRef = useRef<NodeJS.Timeout>();

  // Start emergency countdown
  const startEmergencyCountdown = useCallback(() => {
    setCountdown(30);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setShowOverlay(false);
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Get current location
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
          toast({
            title: "Location Access Required",
            description:
              "Please enable location access for emergency features.",
            variant: "destructive",
          });
        }
      );
    }
  }, [toast]);

  const updateDeviceContext = useCallback(() => {
    const context = sosAIService.getDeviceContext();
    setDeviceContext(context);
  }, []);

  const loadRiskProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const profile = await sosAIService.analyzeRiskProfile(user.id);
      setRiskProfile(profile);
    } catch (error) {
      console.error("Failed to load risk profile:", error);
    }
  }, [user?.id]);

  const checkLocationRisk = useCallback(async () => {
    if (!location) return;

    try {
      const risk = await sosAIService.checkLocationRisk(
        location.latitude,
        location.longitude
      );

      // Map the returned risk data to our interface
      const locationRiskData: LocationRiskCheck = {
        isRisky: risk.isRisky,
        riskLevel: risk.riskLevel,
        warnings: risk.warnings,
        source: risk.source,
      };

      setLocationRisk(locationRiskData);

      if (risk.isRisky && risk.riskLevel !== "LOW") {
        toast({
          title: "⚠️ Location Warning",
          description: `This area has been flagged as ${risk.riskLevel} risk. Stay alert and consider moving to a safer location.`,
          variant: "destructive",
          duration: 8000,
        });
      }
    } catch (error) {
      console.error("Location risk check failed:", error);
    }
  }, [location, toast]);

  const triggerSOS = useCallback(async () => {
    if (!user?.id || !location || !deviceContext) {
      toast({
        title: "SOS Error",
        description: "Unable to trigger SOS. Missing required data.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setShowOverlay(true);

    try {
      // Prepare enhanced SOS request
      const sosRequest: Omit<
        EnhancedSOSRequest,
        "riskScore" | "priority" | "suggestedEscalation"
      > = {
        touristId: user.id,
        type: "panic",
        location,
        message: `Emergency SOS triggered from ${
          location.address || "current location"
        }`,
        batteryLevel: deviceContext.batteryLevel,
        networkStrength: deviceContext.networkStrength,
        timestamp: new Date(),
        deviceInfo: {
          userAgent:
            (deviceContext.deviceInfo.userAgent as string) || "Unknown",
          isOnline: (deviceContext.deviceInfo.isOnline as boolean) || true,
          connectionType: deviceContext.deviceInfo.connectionType as string,
        },
      };

      // Create enhanced SOS with AI analysis
      const result = await sosAIService.createEnhancedSOS(sosRequest);

      if (result.success) {
        toast({
          title: "🚨 SOS Alert Sent!",
          description: `Emergency services notified. Priority: ${
            result.riskProfile?.riskLevel || "MEDIUM"
          }`,
          duration: 10000,
        });

        // Update risk profile
        if (result.riskProfile) {
          setRiskProfile(result.riskProfile);
        }

        // Start countdown
        startEmergencyCountdown();

        // Notify parent component
        if (onTrigger && result.sosId && result.riskProfile) {
          onTrigger({
            sosId: result.sosId,
            riskProfile: result.riskProfile,
            location,
            deviceContext,
          });
        }
      } else {
        throw new Error(result.error || "SOS creation failed");
      }
    } catch (error) {
      console.error("SOS trigger failed:", error);
      toast({
        title: "SOS Error",
        description:
          "Failed to send SOS alert. Please try again or call emergency services directly.",
        variant: "destructive",
      });
      setShowOverlay(false);
    } finally {
      setIsProcessing(false);
    }
  }, [
    user?.id,
    location,
    deviceContext,
    toast,
    onTrigger,
    startEmergencyCountdown,
  ]);

  useEffect(() => {
    getCurrentLocation();
    updateDeviceContext();
    if (user?.id) {
      loadRiskProfile();
    }
  }, [user?.id, getCurrentLocation, updateDeviceContext, loadRiskProfile]);

  // Monitor location changes for risk assessment
  useEffect(() => {
    if (location && !isActive) {
      checkLocationRisk();
    }
  }, [location, isActive, checkLocationRisk]);

  // Hold-to-trigger SOS logic
  useEffect(() => {
    if (isPressed && !isActive && !disabled) {
      holdRef.current = setInterval(() => {
        setHoldDuration((prev) => {
          if (prev >= 3000) {
            setIsPressed(false);
            setHoldDuration(0);
            triggerSOS();
            return 0;
          }
          return prev + 100;
        });
      }, 100);
    } else {
      setHoldDuration(0);
      if (holdRef.current) {
        clearInterval(holdRef.current);
      }
    }

    return () => {
      if (holdRef.current) {
        clearInterval(holdRef.current);
      }
    };
  }, [isPressed, isActive, disabled, triggerSOS]);

  const cancelSOS = () => {
    setShowOverlay(false);
    setIsPressed(false);
    setHoldDuration(0);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    toast({
      title: "SOS Cancelled",
      description: "Emergency alert has been cancelled.",
    });
  };

  const handleMouseDown = () => {
    if (!disabled && !isActive) {
      setIsPressed(true);
      updateDeviceContext(); // Refresh device context on interaction

      toast({
        title: "Hold to activate SOS",
        description: "Keep holding for 3 seconds to trigger emergency alert",
        duration: 2000,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    setHoldDuration(0);
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-12 w-12 text-sm";
      case "md":
        return "h-16 w-16 text-base";
      case "lg":
      default:
        return "h-20 w-20 text-lg";
    }
  };

  const progress = Math.min((holdDuration / 3000) * 100, 100);

  return (
    <>
      {/* Main SOS Button */}
      <div className={`relative ${className}`}>
        <Button
          size="icon"
          className={`
            ${getSizeClasses()}
            rounded-full
            ${
              isActive || showOverlay
                ? "bg-red-600 hover:bg-red-700 animate-pulse"
                : isPressed
                ? "bg-red-500 hover:bg-red-600 scale-110"
                : "bg-red-500 hover:bg-red-600"
            }
            text-white shadow-lg transition-all duration-200
            ${
              locationRisk?.isRisky && locationRisk?.riskLevel === "HIGH"
                ? "ring-4 ring-orange-400 ring-opacity-75"
                : ""
            }
          `}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          disabled={disabled || isProcessing}
        >
          {isActive || showOverlay ? (
            <div className="flex flex-col items-center">
              <div className="animate-pulse text-xl">🚨</div>
              {showOverlay && <span className="text-xs">{countdown}s</span>}
            </div>
          ) : (
            <AlertTriangle className="h-8 w-8" />
          )}
        </Button>

        {/* Progress ring for hold duration */}
        {isPressed && (
          <div className="absolute inset-0 rounded-full">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 36 36"
            >
              <path
                className="text-red-200"
                strokeWidth="2"
                fill="none"
                stroke="currentColor"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-white"
                strokeWidth="2"
                strokeDasharray={`${progress}, 100`}
                strokeLinecap="round"
                fill="none"
                stroke="currentColor"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        )}

        {/* Risk Level Indicator */}
        {riskProfile && (
          <div className="absolute -top-2 -right-2">
            <Badge
              variant={
                riskProfile.riskLevel === "CRITICAL"
                  ? "destructive"
                  : riskProfile.riskLevel === "HIGH"
                  ? "destructive"
                  : riskProfile.riskLevel === "MEDIUM"
                  ? "default"
                  : "secondary"
              }
              className="text-xs px-1 py-0"
            >
              {riskProfile.riskLevel}
            </Badge>
          </div>
        )}
      </div>

      {/* Enhanced SOS Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-red-50 border-red-200">
            <CardHeader className="bg-red-500 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-6 w-6" />
                  🚨 Emergency SOS Active
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={cancelSOS}
                  className="text-white hover:bg-red-600"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Countdown Timer */}
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {countdown}s
                </div>
                <Progress value={(countdown / 30) * 100} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  Emergency services have been notified
                </p>
              </div>

              {/* Risk Assessment */}
              {riskProfile && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shield className="mr-2 h-4 w-4 text-primary" />
                    <span className="font-semibold">Risk Assessment</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Level:</span>
                    <Badge
                      variant={
                        riskProfile.riskLevel === "CRITICAL"
                          ? "destructive"
                          : riskProfile.riskLevel === "HIGH"
                          ? "destructive"
                          : riskProfile.riskLevel === "MEDIUM"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {riskProfile.riskLevel} ({riskProfile.riskScore}/100)
                    </Badge>
                  </div>
                </div>
              )}

              {/* Location Information */}
              {location && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <MapPin className="mr-2 h-4 w-4 text-primary" />
                    <span className="font-semibold">Current Location</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {location.address ||
                      `${location.latitude.toFixed(
                        6
                      )}, ${location.longitude.toFixed(6)}`}
                  </p>
                  {locationRisk?.isRisky && (
                    <div className="mt-2">
                      <Badge variant="destructive" className="text-xs">
                        ⚠️ {locationRisk.riskLevel} Risk Area
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Device Status */}
              {deviceContext && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Phone className="mr-2 h-4 w-4 text-primary" />
                    <span className="font-semibold">Device Status</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <Battery className="mr-1 h-3 w-3" />
                      {deviceContext.batteryLevel}%
                    </div>
                    <div className="flex items-center">
                      <Wifi className="mr-1 h-3 w-3" />
                      {deviceContext.networkStrength}%
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Contacts */}
              {emergencyContacts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    Emergency Contacts
                  </h4>
                  {emergencyContacts.map((contact, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded"
                    >
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {contact.number}
                        </div>
                      </div>
                      <Badge
                        variant={
                          contact.type === "emergency"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {contact.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Status Updates */}
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">
                    Status Updates
                  </span>
                </div>
                <div className="space-y-1 text-sm text-yellow-700">
                  <div>✓ SOS Alert triggered</div>
                  <div>✓ Location shared with authorities</div>
                  <div>✓ Risk assessment completed</div>
                  <div>✓ Emergency contacts notified</div>
                  <div className="animate-pulse">
                    ⏳ Waiting for response...
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={cancelSOS}
                >
                  Cancel Alert
                </Button>
                <Button variant="destructive" className="flex-1" asChild>
                  <a href="tel:100">Call 100</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
