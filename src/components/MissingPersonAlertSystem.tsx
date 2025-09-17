import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  MapPin,
  Clock,
  User,
  Phone,
  Shield,
  Search,
  Camera,
  FileText,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Navigation,
  Bell,
  RadioIcon as Radio,
  Zap,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { TouristService } from "@/services/touristService";
import MapView from "@/components/MapView";

interface MissingPersonAlert {
  id: string;
  tourist_id: string;
  tourist_name: string;
  last_known_location: { latitude: number; longitude: number };
  missing_since: string;
  risk_factors: string[];
  search_radius: number;
  priority: "low" | "medium" | "high" | "critical";
  status: "reported" | "searching" | "found" | "escalated";
  assigned_units: string[];
  evidence: Array<{
    type: "location" | "communication" | "witness" | "device";
    description: string;
    timestamp: string;
    metadata: Record<string, unknown>;
  }>;
  reporter_name?: string;
  reporter_contact?: string;
  description?: string;
  last_contact?: string;
  planned_itinerary?: string;
  emergency_contacts?: Array<{
    name: string;
    relationship: string;
    phone: string;
    contacted: boolean;
  }>;
}

interface SearchOperation {
  id: string;
  missing_person_id: string;
  operation_name: string;
  search_area: { center: { lat: number; lng: number }; radius: number };
  assigned_teams: Array<{
    team_id: string;
    team_name: string;
    team_type: "ground" | "k9" | "air" | "water" | "tech";
    status: "assigned" | "active" | "standby" | "completed";
    last_update: string;
    current_location?: { lat: number; lng: number };
  }>;
  status: "planned" | "active" | "suspended" | "completed";
  start_time: string;
  estimated_completion?: string;
  findings: Array<{
    id: string;
    type: "evidence" | "sighting" | "clue" | "false_lead";
    description: string;
    location: { lat: number; lng: number };
    reported_by: string;
    timestamp: string;
    verified: boolean;
  }>;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  touristId?: string;
}

