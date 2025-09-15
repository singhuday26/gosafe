import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Shield, Users, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();

  const contacts = [
    {
      icon: Building2,
      title: "Ministry of Tourism",
      description: "Government of India",
      details: [
        "Transport Bhawan, 1 Parliament Street",
        "New Delhi - 110001",
        "Phone: +91-11-23716300",
        "Email: info@tourism.gov.in"
      ],
      website: "https://tourism.gov.in"
    },
    {
      icon: Shield,
      title: "Ministry of Home Affairs",
      description: "Government of India",
      details: [
        "North Block, Central Secretariat",
        "New Delhi - 110001", 
        "Phone: +91-11-23092011",
        "Email: info@mha.gov.in"
      ],
      website: "https://www.mha.gov.in"
    },
    {
      icon: Users,
      title: "Smart India Hackathon",
      description: "Technical Support",
      details: [
        "All India Council for Technical Education",
        "Nelson Mandela Marg, Vasant Kunj",
        "New Delhi - 110070",
        "Email: sih@aicte-india.org"
      ],
      website: "https://www.sih.gov.in"
    }
  ];

  const emergencyContacts = [
    { service: "Police", number: "100", icon: "🚓" },
    { service: "Ambulance", number: "108", icon: "🚑" },
    { service: "Fire Brigade", number: "101", icon: "🚒" },
    { service: "Tourist Helpline", number: "1363", icon: "🏛️" },
    { service: "Emergency", number: "112", icon: "🆘" }
  ];

  const regionalOffices = [
    {
      state: "Assam",
      office: "Assam Tourism Development Corporation",
      address: "Tourist Lodge Compound, Station Road, Guwahati - 781001",
      phone: "+91-361-2547102",
      email: "info@assamtourism.gov.in"
    },
    {
      state: "Arunachal Pradesh", 
      office: "Arunachal Pradesh Tourism",
      address: "Directorate of Tourism, Itanagar - 791111",
      phone: "+91-360-2212948",
      email: "dir.tourism-ap@gov.in"
    },
    {
      state: "Meghalaya",
      office: "Meghalaya Tourism Development Corporation",
      address: "3rd Secretariat, Lower Lachumiere, Shillong - 793001",
      phone: "+91-364-2226220",
      email: "dir.tourism@meghalaya.gov.in"
    },
    {
      state: "Manipur",
      office: "Manipur Tourism Corporation",
      address: "Khuman Lampak, Imphal - 795004",
      phone: "+91-385-2414144",
      email: "manipurtourism@gmail.com"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-ne-tea-brown text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/10 mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
          
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
              Contact Information
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">
              Get in Touch
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Connect with us for support, feedback, or any questions about the Smart Tourist Safety Portal
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Banner */}
      <div className="bg-red-50 py-8 border-l-4 border-red-500">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-red-800 mb-4 flex items-center">
            <Phone className="h-6 w-6 mr-2" />
            Emergency Contacts
          </h2>
          <p className="text-red-700 mb-4">For immediate assistance, call these numbers:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {emergencyContacts.map((contact, index) => (
              <a key={index} href={`tel:${contact.number}`} className="block">
                <Card className="p-4 text-center hover:bg-red-100 transition-colors cursor-pointer border-red-200">
                  <div className="text-2xl mb-1">{contact.icon}</div>
                  <div className="font-semibold text-red-800">{contact.service}</div>
                  <div className="text-2xl font-bold text-red-600">{contact.number}</div>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Contact Information */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ne-tea-brown mb-4">
              Government Departments
            </h2>
            <p className="text-lg text-muted-foreground">
              Official contact information for relevant ministries and departments
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {contacts.map((contact, index) => (
              <Card key={index} className="ne-card shadow-ne-soft hover:shadow-ne-medium transition-ne">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <div className="p-2 rounded-lg bg-ne-tea-brown mr-3">
                      <contact.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-ne-tea-brown">{contact.title}</CardTitle>
                      <CardDescription className="text-sm">{contact.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    {contact.details.map((detail, detailIndex) => (
                      <p key={detailIndex}>{detail}</p>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open(contact.website, '_blank')}
                  >
                    Visit Website
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Regional Tourism Offices */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ne-tea-brown mb-4">
              Regional Tourism Offices
            </h2>
            <p className="text-lg text-muted-foreground">
              State tourism departments across Northeast India
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {regionalOffices.map((office, index) => (
              <Card key={index} className="ne-card shadow-ne-soft">
                <CardHeader>
                  <CardTitle className="flex items-center text-ne-tea-brown">
                    <MapPin className="h-5 w-5 mr-2" />
                    {office.state}
                  </CardTitle>
                  <CardDescription className="font-semibold">{office.office}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start">
                    <Building2 className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{office.address}</p>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`tel:${office.phone}`} className="text-sm text-ne-tea-brown hover:underline">
                      {office.phone}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`mailto:${office.email}`} className="text-sm text-ne-tea-brown hover:underline">
                      {office.email}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="bg-ne-mist-gray py-12">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center text-ne-tea-brown">
                <Clock className="h-5 w-5 mr-2" />
                Support Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Emergency Services</span>
                  <span className="font-semibold text-red-600">24/7 Available</span>
                </div>
                <div className="flex justify-between">
                  <span>Tourist Helpline</span>
                  <span className="font-semibold">24/7 Available</span>
                </div>
                <div className="flex justify-between">
                  <span>Government Offices</span>
                  <span className="font-semibold">Mon-Fri: 9:30 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Technical Support</span>
                  <span className="font-semibold">Mon-Sat: 9:00 AM - 9:00 PM</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;