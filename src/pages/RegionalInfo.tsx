import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Cloud,
  Calendar,
  Car,
  Plane,
  Train,
  Info,
  Users,
  Camera,
  Mountain,
  TreePine,
  Waves,
  Sun,
  CloudRain,
  Snowflake,
  Thermometer,
  Clock,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import LanguageSelector from "@/components/LanguageSelector";

const RegionalInfo = () => {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState("assam");

  const states = {
    assam: {
      name: "Assam",
      capital: "Dispur",
      population: "31.2 million",
      area: "78,438 km²",
      languages: ["Assamese", "Bengali", "Hindi", "English"],
      bestTime: "October to April",
      permits: "No special permits required",
      specialNote: "Gateway to Northeast India",
      attractions: [
        {
          name: "Kaziranga National Park",
          type: "Wildlife",
          description:
            "Home to two-thirds of the world's one-horned rhinoceros",
          season: "November to April",
          accessibility: "Good road connectivity",
        },
        {
          name: "Majuli Island",
          type: "Cultural",
          description:
            "World's largest river island with rich Vaishnavite culture",
          season: "October to March",
          accessibility: "Ferry from Jorhat",
        },
        {
          name: "Tea Gardens",
          type: "Scenic",
          description: "Sprawling tea estates offering stunning landscapes",
          season: "Year-round",
          accessibility: "Excellent road access",
        },
      ],
      weather: {
        summer: { temp: "25-35°C", description: "Hot and humid with monsoons" },
        winter: { temp: "10-25°C", description: "Pleasant and dry" },
        monsoon: {
          temp: "20-30°C",
          description: "Heavy rainfall June-September",
        },
      },
      transport: {
        air: "Lokpriya Gopinath Bordoloi International Airport, Guwahati",
        rail: "Well connected by Northeast Frontier Railway",
        road: "National highways and state highways in good condition",
      },
      culture: {
        festivals: ["Bihu", "Durga Puja", "Poila Boishakh"],
        cuisine: ["Fish curry", "Rice", "Assam tea", "Pitha"],
        crafts: ["Silk weaving", "Bell metal craft", "Bamboo products"],
      },
    },
    meghalaya: {
      name: "Meghalaya",
      capital: "Shillong",
      population: "3.0 million",
      area: "22,429 km²",
      languages: ["Khasi", "Garo", "Jaintia", "English"],
      bestTime: "October to June",
      permits: "No permits required",
      specialNote: "Scotland of the East",
      attractions: [
        {
          name: "Living Root Bridges",
          type: "Natural Wonder",
          description: "Unique bridges grown from rubber tree roots",
          season: "October to March",
          accessibility: "Trekking required",
        },
        {
          name: "Cherrapunji",
          type: "Scenic",
          description: "One of the wettest places on Earth",
          season: "November to February",
          accessibility: "Good road connectivity",
        },
        {
          name: "Dawki River",
          type: "Adventure",
          description: "Crystal clear waters perfect for boating",
          season: "October to May",
          accessibility: "2-hour drive from Shillong",
        },
      ],
      weather: {
        summer: { temp: "15-25°C", description: "Pleasant and cool" },
        winter: { temp: "5-20°C", description: "Cold and dry" },
        monsoon: { temp: "20-25°C", description: "Extremely heavy rainfall" },
      },
      transport: {
        air: "Shillong Airport (under development), use Guwahati Airport",
        rail: "Nearest railway station at Guwahati (100 km)",
        road: "Well-maintained hill roads, can be challenging during monsoons",
      },
      culture: {
        festivals: ["Wangala", "Shad Suk Mynsiem", "Behdienkhlam"],
        cuisine: ["Jadoh", "Tungrymbai", "Dohneiiong"],
        crafts: ["Cane and bamboo", "Traditional textiles", "Wood carving"],
      },
    },
    arunachal: {
      name: "Arunachal Pradesh",
      capital: "Itanagar",
      population: "1.4 million",
      area: "83,743 km²",
      languages: ["Hindi", "English", "Local tribal languages"],
      bestTime: "October to April",
      permits: "Inner Line Permit required",
      specialNote: "Land of the Rising Sun",
      attractions: [
        {
          name: "Tawang Monastery",
          type: "Spiritual",
          description: "Largest monastery in India, 400 years old",
          season: "March to October",
          accessibility: "High altitude, winter closure",
        },
        {
          name: "Ziro Valley",
          type: "Cultural",
          description: "UNESCO World Heritage site, home to Apatani tribe",
          season: "March to October",
          accessibility: "Good road connectivity",
        },
        {
          name: "Namdapha National Park",
          type: "Wildlife",
          description: "Biodiversity hotspot with rare species",
          season: "October to March",
          accessibility: "Limited accommodation",
        },
      ],
      weather: {
        summer: {
          temp: "15-30°C",
          description: "Pleasant in valleys, cool in hills",
        },
        winter: { temp: "0-15°C", description: "Very cold in high altitudes" },
        monsoon: {
          temp: "20-25°C",
          description: "Heavy rainfall, landslides possible",
        },
      },
      transport: {
        air: "Pasighat Airport, Tezu Airport (limited flights)",
        rail: "Nearest station at Naharlagun",
        road: "Challenging mountain roads, some areas restricted",
      },
      culture: {
        festivals: ["Losar", "Mopin", "Solung"],
        cuisine: ["Thukpa", "Momos", "Apong (rice beer)"],
        crafts: ["Handloom textiles", "Bamboo items", "Wood carving"],
      },
    },
    manipur: {
      name: "Manipur",
      capital: "Imphal",
      population: "2.9 million",
      area: "22,327 km²",
      languages: ["Manipuri", "English", "Hindi"],
      bestTime: "October to March",
      permits: "Restricted Area Permit for some areas",
      specialNote: "Jewel of India",
      attractions: [
        {
          name: "Loktak Lake",
          type: "Natural",
          description: "Largest freshwater lake in Northeast India",
          season: "November to February",
          accessibility: "45 km from Imphal",
        },
        {
          name: "Kangla Fort",
          type: "Historical",
          description: "Ancient seat of Manipur rulers",
          season: "Year-round",
          accessibility: "In Imphal city",
        },
        {
          name: "Keibul Lamjao National Park",
          type: "Wildlife",
          description: "World's only floating national park",
          season: "November to February",
          accessibility: "Boat required",
        },
      ],
      weather: {
        summer: { temp: "20-35°C", description: "Warm and humid" },
        winter: { temp: "5-25°C", description: "Pleasant and dry" },
        monsoon: {
          temp: "20-30°C",
          description: "Heavy monsoons June-September",
        },
      },
      transport: {
        air: "Imphal International Airport",
        rail: "Jiribam railway station (nearest)",
        road: "Good connectivity within state",
      },
      culture: {
        festivals: ["Lai Haraoba", "Yaoshang", "Kang Chingba"],
        cuisine: ["Eromba", "Nga thongba", "Singju"],
        crafts: ["Handloom", "Pottery", "Jewellery"],
      },
    },
  };

  const currentState = states[selectedState as keyof typeof states];

  const getSafetyRating = (stateName: string) => {
    const ratings: { [key: string]: number } = {
      Assam: 85,
      Meghalaya: 90,
      "Arunachal Pradesh": 75,
      Manipur: 80,
    };
    return ratings[stateName] || 80;
  };

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
                <MapPin className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Regional Information</h1>
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
        {/* State Selector */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Northeast India Regional Guide
              </h1>
              <p className="text-muted-foreground">
                Comprehensive information for each state in Northeast India
              </p>
            </div>
            <div className="w-full md:w-64 mt-4 md:mt-0">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(states).map(([key, state]) => (
                    <SelectItem key={key} value={key}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* State Overview */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{currentState.name}</CardTitle>
                <CardDescription>{currentState.specialNote}</CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {currentState.capital}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {currentState.population}
                </div>
                <div className="text-sm text-muted-foreground">Population</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {currentState.area}
                </div>
                <div className="text-sm text-muted-foreground">Area</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {currentState.bestTime}
                </div>
                <div className="text-sm text-muted-foreground">Best Time</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <div className="text-2xl font-bold text-primary">
                    {getSafetyRating(currentState.name)}%
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-sm text-muted-foreground">
                  Safety Rating
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Safety Score</h4>
              <Progress
                value={getSafetyRating(currentState.name)}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Languages Spoken</h4>
                <div className="flex flex-wrap gap-2">
                  {currentState.languages.map((lang, index) => (
                    <Badge key={index} variant="secondary">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Permit Requirements</h4>
                <div
                  className={`flex items-center space-x-2 ${
                    currentState.permits.includes("No")
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {currentState.permits.includes("No") ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <span className="text-sm">{currentState.permits}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="attractions" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="attractions">Attractions</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
            <TabsTrigger value="culture">Culture</TabsTrigger>
          </TabsList>

          <TabsContent value="attractions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentState.attractions.map((attraction, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {attraction.name}
                      </CardTitle>
                      <Badge variant="outline">{attraction.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {attraction.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>Best time: {attraction.season}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Car className="h-4 w-4 text-primary" />
                        <span>{attraction.accessibility}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="weather" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sun className="h-5 w-5 text-orange-500" />
                    <span>Summer</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {currentState.weather.summer.temp}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentState.weather.summer.description}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Snowflake className="h-5 w-5 text-blue-500" />
                    <span>Winter</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {currentState.weather.winter.temp}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentState.weather.winter.description}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CloudRain className="h-5 w-5 text-gray-500" />
                    <span>Monsoon</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {currentState.weather.monsoon.temp}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentState.weather.monsoon.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transport" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plane className="h-5 w-5 text-blue-500" />
                    <span>Air Travel</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{currentState.transport.air}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Train className="h-5 w-5 text-green-500" />
                    <span>Rail Travel</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{currentState.transport.rail}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-orange-500" />
                    <span>Road Travel</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{currentState.transport.road}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="culture" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <span>Festivals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentState.culture.festivals.map((festival, index) => (
                      <Badge key={index} variant="outline">
                        {festival}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-red-500" />
                    <span>Cuisine</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentState.culture.cuisine.map((dish, index) => (
                      <Badge key={index} variant="outline">
                        {dish}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5 text-yellow-500" />
                    <span>Crafts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentState.culture.crafts.map((craft, index) => (
                      <Badge key={index} variant="outline">
                        {craft}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                Plan Your Visit to {currentState.name}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Ready to explore {currentState.name}? Register with GoSafe for
                personalized travel recommendations and real-time safety
                updates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate("/auth/signup")}>
                  <MapPin className="mr-2 h-5 w-5" />
                  Register for Safe Travel
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/travel-resources")}
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  More Resources
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegionalInfo;