const MissingPersonAlertSystem: React.FC<Props> = ({
  isOpen,
  onClose,
  touristId,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"report" | "search" | "manage">(
    "report"
  );

  // Report form state
  const [reportForm, setReportForm] = useState({
    tourist_name: "",
    last_known_location: { latitude: 28.6139, longitude: 77.209 },
    last_seen_time: "",
    reporter_name: "",
    reporter_contact: "",
    relationship: "",
    description: "",
    planned_itinerary: "",
    risk_factors: [] as string[],
    emergency_contacts: [
      { name: "", relationship: "", phone: "", contacted: false },
    ],
  });

  // Data states
  const [missingPersons, setMissingPersons] = useState<MissingPersonAlert[]>(
    []
  );
  const [searchOperations, setSearchOperations] = useState<SearchOperation[]>(
    []
  );
  const [selectedMissingPerson, setSelectedMissingPerson] =
    useState<MissingPersonAlert | null>(null);

  const touristService = TouristService.getInstance();

  useEffect(() => {
    if (isOpen) {
      loadMissingPersonsData();
    }
  }, [isOpen]); // Only depend on isOpen, loadMissingPersonsData is stable

  useEffect(() => {
    if (touristId) {
      // Pre-fill form for specific tourist
      loadTouristInfo(touristId);
    }
  }, [touristId]); // Only depend on touristId, loadTouristInfo is stable

  const loadMissingPersonsData = async () => {
    try {
      setLoading(true);

      // Mock data - would come from database
      const mockMissingPersons: MissingPersonAlert[] = [
        {
          id: "mp_001",
          tourist_id: "tourist_001",
          tourist_name: "Lisa Anderson",
          last_known_location: { latitude: 28.6562, longitude: 77.241 },
          missing_since: new Date(
            Date.now() - 6 * 60 * 60 * 1000
          ).toISOString(),
          risk_factors: [
            "device_offline",
            "unfamiliar_area",
            "language_barrier",
          ],
          search_radius: 5000,
          priority: "critical",
          status: "searching",
          assigned_units: [
            "Ground Team Alpha",
            "K9 Unit Bravo",
            "Drone Team Delta",
          ],
          evidence: [
            {
              type: "location",
              description: "Last GPS ping near Chandni Chowk market",
              timestamp: new Date(
                Date.now() - 6 * 60 * 60 * 1000
              ).toISOString(),
              metadata: { accuracy: 10, signal_strength: "weak" },
            },
            {
              type: "witness",
              description: "Street vendor saw her asking for directions",
              timestamp: new Date(
                Date.now() - 5 * 60 * 60 * 1000
              ).toISOString(),
              metadata: {
                witness_contact: "+91-9876543210",
                reliability: "high",
              },
            },
          ],
          reporter_name: "Hotel Manager",
          reporter_contact: "+91-9999888777",
          description:
            "Tourist failed to return to hotel. Last seen at breakfast.",
          last_contact: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          planned_itinerary: "Red Fort -> Chandni Chowk -> India Gate",
          emergency_contacts: [
            {
              name: "John Anderson",
              relationship: "Husband",
              phone: "+1-555-0123",
              contacted: true,
            },
            {
              name: "Sarah Wilson",
              relationship: "Sister",
              phone: "+1-555-0456",
              contacted: false,
            },
          ],
        },
      ];

      const mockSearchOperations: SearchOperation[] = [
        {
          id: "search_001",
          missing_person_id: "mp_001",
          operation_name: "Operation Find Lisa",
          search_area: {
            center: { lat: 28.6562, lng: 77.241 },
            radius: 5000,
          },
          assigned_teams: [
            {
              team_id: "team_001",
              team_name: "Ground Team Alpha",
              team_type: "ground",
              status: "active",
              last_update: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              current_location: { lat: 28.658, lng: 77.24 },
            },
            {
              team_id: "team_002",
              team_name: "K9 Unit Bravo",
              team_type: "k9",
              status: "active",
              last_update: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              current_location: { lat: 28.655, lng: 77.242 },
            },
          ],
          status: "active",
          start_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          findings: [
            {
              id: "finding_001",
              type: "sighting",
              description:
                "CCTV footage shows person matching description at 14:30",
              location: { lat: 28.657, lng: 77.24 },
              reported_by: "Traffic Control",
              timestamp: new Date(
                Date.now() - 2 * 60 * 60 * 1000
              ).toISOString(),
              verified: true,
            },
          ],
        },
      ];

      setMissingPersons(mockMissingPersons);
      setSearchOperations(mockSearchOperations);
    } catch (error) {
      console.error("Error loading missing persons data:", error);
      toast({
        title: "Error",
        description: "Failed to load missing persons data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTouristInfo = async (touristId: string) => {
    try {
      // Pre-fill form with tourist information
      const tourists = await touristService.getAllDigitalTouristIDs();
      const tourist = tourists.find((t) => t.id === touristId);

      if (tourist) {
        setReportForm((prev) => ({
          ...prev,
          tourist_name: tourist.tourist_name || "",
        }));
      }
    } catch (error) {
      console.error("Error loading tourist info:", error);
    }
  };

  const handleReportMissingPerson = async () => {
    try {
      setLoading(true);

      const newAlert: MissingPersonAlert = {
        id: `mp_${Date.now()}`,
        tourist_id: touristId || `unknown_${Date.now()}`,
        tourist_name: reportForm.tourist_name,
        last_known_location: reportForm.last_known_location,
        missing_since: new Date(
          reportForm.last_seen_time || Date.now()
        ).toISOString(),
        risk_factors: reportForm.risk_factors,
        search_radius: 2000, // Default 2km
        priority: calculatePriority(reportForm.risk_factors),
        status: "reported",
        assigned_units: [],
        evidence: [],
        reporter_name: reportForm.reporter_name,
        reporter_contact: reportForm.reporter_contact,
        description: reportForm.description,
        planned_itinerary: reportForm.planned_itinerary,
        emergency_contacts: reportForm.emergency_contacts.filter(
          (c) => c.name && c.phone
        ),
      };

      // Add to state (would save to database in real implementation)
      setMissingPersons((prev) => [newAlert, ...prev]);

      toast({
        title: "Missing Person Report Submitted",
        description: `Alert created for ${reportForm.tourist_name}. Search teams will be notified.`,
      });

      // Reset form
      setReportForm({
        tourist_name: "",
        last_known_location: { latitude: 28.6139, longitude: 77.209 },
        last_seen_time: "",
        reporter_name: "",
        reporter_contact: "",
        relationship: "",
        description: "",
        planned_itinerary: "",
        risk_factors: [],
        emergency_contacts: [
          { name: "", relationship: "", phone: "", contacted: false },
        ],
      });

      setActiveTab("manage");
    } catch (error) {
      console.error("Error reporting missing person:", error);
      toast({
        title: "Error",
        description: "Failed to submit missing person report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePriority = (
    riskFactors: string[]
  ): "low" | "medium" | "high" | "critical" => {
    if (
      riskFactors.includes("medical_condition") ||
      riskFactors.includes("elderly") ||
      riskFactors.includes("child")
    ) {
      return "critical";
    }
    if (
      riskFactors.includes("device_offline") ||
      riskFactors.includes("unfamiliar_area")
    ) {
      return "high";
    }
    if (riskFactors.length > 2) {
      return "medium";
    }
    return "low";
  };

  const handleLaunchSearch = async (missingPersonId: string) => {
    try {
      const missingPerson = missingPersons.find(
        (mp) => mp.id === missingPersonId
      );
      if (!missingPerson) return;

      const searchOperation: SearchOperation = {
        id: `search_${Date.now()}`,
        missing_person_id: missingPersonId,
        operation_name: `Search for ${missingPerson.tourist_name}`,
        search_area: {
          center: {
            lat: missingPerson.last_known_location.latitude,
            lng: missingPerson.last_known_location.longitude,
          },
          radius: missingPerson.search_radius,
        },
        assigned_teams: [
          {
            team_id: "team_ground_1",
            team_name: "Ground Search Team",
            team_type: "ground",
            status: "assigned",
            last_update: new Date().toISOString(),
          },
        ],
        status: "planned",
        start_time: new Date().toISOString(),
        findings: [],
      };

      setSearchOperations((prev) => [searchOperation, ...prev]);

      // Update missing person status
      setMissingPersons((prev) =>
        prev.map((mp) =>
          mp.id === missingPersonId
            ? {
                ...mp,
                status: "searching" as const,
                assigned_units: ["Ground Search Team"],
              }
            : mp
        )
      );

      toast({
        title: "Search Operation Launched",
        description: `Search teams deployed for ${missingPerson.tourist_name}`,
      });
    } catch (error) {
      console.error("Error launching search:", error);
      toast({
        title: "Error",
        description: "Failed to launch search operation",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-black";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "reported":
        return <Bell className="h-4 w-4 text-blue-500" />;
      case "searching":
        return <Search className="h-4 w-4 text-orange-500" />;
      case "found":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "escalated":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Missing Person Alert System
          </DialogTitle>
          <DialogDescription>
            Report missing tourists and coordinate search operations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b">
            <Button
              variant={activeTab === "report" ? "default" : "ghost"}
              onClick={() => setActiveTab("report")}
              className="rounded-none border-b-2 border-transparent"
            >
              <FileText className="h-4 w-4 mr-2" />
              Report Missing
            </Button>
            <Button
              variant={activeTab === "search" ? "default" : "ghost"}
              onClick={() => setActiveTab("search")}
              className="rounded-none border-b-2 border-transparent"
            >
              <Search className="h-4 w-4 mr-2" />
              Search Operations
            </Button>
            <Button
              variant={activeTab === "manage" ? "default" : "ghost"}
              onClick={() => setActiveTab("manage")}
              className="rounded-none border-b-2 border-transparent"
            >
              <Activity className="h-4 w-4 mr-2" />
              Manage Cases
            </Button>
          </div>

          {/* Report Tab */}
          {activeTab === "report" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tourist_name">Missing Person Name</Label>
                    <Input
                      id="tourist_name"
                      value={reportForm.tourist_name}
                      onChange={(e) =>
                        setReportForm((prev) => ({
                          ...prev,
                          tourist_name: e.target.value,
                        }))
                      }
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="last_seen_time">Last Seen Date/Time</Label>
                    <Input
                      id="last_seen_time"
                      type="datetime-local"
                      value={reportForm.last_seen_time}
                      onChange={(e) =>
                        setReportForm((prev) => ({
                          ...prev,
                          last_seen_time: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="reporter_name">Reporter Name</Label>
                    <Input
                      id="reporter_name"
                      value={reportForm.reporter_name}
                      onChange={(e) =>
                        setReportForm((prev) => ({
                          ...prev,
                          reporter_name: e.target.value,
                        }))
                      }
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="reporter_contact">Reporter Contact</Label>
                    <Input
                      id="reporter_contact"
                      value={reportForm.reporter_contact}
                      onChange={(e) =>
                        setReportForm((prev) => ({
                          ...prev,
                          reporter_contact: e.target.value,
                        }))
                      }
                      placeholder="Phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">
                      Description of Circumstances
                    </Label>
                    <Textarea
                      id="description"
                      value={reportForm.description}
                      onChange={(e) =>
                        setReportForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe when and where the person was last seen, any concerning circumstances..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Risk Factors</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        "medical_condition",
                        "elderly",
                        "child",
                        "device_offline",
                        "unfamiliar_area",
                        "language_barrier",
                        "poor_weather",
                        "dangerous_area",
                      ].map((factor) => (
                        <label
                          key={factor}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={reportForm.risk_factors.includes(factor)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setReportForm((prev) => ({
                                  ...prev,
                                  risk_factors: [...prev.risk_factors, factor],
                                }));
                              } else {
                                setReportForm((prev) => ({
                                  ...prev,
                                  risk_factors: prev.risk_factors.filter(
                                    (f) => f !== factor
                                  ),
                                }));
                              }
                            }}
                          />
                          <span className="text-sm">
                            {factor.replace("_", " ")}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="planned_itinerary">Planned Itinerary</Label>
                    <Textarea
                      id="planned_itinerary"
                      value={reportForm.planned_itinerary}
                      onChange={(e) =>
                        setReportForm((prev) => ({
                          ...prev,
                          planned_itinerary: e.target.value,
                        }))
                      }
                      placeholder="Planned destinations, travel route, schedule..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Emergency Contacts</Label>
                    {reportForm.emergency_contacts.map((contact, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2 mt-2">
                        <Input
                          value={contact.name}
                          onChange={(e) => {
                            const newContacts = [
                              ...reportForm.emergency_contacts,
                            ];
                            newContacts[index].name = e.target.value;
                            setReportForm((prev) => ({
                              ...prev,
                              emergency_contacts: newContacts,
                            }));
                          }}
                          placeholder="Name"
                        />
                        <Input
                          value={contact.relationship}
                          onChange={(e) => {
                            const newContacts = [
                              ...reportForm.emergency_contacts,
                            ];
                            newContacts[index].relationship = e.target.value;
                            setReportForm((prev) => ({
                              ...prev,
                              emergency_contacts: newContacts,
                            }));
                          }}
                          placeholder="Relationship"
                        />
                        <Input
                          value={contact.phone}
                          onChange={(e) => {
                            const newContacts = [
                              ...reportForm.emergency_contacts,
                            ];
                            newContacts[index].phone = e.target.value;
                            setReportForm((prev) => ({
                              ...prev,
                              emergency_contacts: newContacts,
                            }));
                          }}
                          placeholder="Phone"
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setReportForm((prev) => ({
                          ...prev,
                          emergency_contacts: [
                            ...prev.emergency_contacts,
                            {
                              name: "",
                              relationship: "",
                              phone: "",
                              contacted: false,
                            },
                          ],
                        }));
                      }}
                    >
                      Add Contact
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleReportMissingPerson}
                  disabled={
                    loading ||
                    !reportForm.tourist_name ||
                    !reportForm.reporter_name
                  }
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Report
                </Button>
              </div>
            </div>
          )}

          {/* Search Operations Tab */}
          {activeTab === "search" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Active Search Operations
              </h3>
              {searchOperations.map((operation) => (
                <Card key={operation.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold mb-2">
                          {operation.operation_name}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            Started:{" "}
                            {new Date(operation.start_time).toLocaleString()}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            Radius:{" "}
                            {(operation.search_area.radius / 1000).toFixed(
                              1
                            )}{" "}
                            km
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Shield className="h-4 w-4 mr-1" />
                            Teams: {operation.assigned_teams.length}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="font-medium">Assigned Teams:</h5>
                          {operation.assigned_teams.map((team) => (
                            <div
                              key={team.team_id}
                              className="flex items-center justify-between p-2 bg-muted rounded"
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {team.team_type}
                                </Badge>
                                <span className="text-sm">
                                  {team.team_name}
                                </span>
                              </div>
                              <Badge
                                className={
                                  team.status === "active"
                                    ? "bg-green-500"
                                    : team.status === "assigned"
                                    ? "bg-blue-500"
                                    : "bg-gray-500"
                                }
                              >
                                {team.status}
                              </Badge>
                            </div>
                          ))}
                        </div>

                        {operation.findings.length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-medium">Recent Findings:</h5>
                            {operation.findings.map((finding) => (
                              <div
                                key={finding.id}
                                className="mt-2 p-3 bg-blue-50 rounded"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline">
                                    {finding.type}
                                  </Badge>
                                  {finding.verified && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                </div>
                                <p className="text-sm">{finding.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(finding.timestamp).toLocaleString()}{" "}
                                  - {finding.reported_by}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Manage Cases Tab */}
          {activeTab === "manage" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Missing Person Cases</h3>
              {missingPersons.map((person) => (
                <Card
                  key={person.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(person.status)}
                          <h4 className="text-lg font-semibold">
                            {person.tourist_name}
                          </h4>
                          <Badge className={getPriorityColor(person.priority)}>
                            {person.priority} Priority
                          </Badge>
                          <Badge variant="outline">
                            {person.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            Last seen:{" "}
                            {person.last_known_location.latitude.toFixed(
                              4
                            )},{" "}
                            {person.last_known_location.longitude.toFixed(4)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            Missing since:{" "}
                            {new Date(person.missing_since).toLocaleString()}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <User className="h-4 w-4 mr-1" />
                            Reported by: {person.reporter_name}
                          </div>
                        </div>

                        {person.description && (
                          <div className="mb-4">
                            <h5 className="font-medium mb-1">Description:</h5>
                            <p className="text-sm text-muted-foreground">
                              {person.description}
                            </p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <h5 className="font-medium">Risk Factors:</h5>
                          <div className="flex flex-wrap gap-2">
                            {person.risk_factors.map((factor, index) => (
                              <Badge key={index} variant="secondary">
                                {factor.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {person.emergency_contacts &&
                          person.emergency_contacts.length > 0 && (
                            <div className="mt-4">
                              <h5 className="font-medium">
                                Emergency Contacts:
                              </h5>
                              <div className="space-y-1 mt-2">
                                {person.emergency_contacts.map(
                                  (contact, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <span>
                                        {contact.name} ({contact.relationship})
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">
                                          {contact.phone}
                                        </span>
                                        {contact.contacted ? (
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                          <Button size="sm" variant="outline">
                                            <Phone className="h-3 w-3 mr-1" />
                                            Call
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {person.status === "reported" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleLaunchSearch(person.id)}
                          >
                            <Search className="h-4 w-4 mr-1" />
                            Launch Search
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-1" />
                          Contact Reporter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MissingPersonAlertSystem;
