import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, Phone, MessageCircle, MapPin, AlertTriangle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Help = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const helpTopics = [
    {
      icon: Shield,
      title: "Digital Tourist ID",
      description: "How to register and use your blockchain-based digital tourist ID",
      items: [
        "Registration process with Aadhaar/Passport",
        "QR code generation and usage",
        "Verification at checkpoints",
        "Updating travel information"
      ]
    },
    {
      icon: MapPin,
      title: "Geo-fencing & Location",
      description: "Understanding location tracking and safety zones",
      items: [
        "How geo-fencing works",
        "Safe zone notifications",
        "Restricted area alerts",
        "Location sharing with authorities"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Emergency SOS",
      description: "Using the emergency alert system effectively",
      items: [
        "Activating SOS alerts",
        "Types of emergencies",
        "What happens after SOS activation",
        "Emergency contact notifications"
      ]
    },
    {
      icon: Phone,
      title: "Contact Information",
      description: "Important numbers and contact details",
      items: [
        "Emergency services: 100, 108, 112",
        "Tourist Helpline: 1363",
        "Local police stations",
        "Tourism department contacts"
      ]
    },
    {
      icon: Users,
      title: "For Authorities",
      description: "Guidelines for police and tourism officials",
      items: [
        "Authority dashboard usage",
        "Monitoring tourist movements",
        "Responding to SOS alerts",
        "Incident management"
      ]
    },
    {
      icon: MessageCircle,
      title: "Technical Support",
      description: "App-related issues and troubleshooting",
      items: [
        "Login and authentication issues",
        "App not working properly",
        "Location services problems",
        "Data synchronization issues"
      ]
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
              Help Center
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">
              How can we help you?
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Find answers to common questions and get support for using the Smart Tourist Safety Portal
            </p>
          </div>
        </div>
      </div>

      {/* Help Topics */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpTopics.map((topic, index) => (
              <Card key={index} className="ne-card shadow-ne-soft hover:shadow-ne-medium transition-ne">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <div className="p-2 rounded-lg bg-ne-tea-brown mr-3">
                      <topic.icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-ne-tea-brown">{topic.title}</CardTitle>
                  </div>
                  <CardDescription>{topic.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {topic.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <span className="text-ne-tea-brown mr-2">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Contact Banner */}
      <div className="bg-ne-sunset-orange/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-ne-tea-brown mb-4">
            Need Immediate Help?
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            For emergencies, contact these numbers immediately
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <a href="tel:100" className="block">
              <Card className="p-4 hover:bg-ne-tea-brown hover:text-white transition-colors cursor-pointer">
                <div className="font-bold">Police</div>
                <div className="text-2xl">100</div>
              </Card>
            </a>
            <a href="tel:108" className="block">
              <Card className="p-4 hover:bg-ne-tea-brown hover:text-white transition-colors cursor-pointer">
                <div className="font-bold">Ambulance</div>
                <div className="text-2xl">108</div>
              </Card>
            </a>
            <a href="tel:1363" className="block">
              <Card className="p-4 hover:bg-ne-tea-brown hover:text-white transition-colors cursor-pointer">
                <div className="font-bold">Tourist Help</div>
                <div className="text-2xl">1363</div>
              </Card>
            </a>
            <a href="tel:112" className="block">
              <Card className="p-4 hover:bg-ne-tea-brown hover:text-white transition-colors cursor-pointer">
                <div className="font-bold">Emergency</div>
                <div className="text-2xl">112</div>
              </Card>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;