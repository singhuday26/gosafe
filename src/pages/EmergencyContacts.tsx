import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Phone,
  ArrowLeft,
  AlertTriangle,
  Shield,
  Heart,
  Users,
  MapPin,
  Clock,
  Building2,
  Flame,
  Car,
  Briefcase,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmergencyContacts: React.FC = () => {
  const navigate = useNavigate();

  const nationalEmergencyNumbers = [
    {
      icon: Shield,
      service: "Police Emergency",
      number: "100",
      description: "For immediate police assistance and crime reporting",
      availability: "24/7",
      languages: "All Indian languages",
    },
    {
      icon: Heart,
      service: "Medical Emergency",
      number: "108",
      description: "Ambulance services and medical emergencies",
      availability: "24/7",
      languages: "English, Hindi, Local languages",
    },
    {
      icon: Flame,
      service: "Fire Services",
      number: "101",
      description: "Fire emergencies and rescue operations",
      availability: "24/7",
      languages: "English, Hindi, Local languages",
    },
    {
      icon: Users,
      service: "Tourist Helpline",
      number: "1363",
      description: "24/7 assistance for tourists across India",
      availability: "24/7",
      languages: "English, Hindi, Major Indian languages",
    },
    {
      icon: Phone,
      service: "Emergency Services",
      number: "112",
      description: "Single emergency number for all services",
      availability: "24/7",
      languages: "All Indian languages",
    },
    {
      icon: Users,
      service: "Women's Helpline",
      number: "1091",
      description: "24/7 helpline for women in distress",
      availability: "24/7",
      languages: "English, Hindi, Local languages",
    },
  ];

  const regionalPoliceStations = [
    {
      state: "Assam",
      headquarters: "Guwahati Police Commissioner",
      phone: "+91-361-2540405",
      control_room: "+91-361-2548336",
      tourist_police: "+91-361-2548021",
    },
    {
      state: "Arunachal Pradesh",
      headquarters: "Itanagar Police Station",
      phone: "+91-360-2212276",
      control_room: "+91-360-2212100",
      tourist_police: "+91-360-2212163",
    },
    {
      state: "Meghalaya",
      headquarters: "Shillong Police Station",
      phone: "+91-364-2222207",
      control_room: "+91-364-2222100",
      tourist_police: "+91-364-2224282",
    },
    {
      state: "Sikkim",
      headquarters: "Gangtok Police Station",
      phone: "+91-3592-202335",
      control_room: "+91-3592-202100",
      tourist_police: "+91-3592-202751",
    },
    {
      state: "Manipur",
      headquarters: "Imphal Police Station",
      phone: "+91-385-2450100",
      control_room: "+91-385-2451100",
      tourist_police: "+91-385-2451744",
    },
    {
      state: "Mizoram",
      headquarters: "Aizawl Police Station",
      phone: "+91-389-2322336",
      control_room: "+91-389-2322100",
      tourist_police: "+91-389-2323647",
    },
    {
      state: "Nagaland",
      headquarters: "Kohima Police Station",
      phone: "+91-370-2270100",
      control_room: "+91-370-2270336",
      tourist_police: "+91-370-2226253",
    },
    {
      state: "Tripura",
      headquarters: "Agartala Police Station",
      phone: "+91-381-2323336",
      control_room: "+91-381-2323100",
      tourist_police: "+91-381-2381473",
    },
  ];

  const medicalServices = [
    {
      category: "Government Hospitals",
      contacts: [
        { name: "AIIMS Guwahati", phone: "+91-361-2570073", state: "Assam" },
        {
          name: "Shillong Civil Hospital",
          phone: "+91-364-2226014",
          state: "Meghalaya",
        },
        {
          name: "STNM Hospital, Gangtok",
          phone: "+91-3592-202266",
          state: "Sikkim",
        },
        { name: "RIMS Imphal", phone: "+91-385-2414625", state: "Manipur" },
      ],
    },
    {
      category: "Private Hospitals",
      contacts: [
        {
          name: "Nemcare Hospital, Guwahati",
          phone: "+91-361-2235555",
          state: "Assam",
        },
        {
          name: "Woodland Hospital, Shillong",
          phone: "+91-364-2503551",
          state: "Meghalaya",
        },
        {
          name: "Central Referral Hospital, Sikkim",
          phone: "+91-3592-202300",
          state: "Sikkim",
        },
        {
          name: "Shija Hospital, Imphal",
          phone: "+91-385-2447204",
          state: "Manipur",
        },
      ],
    },
  ];

  const specializedServices = [
    {
      icon: Car,
      service: "Road Accident Emergency",
      number: "1073",
      description: "Highway rescue and road accident assistance",
    },
    {
      icon: Briefcase,
      service: "Railway Emergency",
      number: "1512",
      description: "Railway accidents and passenger assistance",
    },
    {
      icon: Phone,
      service: "Child Helpline",
      number: "1098",
      description: "Children in need of care and protection",
    },
    {
      icon: Heart,
      service: "Mental Health Helpline",
      number: "9152987821",
      description: "Mental health support and counseling",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-red-50 to-red-100 py-12">
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
              <Badge variant="destructive" className="mb-4">
                <AlertTriangle className="mr-1 h-4 w-4" />
                Emergency Information
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-red-700">
                Emergency Contacts
              </h1>
              <p className="text-xl text-red-600 mb-6">
                Complete emergency contact directory for Northeast India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Critical Alert */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Alert className="border-red-200 bg-red-50 mb-8">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <strong>
                  Save these numbers in your phone before traveling!
                </strong>{" "}
                In life-threatening emergencies, call 100 (Police) or 108
                (Medical) immediately. For tourist-specific help, use GoSafe SOS
                feature.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* National Emergency Numbers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                National Emergency Numbers
              </h2>
              <p className="text-xl text-muted-foreground">
                These numbers work from anywhere in India
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nationalEmergencyNumbers.map((emergency, index) => (
                <Card
                  key={index}
                  className="border-2 border-red-100 hover:border-red-200 transition-colors"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="bg-red-100 p-3 rounded-full inline-flex mx-auto mb-3">
                      <emergency.icon className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-lg">
                      {emergency.service}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-4">
                      <a
                        href={`tel:${emergency.number}`}
                        className="text-3xl font-bold text-red-600 hover:text-red-700"
                      >
                        {emergency.number}
                      </a>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {emergency.description}
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-center">
                        <Clock className="h-3 w-3 mr-1 text-green-500" />
                        <span>{emergency.availability}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {emergency.languages}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Regional Police Contacts */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Regional Police Contacts
              </h2>
              <p className="text-xl text-muted-foreground">
                Police stations and tourist police contacts for each state
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {regionalPoliceStations.map((station, index) => (
                <Card key={index} className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-700">
                      <Shield className="h-5 w-5 mr-2" />
                      {station.state}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-semibold text-sm">
                        {station.headquarters}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Main:
                        </span>
                        <a
                          href={`tel:${station.phone}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {station.phone}
                        </a>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Control Room:
                        </span>
                        <a
                          href={`tel:${station.control_room}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {station.control_room}
                        </a>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Tourist Police:
                        </span>
                        <a
                          href={`tel:${station.tourist_police}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {station.tourist_police}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Medical Services */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Medical Emergency Contacts
              </h2>
              <p className="text-xl text-muted-foreground">
                Hospitals and medical facilities across Northeast India
              </p>
            </div>

            {medicalServices.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-green-700">
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {category.contacts.map((contact, contactIndex) => (
                    <Card key={contactIndex} className="border-green-200">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <h4 className="font-semibold text-sm mb-2">
                            {contact.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {contact.state}
                          </p>
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-sm text-primary hover:underline font-medium"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialized Services */}
      <section className="py-16 bg-gradient-to-r from-orange-50 to-orange-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-orange-700">
                Specialized Emergency Services
              </h2>
              <p className="text-xl text-orange-600">
                Additional emergency services for specific situations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {specializedServices.map((service, index) => (
                <Card key={index} className="border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <service.icon className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold">{service.service}</h3>
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <a
                          href={`tel:${service.number}`}
                          className="text-xl font-bold text-primary hover:text-primary/80"
                        >
                          {service.number}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GoSafe Emergency */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <Shield className="h-12 w-12 text-primary mr-4" />
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      GoSafe Emergency
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      Your primary emergency contact for tourist safety
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <a
                    href="tel:+91-8800-GOSAFE"
                    className="text-4xl font-bold text-primary hover:text-primary/80"
                  >
                    +91-8800-GOSAFE
                  </a>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-6 text-sm">
                  <div className="flex items-center justify-center">
                    <Clock className="h-4 w-4 mr-2 text-green-500" />
                    <span>24/7 Available</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Location Tracking</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Users className="h-4 w-4 mr-2 text-purple-500" />
                    <span>Multi-language Support</span>
                  </div>
                </div>

                <Button size="lg" onClick={() => navigate("/auth?tab=signup")}>
                  <Shield className="mr-2 h-5 w-5" />
                  Register for GoSafe
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmergencyContacts;
