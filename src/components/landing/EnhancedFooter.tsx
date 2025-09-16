import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  AlertTriangle,
  Shield,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Clock,
  Building2,
} from "lucide-react";

interface EmergencyContact {
  name: string;
  number: string;
  type: "national" | "regional" | "local";
  available: string;
}

interface QuickLink {
  name: string;
  url: string;
  category: "government" | "emergency" | "support" | "legal";
}

const EnhancedFooter: React.FC = () => {
  const emergencyContacts: EmergencyContact[] = [
    {
      name: "National Emergency (Police)",
      number: "100",
      type: "national",
      available: "24/7",
    },
    {
      name: "Tourist Helpline",
      number: "1363",
      type: "national",
      available: "24/7",
    },
    {
      name: "Medical Emergency",
      number: "108",
      type: "national",
      available: "24/7",
    },
    {
      name: "GoSafe Emergency",
      number: "+91-8800-GOSAFE",
      type: "regional",
      available: "24/7",
    },
    {
      name: "Northeast Tourism Control",
      number: "+91-361-TOURIST",
      type: "regional",
      available: "06:00 - 22:00",
    },
    {
      name: "Women's Helpline",
      number: "1091",
      type: "national",
      available: "24/7",
    },
  ];

  const quickLinks: QuickLink[] = [
    // Government Links
    {
      name: "Smart India Hackathon",
      url: "https://www.sih.gov.in/",
      category: "government",
    },
    {
      name: "Ministry of Tourism",
      url: "https://tourism.gov.in/",
      category: "government",
    },
    {
      name: "Incredible India",
      url: "https://www.incredibleindia.org/",
      category: "government",
    },
    {
      name: "North Eastern Council",
      url: "https://necouncil.gov.in/",
      category: "government",
    },

    // Emergency Services
    {
      name: "Emergency Services Portal",
      url: "/emergency",
      category: "emergency",
    },
    {
      name: "Tourist Safety Guidelines",
      url: "/safety-guidelines",
      category: "emergency",
    },
    {
      name: "SOS Quick Guide",
      url: "/sos-guide",
      category: "emergency",
    },

    // Support
    {
      name: "Help & Support",
      url: "/help",
      category: "support",
    },
    {
      name: "Contact Us",
      url: "/contact",
      category: "support",
    },
    {
      name: "FAQ",
      url: "/faq",
      category: "support",
    },

    // Legal
    {
      name: "Privacy Policy",
      url: "/privacy",
      category: "legal",
    },
    {
      name: "Terms of Service",
      url: "/terms",
      category: "legal",
    },
    {
      name: "DPDP Compliance",
      url: "/dpdp-compliance",
      category: "legal",
    },
  ];

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case "national":
        return "bg-red-100 text-red-800 border-red-200";
      case "regional":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "local":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const groupedLinks = quickLinks.reduce((acc, link) => {
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, QuickLink[]>);

  return (
    <footer className="bg-background border-t border-border">
      {/* Emergency Banner */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center text-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span className="font-semibold">
              Emergency? Call 100 (Police) | 108 (Medical) | 1363 (Tourist
              Helpline) | GoSafe: +91-8800-GOSAFE
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <Shield className="h-8 w-8 text-primary mr-2" />
              <span className="text-2xl font-bold">GoSafe</span>
            </div>
            <p className="text-muted-foreground mb-6 text-sm">
              Digital Tourist Safety Platform for Northeast India. SIH25002
              innovation ensuring comprehensive tourist protection through
              blockchain-backed digital identity and real-time safety
              monitoring.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4 mb-6">
              <Button variant="outline" size="sm">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Contact */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-primary" />
                <span>support@gosafe.gov.in</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-primary" />
                <span>+91-8800-GOSAFE</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <span>Northeast India</span>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Emergency Contacts
            </h3>
            <div className="space-y-3">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="bg-muted/50 p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">
                      {contact.name}
                    </span>
                    <Badge className={getContactTypeColor(contact.type)}>
                      {contact.type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <a
                      href={`tel:${contact.number}`}
                      className="text-primary font-bold hover:underline"
                    >
                      {contact.number}
                    </a>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {contact.available}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Government & Official */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center text-sm">
                  <Building2 className="h-4 w-4 mr-2" />
                  Government & Official
                </h4>
                <ul className="space-y-2">
                  {groupedLinks.government?.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.url}
                        className="text-sm text-muted-foreground hover:text-primary flex items-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Emergency & Support */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center text-sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergency & Support
                </h4>
                <ul className="space-y-2">
                  {groupedLinks.emergency?.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.url}
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                  {groupedLinks.support?.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.url}
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Legal Links */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3 flex items-center text-sm">
                <Shield className="h-4 w-4 mr-2" />
                Legal & Compliance
              </h4>
              <div className="flex flex-wrap gap-4">
                {groupedLinks.legal?.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Badge variant="outline" className="text-xs">
                <Globe className="mr-1 h-3 w-3" />
                SIH25002
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Shield className="mr-1 h-3 w-3" />
                DPDP Compliant
              </Badge>
              <Badge variant="outline" className="text-xs">
                Blockchain Secured
              </Badge>
            </div>

            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                © 2024 GoSafe. Smart India Hackathon 2025.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Digital Tourist Safety Platform for Northeast India
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;
