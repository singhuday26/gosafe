import React, { useEffect, useState } from "react";
import { X, Phone, MapPin, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SOSOverlayProps {
  isActive: boolean;
  onCancel: () => void;
  emergencyContacts: Array<{
    name: string;
    number: string;
    type: "primary" | "secondary" | "emergency";
  }>;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  countdown?: number;
  className?: string;
}

export const SOSOverlay: React.FC<SOSOverlayProps> = ({
  isActive,
  onCancel,
  emergencyContacts,
  location,
  countdown = 30,
  className = "",
}) => {
  const [timeRemaining, setTimeRemaining] = useState(countdown);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      setTimeRemaining(countdown);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive, countdown]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  if (!isVisible) return null;

  const progress = ((countdown - timeRemaining) / countdown) * 100;

  return (
    <div
      className={`
      fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
      flex items-center justify-center p-4
      transition-all duration-300
      ${isActive ? "opacity-100" : "opacity-0"}
      ${className}
    `}
    >
      <Card
        className={`
        w-full max-w-md
        border-red-500 shadow-2xl
        transition-all duration-300
        ${isActive ? "scale-100" : "scale-95"}
      `}
      >
        <CardHeader className="bg-red-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-6 w-6" />
              🚨 Emergency SOS Active
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Countdown Timer */}
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {timeRemaining}s
            </div>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              Emergency services have been notified
            </p>
          </div>

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
            </div>
          )}

          {/* Emergency Contacts */}
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
                    contact.type === "emergency" ? "destructive" : "secondary"
                  }
                >
                  {contact.type}
                </Badge>
              </div>
            ))}
          </div>

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
              <div>✓ Emergency contacts notified</div>
              <div className="animate-pulse">⏳ Waiting for response...</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Cancel Alert
            </Button>
            <Button variant="destructive" className="flex-1">
              Call 911
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
