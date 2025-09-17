import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Users,
  Camera,
  ShoppingBag,
  Utensils,
  Home,
  Shirt,
  Gift,
  Book,
  AlertTriangle,
  CheckCircle,
  Info,
  Star,
  Globe,
  Handshake,
  Eye,
  MessageCircle,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import LanguageSelector from "@/components/LanguageSelector";

const CulturalGuidelines = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("respect");

  const guidelines = {
    respect: {
      title: "Cultural Respect & Sensitivity",
      icon: <Heart className="h-6 w-6" />,
      items: [
        {
          title: "Sacred Sites & Monasteries",
          description:
            "Remove shoes before entering temples and monasteries. Dress modestly with covered shoulders and knees.",
          importance: "critical",
          tips: [
            "Carry a scarf for covering",
            "Ask permission before taking photos",
            "Maintain silence in prayer areas",
          ],
        },
        {
          title: "Local Communities",
          description:
            "Many communities are protective of their traditions. Always ask permission before photographing people.",
          importance: "high",
          tips: [
            "Learn basic greetings in local language",
            "Show genuine interest in local customs",
            "Respect personal space",
          ],
        },
        {
          title: "Traditional Festivals",
          description:
            "Participate respectfully in local festivals when invited. Understand the significance before joining.",
          importance: "medium",
          tips: [
            "Ask locals about appropriate behavior",
            "Follow dress codes",
            "Don't interrupt ceremonies",
          ],
        },
      ],
    },
    clothing: {
      title: "Dress Code & Attire",
      icon: <Shirt className="h-6 w-6" />,
      items: [
        {
          title: "Religious Sites",
          description:
            "Conservative dress is mandatory. Full sleeves, long pants/skirts, head covering may be required.",
          importance: "critical",
          tips: [
            "Carry a dupatta or shawl",
            "Avoid tight-fitting clothes",
            "Remove leather items if required",
          ],
        },
        {
          title: "Villages & Rural Areas",
          description:
            "Modest clothing shows respect for local sensibilities, especially in traditional communities.",
          importance: "high",
          tips: [
            "Avoid revealing clothing",
            "Choose earth tones over bright colors",
            "Comfortable walking shoes are essential",
          ],
        },
        {
          title: "Weather Considerations",
          description:
            "Layer clothing for varying altitudes and weather conditions while maintaining modesty.",
          importance: "medium",
          tips: [
            "Waterproof jacket for monsoons",
            "Warm layers for high altitudes",
            "Breathable fabrics for humidity",
          ],
        },
      ],
    },
    interaction: {
      title: "Social Interactions",
      icon: <Users className="h-6 w-6" />,
      items: [
        {
          title: "Greetings & Communication",
          description:
            "Use 'Namaste' with palms together. Many locals may not speak Hindi or English fluently.",
          importance: "high",
          tips: [
            "Learn local greetings",
            "Speak slowly and clearly",
            "Use hand gestures respectfully",
          ],
        },
        {
          title: "Gender Interactions",
          description:
            "Be mindful of local customs regarding interactions between men and women in traditional areas.",
          importance: "high",
          tips: [
            "Follow local lead in mixed groups",
            "Respect personal boundaries",
            "Ask about local customs",
          ],
        },
        {
          title: "Elder Respect",
          description:
            "Elders are highly respected. Stand when they enter, seek blessings, and listen to their stories.",
          importance: "medium",
          tips: [
            "Touch feet for blessings (if appropriate)",
            "Listen attentively to advice",
            "Offer seat to elders",
          ],
        },
      ],
    },
    photography: {
      title: "Photography Ethics",
      icon: <Camera className="h-6 w-6" />,
      items: [
        {
          title: "People & Portraits",
          description:
            "Always ask permission before photographing individuals. Some communities may refuse or request payment.",
          importance: "critical",
          tips: [
            "Learn to ask permission in local language",
            "Respect a 'no' answer",
            "Offer to share photos later",
          ],
        },
        {
          title: "Sacred & Restricted Areas",
          description:
            "Many religious sites, military areas, and tribal regions have photography restrictions.",
          importance: "critical",
          tips: [
            "Check for photography signs",
            "Ask guides about restrictions",
            "Don't use flash in temples",
          ],
        },
        {
          title: "Cultural Ceremonies",
          description:
            "Some rituals are private or sacred. Always ask before documenting cultural practices.",
          importance: "high",
          tips: [
            "Observe first, photograph later",
            "Don't interrupt ceremonies for photos",
            "Understand significance before shooting",
          ],
        },
      ],
    },
    food: {
      title: "Food & Dining Etiquette",
      icon: <Utensils className="h-6 w-6" />,
      items: [
        {
          title: "Traditional Meals",
          description:
            "Many families eat with hands. Wait to be shown how to eat properly and what utensils to use.",
          importance: "medium",
          tips: [
            "Watch and follow host",
            "Use right hand for eating",
            "Don't waste food",
          ],
        },
        {
          title: "Dietary Restrictions",
          description:
            "Many locals are vegetarian or have specific dietary rules. Inform hosts of your restrictions.",
          importance: "high",
          tips: [
            "Clearly communicate allergies",
            "Respect religious dietary laws",
            "Try local specialties respectfully",
          ],
        },
        {
          title: "Sharing Meals",
          description:
            "Sharing food is a sign of friendship. Accept graciously but communicate if you cannot eat something.",
          importance: "medium",
          tips: [
            "Accept offerings graciously",
            "Explain dietary restrictions politely",
            "Appreciate the gesture",
          ],
        },
      ],
    },
    shopping: {
      title: "Shopping & Bargaining",
      icon: <ShoppingBag className="h-6 w-6" />,
      items: [
        {
          title: "Handicrafts & Textiles",
          description:
            "Support local artisans by buying authentic handicrafts. Learn about the craft before purchasing.",
          importance: "medium",
          tips: [
            "Ask about the making process",
            "Buy directly from artisans when possible",
            "Appreciate the cultural significance",
          ],
        },
        {
          title: "Bargaining Ethics",
          description:
            "Gentle bargaining is expected, but be fair. Remember the livelihood depends on these sales.",
          importance: "medium",
          tips: [
            "Start at 60-70% of asking price",
            "Be respectful in negotiations",
            "Pay fair prices for quality work",
          ],
        },
        {
          title: "Authentic vs. Commercial",
          description:
            "Distinguish between authentic cultural items and mass-produced souvenirs.",
          importance: "low",
          tips: [
            "Ask about origin and authenticity",
            "Support traditional crafts",
            "Avoid items that may harm wildlife",
          ],
        },
      ],
    },
  };

  const importanceColors = {
    critical: "text-red-600 bg-red-50 border-red-200",
    high: "text-orange-600 bg-orange-50 border-orange-200",
    medium: "text-blue-600 bg-blue-50 border-blue-200",
    low: "text-gray-600 bg-gray-50 border-gray-200",
  };

  const importanceIcons = {
    critical: <AlertTriangle className="h-4 w-4" />,
    high: <Info className="h-4 w-4" />,
    medium: <CheckCircle className="h-4 w-4" />,
    low: <Star className="h-4 w-4" />,
  };

  const quickTips = [
    "Learn basic phrases in local languages",
    "Carry small gifts from your home country",
    "Be patient with different time concepts",
    "Show genuine interest in local culture",
    "Respect nature and sacred groves",
    "Support local economy responsibly",
  ];

  const commonPhrases = {
    Assamese: {
      Hello: "Namaskar",
      "Thank you": "Dhonnobad",
      Please: "Kripa kori",
      "Excuse me": "Maaph koribi",
    },
    Khasi: {
      Hello: "Khublei",
      "Thank you": "Khublei shibun",
      Please: "Ngam",
      "Excuse me": "Sngewbha",
    },
    Manipuri: {
      Hello: "Khurumjari",
      "Thank you": "Thaagatchari",
      Please: "Chaanbiyu",
      "Excuse me": "Nikhumlakpa",
    },
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
                <Heart className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Cultural Guidelines</h1>
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
            Cultural Guidelines for Northeast India
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Respectful travel practices to ensure meaningful interactions with
            local communities while preserving the rich cultural heritage of
            Northeast India.
          </p>
        </div>

        {/* Important Notice */}
        <Alert className="mb-8 border-amber-200 bg-amber-50">
          <Globe className="h-4 w-4" />
          <AlertDescription>
            Northeast India is home to over 200 tribes with unique customs and
            traditions. These guidelines help ensure respectful interactions
            while enriching your travel experience.
          </AlertDescription>
        </Alert>

        {/* Quick Tips */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Quick Cultural Tips</span>
            </CardTitle>
            <CardDescription>
              Essential practices for respectful cultural interaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickTips.map((tip, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{tip}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="respect" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {Object.entries(guidelines).map(([key, category]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                <div className="flex items-center space-x-1">
                  {category.icon}
                  <span className="hidden sm:inline">
                    {category.title.split(" ")[0]}
                  </span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(guidelines).map(([key, category]) => (
            <TabsContent key={key} value={key} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{category.title}</h2>
              </div>

              <div className="grid gap-6">
                {category.items.map((item, index) => (
                  <Card
                    key={index}
                    className={`border-l-4 ${
                      item.importance === "critical"
                        ? "border-l-red-500"
                        : item.importance === "high"
                        ? "border-l-orange-500"
                        : item.importance === "medium"
                        ? "border-l-blue-500"
                        : "border-l-gray-500"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <Badge
                          variant="outline"
                          className={`${
                            importanceColors[
                              item.importance as keyof typeof importanceColors
                            ]
                          } flex items-center space-x-1`}
                        >
                          {
                            importanceIcons[
                              item.importance as keyof typeof importanceIcons
                            ]
                          }
                          <span className="capitalize">{item.importance}</span>
                        </Badge>
                      </div>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">
                          Practical Tips:
                        </h4>
                        <ul className="space-y-1">
                          {item.tips.map((tip, tipIndex) => (
                            <li
                              key={tipIndex}
                              className="flex items-start space-x-2 text-sm"
                            >
                              <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Common Phrases */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <span>Common Phrases</span>
            </CardTitle>
            <CardDescription>
              Basic phrases in major Northeast Indian languages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(commonPhrases).map(([language, phrases]) => (
                <div key={language}>
                  <h4 className="font-semibold mb-3 text-primary">
                    {language}
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(phrases).map(([english, local]) => (
                      <div
                        key={english}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {english}:
                        </span>
                        <span className="font-medium">{local}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cultural Do's and Don'ts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span>Cultural Do's</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Show genuine interest in local traditions and festivals
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Ask permission before entering homes or sacred spaces
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Support local artisans and traditional crafts</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Respect environmental conservation practices</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Learn about the historical significance of places you visit
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span>Cultural Don'ts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Don't photograph people without explicit permission
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Don't wear revealing clothing in traditional areas
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>Don't touch or disturb sacred objects or sites</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Don't bargain aggressively or unfairly with local vendors
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>Don't litter or damage the natural environment</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                Travel Responsibly with GoSafe
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join our platform to access real-time cultural insights, connect
                with local guides, and ensure your journey respects and
                celebrates Northeast India's rich heritage.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate("/auth/signup")}>
                  <Handshake className="mr-2 h-5 w-5" />
                  Register for Cultural Insights
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/travel-resources")}
                >
                  <Book className="mr-2 h-5 w-5" />
                  Explore More Resources
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CulturalGuidelines;
