import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  MessageCircle,
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  Headphones,
  Globe,
  Shield,
  AlertTriangle,
  FileText,
  Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TouristSupport: React.FC = () => {
  const navigate = useNavigate();

  const supportChannels = [
    {
      icon: Phone,
      title: "24/7 Helpline",
      description: "Immediate assistance for emergencies and urgent queries",
      contact: "+91-8800-GOSAFE",
      action: "Call Now",
      availability: "Available 24/7",
      languages: ["English", "Hindi", "Assamese", "Bengali"],
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Support",
      description: "Quick support via messaging for non-emergency queries",
      contact: "+91-8800-GOSAFE",
      action: "Chat Now",
      availability: "6 AM - 10 PM",
      languages: ["English", "Hindi", "Local languages"],
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Detailed assistance for complex queries and documentation",
      contact: "support@gosafe.gov.in",
      action: "Send Email",
      availability: "Response within 2 hours",
      languages: ["English", "Hindi"],
    },
    {
      icon: Globe,
      title: "Online Chat",
      description: "Real-time chat support through GoSafe website",
      contact: "Live Chat Widget",
      action: "Start Chat",
      availability: "8 AM - 8 PM",
      languages: ["English", "Hindi", "Regional languages"],
    },
  ];

  const supportCategories = [
    {
      icon: AlertTriangle,
      title: "Emergency Assistance",
      description: "Immediate help during crisis situations",
      services: [
        "SOS response coordination",
        "Emergency contact notification",
        "Medical emergency assistance",
        "Police coordination",
        "Evacuation support",
      ],
    },
    {
      icon: FileText,
      title: "Documentation Help",
      description: "Assistance with permits and official procedures",
      services: [
        "Travel permit guidance",
        "Registration assistance",
        "Document verification",
        "Permit renewal help",
        "Official correspondence",
      ],
    },
    {
      icon: MapPin,
      title: "Location Services",
      description: "Navigation and location-based assistance",
      services: [
        "Route planning guidance",
        "Safe zone identification",
        "Local contact information",
        "Transportation advice",
        "Accommodation recommendations",
      ],
    },
    {
      icon: Heart,
      title: "Medical Support",
      description: "Health-related assistance and guidance",
      services: [
        "Hospital location guidance",
        "Medical emergency coordination",
        "Pharmacy information",
        "Health advisory services",
        "Telemedicine connections",
      ],
    },
  ];

  const regionalContacts = [
    {
      state: "Assam",
      coordinator: "Tourist Control Room",
      phone: "+91-361-2548021",
      email: "tourism.assam@gov.in",
      languages: ["Assamese", "English", "Hindi", "Bengali"],
    },
    {
      state: "Arunachal Pradesh",
      coordinator: "Tourist Helpdesk",
      phone: "+91-360-2212163",
      email: "tourism.arunachal@gov.in",
      languages: ["English", "Hindi", "Local dialects"],
    },
    {
      state: "Meghalaya",
      coordinator: "Tourism Support Center",
      phone: "+91-364-2224282",
      email: "tourism.meghalaya@gov.in",
      languages: ["Khasi", "Garo", "English", "Hindi"],
    },
    {
      state: "Sikkim",
      coordinator: "Tourist Information Center",
      phone: "+91-3592-202751",
      email: "tourism.sikkim@gov.in",
      languages: ["Nepali", "English", "Hindi", "Lepcha"],
    },
    {
      state: "Manipur",
      coordinator: "Tourist Assistance Cell",
      phone: "+91-385-2451744",
      email: "tourism.manipur@gov.in",
      languages: ["Manipuri", "English", "Hindi"],
    },
    {
      state: "Mizoram",
      coordinator: "Tourism Help Center",
      phone: "+91-389-2323647",
      email: "tourism.mizoram@gov.in",
      languages: ["Mizo", "English", "Hindi"],
    },
    {
      state: "Nagaland",
      coordinator: "Tourist Support Office",
      phone: "+91-370-2226253",
      email: "tourism.nagaland@gov.in",
      languages: ["English", "Hindi", "Naga dialects"],
    },
    {
      state: "Tripura",
      coordinator: "Tourism Information Bureau",
      phone: "+91-381-2381473",
      email: "tourism.tripura@gov.in",
      languages: ["Bengali", "Tripuri", "English", "Hindi"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>

            <div className="text-center">
              <Badge variant="secondary" className="mb-4">
                <Headphones className="mr-1 h-4 w-4" />
                Tourist Support
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-700">
                Tourist Support Center
              </h1>
              <p className="text-xl text-blue-600 mb-6">
                Comprehensive assistance for tourists traveling in Northeast
                India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Contact Support</h2>
              <p className="text-xl text-muted-foreground">
                Multiple ways to get help when you need it
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {supportChannels.map((channel, index) => (
                <Card
                  key={index}
                  className="border-primary/10 hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div className="bg-primary/10 p-3 rounded-lg mr-3">
                        <channel.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div>{channel.title}</div>
                        <div className="text-sm text-muted-foreground font-normal">
                          {channel.availability}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {channel.description}
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{channel.contact}</span>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (
                              channel.title === "24/7 Helpline" ||
                              channel.title === "WhatsApp Support"
                            ) {
                              window.open(`tel:${channel.contact}`, "_blank");
                            } else if (channel.title === "Email Support") {
                              window.open(
                                `mailto:${channel.contact}`,
                                "_blank"
                              );
                            }
                          }}
                        >
                          {channel.action}
                        </Button>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Languages: </span>
                        <span className="text-sm text-muted-foreground">
                          {channel.languages.join(", ")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Support Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Support Services</h2>
              <p className="text-xl text-muted-foreground">
                Comprehensive assistance across all aspects of your travel
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {supportCategories.map((category, index) => (
                <Card key={index} className="border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <category.icon className="h-5 w-5 mr-2 text-primary" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {category.description}
                    </p>
                    <ul className="space-y-2">
                      {category.services.map((service, serviceIndex) => (
                        <li
                          key={serviceIndex}
                          className="text-sm flex items-center"
                        >
                          <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                          {service}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Regional Contacts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Regional Support Contacts
              </h2>
              <p className="text-xl text-muted-foreground">
                Local support contacts for each northeastern state
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regionalContacts.map((contact, index) => (
                <Card key={index} className="border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-700">
                      <MapPin className="h-5 w-5 mr-2" />
                      {contact.state}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-semibold text-sm">
                        {contact.coordinator}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {contact.phone}
                        </a>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {contact.email}
                        </a>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        <strong>Languages:</strong>{" "}
                        {contact.languages.join(", ")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Preview */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-green-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-green-700">
                  <FileText className="inline mr-2 h-6 w-6" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold mb-2">Popular Questions:</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• How do I register for GoSafe?</li>
                      <li>• What permits do I need for travel?</li>
                      <li>• How does the SOS feature work?</li>
                      <li>• What to do in medical emergencies?</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Response Times:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-green-500" />
                        Emergency: Immediate response
                      </li>
                      <li className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-blue-500" />
                        General queries: Within 2 hours
                      </li>
                      <li className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-orange-500" />
                        Documentation: Within 24 hours
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Need Immediate Help?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Our support team is ready to assist you 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => window.open("tel:+91-8800-GOSAFE", "_blank")}
              >
                <Phone className="mr-2 h-5 w-5" />
                Call Support Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/sos-guide")}
              >
                <AlertTriangle className="mr-2 h-5 w-5" />
                Emergency Guide
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TouristSupport;
