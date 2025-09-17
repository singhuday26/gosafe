import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  AlertTriangle,
  MapPin,
  Clock,
  Phone,
  Ambulance,
  Shield,
  ArrowLeft,
  User,
  Navigation,
  Activity,
} from "lucide-react";
import MapComponent from "@/components/MapComponent";

interface TimelineEvent {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
  type: "alert" | "response" | "contact" | "location";
}

interface ContactStatus {
  id: string;
  name: string;
  type: "emergency" | "police" | "ambulance" | "family";
  status: "notified" | "acknowledged" | "responding" | "arrived";
  phone?: string;
  eta?: string;
}

const SOSStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [contacts, setContacts] = useState<ContactStatus[]>([]);

  // Get data from navigation state
  const alertData = location.state as {
    alert_id?: string;
    tourist_id?: string;
    location?: { latitude: number; longitude: number };
  };

  useEffect(() => {
    // Initialize timeline events
    const initialEvents: TimelineEvent[] = [
      {
        id: "1",
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        title: "SOS Alert Triggered",
        description: "Emergency alert sent to all emergency services",
        status: "completed",
        type: "alert",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 4 * 60 * 1000), // 4 minutes ago
        title: "Location Confirmed",
        description: "GPS coordinates verified and shared with responders",
        status: "completed",
        type: "location",
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
        title: "Police Notified",
        description: "Local police station alerted and responding",
        status: "completed",
        type: "response",
      },
      {
        id: "4",
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        title: "Ambulance Dispatched",
        description: "Medical emergency team en route to your location",
        status: "completed",
        type: "response",
      },
      {
        id: "5",
        timestamp: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
        title: "Emergency Contacts Notified",
        description: "Family and emergency contacts have been alerted",
        status: "completed",
        type: "contact",
      },
      {
        id: "6",
        timestamp: new Date(),
        title: "Response Team ETA",
        description: "Emergency services expected to arrive in 3-5 minutes",
        status: "in-progress",
        type: "response",
      },
    ];

    setTimelineEvents(initialEvents);

    // Initialize contacts
    const initialContacts: ContactStatus[] = [
      {
        id: "1",
        name: "Local Police Station",
        type: "police",
        status: "responding",
        phone: "100",
        eta: "2 min",
      },
      {
        id: "2",
        name: "Ambulance Service",
        type: "ambulance",
        status: "responding",
        phone: "108",
        eta: "3 min",
      },
      {
        id: "3",
        name: "Emergency Contact 1",
        type: "family",
        status: "acknowledged",
        phone: "+91-98765-43210",
      },
      {
        id: "4",
        name: "Emergency Contact 2",
        type: "family",
        status: "acknowledged",
        phone: "+91-87654-32109",
      },
    ];

    setContacts(initialContacts);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "in-progress":
        return "text-blue-600";
      case "pending":
        return "text-yellow-600";
      case "acknowledged":
        return "text-green-600";
      case "responding":
        return "text-blue-600";
      case "arrived":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "acknowledged":
      case "arrived":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in-progress":
      case "responding":
        return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case "police":
        return <Shield className="h-4 w-4 text-blue-600" />;
      case "ambulance":
        return <Ambulance className="h-4 w-4 text-red-600" />;
      case "family":
        return <User className="h-4 w-4 text-green-600" />;
      default:
        return <Phone className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "response":
        return <Shield className="h-5 w-5 text-blue-600" />;
      case "contact":
        return <Phone className="h-5 w-5 text-green-600" />;
      case "location":
        return <MapPin className="h-5 w-5 text-purple-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/tourist")}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Badge variant="destructive" className="animate-pulse">
            <AlertTriangle className="mr-1 h-3 w-3" />
            ACTIVE EMERGENCY
          </Badge>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Emergency Response Status
          </h1>
          <p className="text-gray-600">
            Real-time updates on your emergency situation
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <Card className="border-gray-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-gray-700" />
                  Response Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timelineEvents.map((event, index) => (
                    <div key={event.id} className="flex items-start space-x-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`p-2 rounded-full border-2 ${
                            event.status === "completed"
                              ? "bg-green-100 border-green-300"
                              : event.status === "in-progress"
                              ? "bg-blue-100 border-blue-300"
                              : "bg-gray-100 border-gray-300"
                          }`}
                        >
                          {getTimelineIcon(event.type)}
                        </div>
                        {index < timelineEvents.length - 1 && (
                          <div
                            className={`w-0.5 h-8 mt-2 ${
                              event.status === "completed"
                                ? "bg-green-300"
                                : "bg-gray-300"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {event.title}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {event.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {event.description}
                        </p>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(
                            event.status
                          )} border-current`}
                        >
                          {event.status.replace("-", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Risk Assessment */}
            <Card className="border-yellow-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-900">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  AI Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Risk Level:</span>
                    <Badge variant="destructive">High Risk Zone</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Area Safety:</span>
                      <span className="text-red-600">Low</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <p className="text-xs text-gray-600">
                    Known theft hotspot - Emergency response prioritized
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="border-green-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center text-green-900">
                  <Phone className="mr-2 h-5 w-5" />
                  Response Team Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center space-x-3 p-2 bg-gray-50 rounded"
                  >
                    {getContactIcon(contact.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {contact.name}
                        </span>
                        {getStatusIcon(contact.status)}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(
                            contact.status
                          )} border-current`}
                        >
                          {contact.status.toUpperCase()}
                        </Badge>
                        {contact.eta && (
                          <span className="text-xs text-gray-500">
                            ETA: {contact.eta}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Current Location */}
            <Card className="border-blue-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <MapPin className="mr-2 h-5 w-5" />
                  Current Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 rounded-lg overflow-hidden border mb-2">
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
                    zoom={16}
                  />
                </div>
                {alertData?.location && (
                  <div className="text-xs text-gray-600">
                    <div>Lat: {alertData.location.latitude.toFixed(6)}</div>
                    <div>Lng: {alertData.location.longitude.toFixed(6)}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emergency Instructions */}
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                <strong>Stay where you are!</strong> Emergency responders are
                tracking your location. Do not move unless instructed by
                authorities.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOSStatusPage;
