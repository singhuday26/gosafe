import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Info,
  Book,
  Download,
  ExternalLink,
  Search,
  Filter,
  Globe,
  Clock,
  Shield,
  Heart,
  Camera,
  Utensils,
  Home,
  Car,
  AlertTriangle,
  CheckCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LanguageSelector from "@/components/LanguageSelector";

const TravelResources = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("all");

  const states = [
    { value: "assam", label: "Assam" },
    { value: "arunachal", label: "Arunachal Pradesh" },
    { value: "manipur", label: "Manipur" },
    { value: "meghalaya", label: "Meghalaya" },
    { value: "mizoram", label: "Mizoram" },
    { value: "nagaland", label: "Nagaland" },
    { value: "sikkim", label: "Sikkim" },
    { value: "tripura", label: "Tripura" },
  ];

  const quickLinks = [
    {
      title: "Emergency Contacts",
      description: "Essential emergency numbers and contact information",
      icon: <Phone className="h-6 w-6" />,
      onClick: () => navigate("/emergency-contacts"),
      urgent: true,
    },
    {
      title: "Regional Information",
      description: "Detailed guides for each state in Northeast India",
      icon: <MapPin className="h-6 w-6" />,
      onClick: () => navigate("/regional-info"),
    },
    {
      title: "Cultural Guidelines",
      description: "Respectful travel practices and cultural etiquette",
      icon: <Book className="h-6 w-6" />,
      onClick: () => navigate("/cultural-guidelines"),
    },
    {
      title: "Safety Guidelines",
      description: "Comprehensive safety tips and best practices",
      icon: <Shield className="h-6 w-6" />,
      onClick: () => navigate("/safety-guidelines"),
    },
  ];

  const resources = [
    {
      category: "Essential Information",
      items: [
        {
          title: "Travel Permits & Documentation",
          description: "Required permits for visiting restricted areas",
          type: "Guide",
          state: "all",
          downloadable: true,
        },
        {
          title: "Weather Patterns & Best Seasons",
          description: "Seasonal travel guide with weather information",
          type: "Guide",
          state: "all",
          downloadable: true,
        },
        {
          title: "Transportation Networks",
          description: "Complete guide to public and private transport",
          type: "Guide",
          state: "all",
          downloadable: false,
        },
      ],
    },
    {
      category: "Accommodation",
      items: [
        {
          title: "Verified Homestays Directory",
          description: "Authentic local accommodation experiences",
          type: "Directory",
          state: "all",
          downloadable: false,
        },
        {
          title: "Budget Hotel Listings",
          description: "Affordable and safe accommodation options",
          type: "Directory",
          state: "all",
          downloadable: false,
        },
        {
          title: "Luxury Resort Guide",
          description: "Premium accommodation with full amenities",
          type: "Guide",
          state: "all",
          downloadable: true,
        },
      ],
    },
    {
      category: "Local Experiences",
      items: [
        {
          title: "Festival Calendar",
          description: "Traditional festivals and cultural celebrations",
          type: "Calendar",
          state: "all",
          downloadable: true,
        },
        {
          title: "Local Cuisine Guide",
          description: "Must-try dishes and food safety tips",
          type: "Guide",
          state: "all",
          downloadable: true,
        },
        {
          title: "Photography Guidelines",
          description: "Respectful photography practices and restrictions",
          type: "Guide",
          state: "all",
          downloadable: true,
        },
      ],
    },
  ];

  const stateHighlights = [
    {
      state: "Assam",
      highlights: ["Kaziranga National Park", "Majuli Island", "Tea Gardens"],
      specialNotes: "Home to one-horned rhinoceros",
    },
    {
      state: "Meghalaya",
      highlights: ["Living Root Bridges", "Cherrapunji", "Dawki River"],
      specialNotes: "Wettest place on Earth",
    },
    {
      state: "Arunachal Pradesh",
      highlights: ["Tawang Monastery", "Ziro Valley", "Namdapha National Park"],
      specialNotes: "Land of the rising sun",
    },
    {
      state: "Manipur",
      highlights: ["Loktak Lake", "Imphal Valley", "Kangla Fort"],
      specialNotes: "Jewel of India",
    },
  ];

  const filteredResources = resources
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          (selectedState === "all" ||
            item.state === selectedState ||
            item.state === "all") &&
          (searchQuery === "" ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-2">
                <Book className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Travel Resources</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Button onClick={() => navigate("/auth/signup")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Complete Travel Resources for Northeast India
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to plan, prepare, and enjoy your journey through
            the beautiful states of Northeast India. From essential
            documentation to cultural insights.
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickLinks.map((link, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                link.urgent ? "border-red-200 bg-red-50/50" : ""
              }`}
              onClick={link.onClick}
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`inline-flex p-3 rounded-full mb-3 ${
                    link.urgent
                      ? "bg-red-100 text-red-600"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {link.icon}
                </div>
                <h3 className="font-semibold mb-2">{link.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {link.description}
                </p>
                {link.urgent && (
                  <Badge variant="destructive" className="mt-2">
                    Emergency Access
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find Resources</CardTitle>
            <CardDescription>
              Search for specific travel information or filter by state
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {states.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="resources" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resources">Resource Library</TabsTrigger>
            <TabsTrigger value="highlights">State Highlights</TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="space-y-6">
            {filteredResources.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="h-5 w-5" />
                    <span>{category.category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.items.map((item, itemIndex) => (
                      <Card
                        key={itemIndex}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline">{item.type}</Badge>
                            {item.downloadable && (
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <h4 className="font-semibold mb-2">{item.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {item.description}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Access Resource
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="highlights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stateHighlights.map((state, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span>{state.state}</span>
                    </CardTitle>
                    <CardDescription>{state.specialNotes}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold mb-2">
                          Must-Visit Places:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {state.highlights.map((highlight, idx) => (
                            <Badge key={idx} variant="secondary">
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Info className="h-4 w-4 mr-2" />
                        Detailed State Guide
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Additional Resources */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Additional Resources</CardTitle>
            <CardDescription>
              External links and government resources for comprehensive travel
              planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Official Tourism Boards</h4>
                <div className="space-y-2 text-sm">
                  <a
                    href="#"
                    className="text-primary hover:underline flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Assam Tourism
                  </a>
                  <a
                    href="#"
                    className="text-primary hover:underline flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Meghalaya Tourism
                  </a>
                  <a
                    href="#"
                    className="text-primary hover:underline flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Arunachal Tourism
                  </a>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Travel Planning</h4>
                <div className="space-y-2 text-sm">
                  <a
                    href="#"
                    className="text-primary hover:underline flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Weather Updates
                  </a>
                  <a
                    href="#"
                    className="text-primary hover:underline flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Road Conditions
                  </a>
                  <a
                    href="#"
                    className="text-primary hover:underline flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Flight Information
                  </a>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Emergency Services</h4>
                <div className="space-y-2 text-sm">
                  <a
                    href="#"
                    className="text-primary hover:underline flex items-center"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    National Emergency: 112
                  </a>
                  <a
                    href="#"
                    className="text-primary hover:underline flex items-center"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Tourist Helpline: 1363
                  </a>
                  <a
                    href="#"
                    className="text-primary hover:underline flex items-center"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Medical Emergency: 108
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Register with GoSafe to access personalized travel
                recommendations, real-time safety updates, and emergency support
                throughout your trip.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate("/auth/signup")}>
                  <Shield className="mr-2 h-5 w-5" />
                  Register Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/demo")}
                >
                  <Globe className="mr-2 h-5 w-5" />
                  View Platform Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TravelResources;
