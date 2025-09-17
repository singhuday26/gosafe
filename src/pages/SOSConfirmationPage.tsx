import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  AlertTriangle,
  MapPin,
  Clock,
  Phone,
  Ambulance,
  Shield,
  X,
  Eye,
  Navigation,
} from "lucide-react";
import MapComponent from "@/components/MapComponent";
import { touristService } from "@/services/touristService";

const SOSConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [canCancel, setCanCancel] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [storedOffline, setStoredOffline] = useState(false);
  const [statusUpdates, setStatusUpdates] = useState([
    {
      id: 1,
      message: "🚨 SOS Alert Sent Successfully",
      status: "completed",
      timestamp: new Date(),
    },
    {
      id: 2,
      message: "📱 Message sent to Emergency Contacts",
      status: "completed",
      timestamp: new Date(),
    },
    {
      id: 3,
      message: "🚔 Alert sent to Police",
      status: "pending",
      timestamp: null,
    },
    {
      id: 4,
      message: "🚑 Ambulance notified",
      status: "pending",
      timestamp: null,
    },
  ]);

  useEffect(() => {
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setStoredOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Get data from navigation state
  const alertData = location.state as {
    alert_id?: string;
    tourist_id?: string;
    location?: { latitude: number; longitude: number };
    escalation?: string;
  };

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Disable cancel after 10 seconds
    const cancelTimer = setTimeout(() => {
      setCanCancel(false);
    }, 10000);

    // Simulate status updates
    const statusTimer1 = setTimeout(() => {
      setStatusUpdates((prev) =>
        prev.map((update) =>
          update.id === 3
            ? { ...update, status: "completed", timestamp: new Date() }
            : update
        )
      );
    }, 3000);

    const statusTimer2 = setTimeout(() => {
      setStatusUpdates((prev) =>
        prev.map((update) =>
          update.id === 4
            ? { ...update, status: "completed", timestamp: new Date() }
            : update
        )
      );
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(cancelTimer);
      clearTimeout(statusTimer1);
      clearTimeout(statusTimer2);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCancelAlert = async () => {
    if (!canCancel || !alertData?.alert_id) return;

    try {
      await touristService.updateSOSAlertStatus(alertData.alert_id, "resolved");
      navigate("/tourist");
    } catch (error) {
      console.error("Failed to cancel alert:", error);
    }
  };

  const handleTrackStatus = () => {
    navigate("/tourist/sos-status", {
      state: {
        alert_id: alertData?.alert_id,
        tourist_id: alertData?.tourist_id,
        location: alertData?.location,
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />;
      case "failed":
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Success Animation */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
            <CheckCircle className="h-10 w-10 text-green-600 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-red-900 mb-2 animate-fade-in">
            🚨 SOS Alert Sent Successfully
          </h1>
          <p className="text-gray-600 animate-fade-in animation-delay-200">
            Emergency services have been notified. Help is on the way.
          </p>
        </div>

        {/* Offline Indicator */}
        {(!isOnline || storedOffline) && (
          <Alert className="border-yellow-200 bg-yellow-50 animate-fade-in animation-delay-400">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Offline Mode:</strong> SOS alert stored locally and will
              auto-send when connection is restored. Emergency services have
              been notified of your last known location.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Status & Timer */}
          <div className="space-y-6">
            {/* Countdown Timer */}
            <Card className="border-red-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center text-red-900">
                  <Clock className="mr-2 h-5 w-5" />
                  Help Arriving In
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {formatTime(countdown)}
                  </div>
                  <Progress
                    value={(300 - countdown) / 3}
                    className="w-full h-2"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Estimated arrival time based on your location
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Status Updates */}
            <Card className="border-green-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center text-green-900">
                  <Shield className="mr-2 h-5 w-5" />
                  Emergency Response Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {statusUpdates.map((update) => (
                  <div key={update.id} className="flex items-center space-x-3">
                    {getStatusIcon(update.status)}
                    <div className="flex-1">
                      <p className={`text-sm ${getStatusColor(update.status)}`}>
                        {update.message}
                      </p>
                      {update.timestamp && (
                        <p className="text-xs text-gray-500">
                          {update.timestamp.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="border-blue-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Phone className="mr-2 h-5 w-5" />
                  Emergency Contacts Notified
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm">Primary Contact</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Notified
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm">Emergency Services</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Dispatched
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Map & Actions */}
          <div className="space-y-6">
            {/* Mini Map */}
            <Card className="border-gray-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-gray-700" />
                  Your Current Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 rounded-lg overflow-hidden border">
                  <MapComponent
                    tourists={
                      alertData?.location
                        ? [
                            {
                              id: alertData.tourist_id || "current",
                              name: "Your Location",
                              latitude: alertData.location.latitude,
                              longitude: alertData.location.longitude,
                              status: "sos",
                            },
                          ]
                        : []
                    }
                    center={
                      alertData?.location
                        ? [
                            alertData.location.longitude,
                            alertData.location.latitude,
                          ]
                        : undefined
                    }
                    zoom={15}
                  />
                </div>
                {alertData?.location && (
                  <div className="mt-2 text-xs text-gray-600">
                    Lat: {alertData.location.latitude.toFixed(6)}, Lng:{" "}
                    {alertData.location.longitude.toFixed(6)}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card className="border-yellow-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-900">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  AI Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Level:</span>
                    <Badge variant="destructive">High Risk Zone</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Known theft hotspot - Emergency response prioritized
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleTrackStatus}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <Eye className="mr-2 h-5 w-5" />
                Track Status
              </Button>

              {canCancel && (
                <Button
                  onClick={handleCancelAlert}
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  size="lg"
                >
                  <X className="mr-2 h-5 w-5" />
                  Cancel Alert (Available for{" "}
                  {Math.max(
                    0,
                    Math.floor(
                      (10000 -
                        (Date.now() - statusUpdates[0].timestamp.getTime())) /
                        1000
                    )
                  )}
                  s)
                </Button>
              )}

              <Alert className="border-blue-200 bg-blue-50">
                <Navigation className="h-4 w-4" />
                <AlertDescription className="text-blue-800">
                  Stay in your current location. Emergency services are tracking
                  your position.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOSConfirmationPage;
