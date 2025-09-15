export type FeatureId =
  | "digital-id"
  | "sos"
  | "geo-fencing"
  | "real-time"
  | "ai-chatbot"
  | "iot-wearables"
  | "efir"
  | "multilingual"
  | "privacy-security"
  | "admin-settings";

export interface Feature {
  id: FeatureId;
  title: string;
  short: string;
  icon?: string;
  tags?: string[];
  heroColor?: string;
  sections: {
    heading: string;
    body: string;
    bullets?: string[];
    demoSteps?: string[];
    apis?: { method: string; path: string; description: string }[];
    faqs?: { q: string; a: string }[];
  }[];
}

export const FEATURES: Feature[] = [
  {
    id: "digital-id",
    title: "Digital Tourist ID",
    short: "Blockchain-backed verifiable tourist ID (temporary).",
    icon: "Key",
    heroColor: "bg-ne-sikkim",
    sections: [
      {
        heading: "Overview",
        body: "Portable self-sovereign digital ID for tourists (DID/VC pattern). Stored locally in wallet; only a hash on chain.",
        bullets: [
          "Issued at airports / hotels via QR or OTP",
          "Includes trip itinerary and emergency contacts",
          "Validity tied to trip dates; revocable",
        ],
        apis: [
          {
            method: "POST",
            path: "/api/id/create",
            description: "Create ID & write hash.",
          },
          {
            method: "GET",
            path: "/api/id/:id/verify",
            description: "Verify ID hash & status.",
          },
        ],
        faqs: [
          {
            q: "Is Aadhaar stored on-chain?",
            a: "No. Only hashes; raw PII is off-chain and encrypted.",
          },
          {
            q: "What happens after trip end?",
            a: "ID automatically expires but remains verifiable for audit.",
          },
        ],
      },
      {
        heading: "How It Works",
        body: "The Digital Tourist ID uses blockchain technology to create a secure, verifiable identity that respects privacy while enabling emergency services.",
        bullets: [
          "Tourist provides minimal KYC at registration",
          "System generates a blockchain-backed ID with expiry",
          "Only cryptographic proofs stored on chain",
          "Authorities can verify without accessing personal data",
        ],
        demoSteps: [
          "Navigate to Tourist Registration",
          "Fill sample tourist details",
          "Observe ID creation on blockchain",
          "Try verification in Authority Dashboard",
        ],
      },
    ],
  },
  {
    id: "sos",
    title: "SOS & Emergency",
    short:
      "Multi-trigger SOS with context capture and multi-channel escalation.",
    icon: "AlertTriangle",
    heroColor: "bg-ne-sos",
    sections: [
      {
        heading: "How it works",
        body: "Press the floating SOS button, shake device, or say the keyword. The system captures live GPS, battery, network strength, landmark, and optional ambient audio.",
        bullets: [
          "Geo-fence escalation: rangers vs city police",
          "Notifications via WebSocket, SMS, Email, Push",
          "Nearby volunteers (opt-in) notified if within radius",
        ],
        demoSteps: [
          "Open Tourist Dashboard → Press SOS",
          "Observe socket event in Authority Dashboard within 2s",
          "Confirm SMS/email received by authority (demo mode)",
        ],
        apis: [
          {
            method: "POST",
            path: "/api/sos",
            description: "Create SOS payload and trigger notifications",
          },
          {
            method: "PUT",
            path: "/api/sos/:id/respond",
            description: "Mark SOS as being responded to",
          },
          {
            method: "POST",
            path: "/api/sos/:id/resolve",
            description: "Resolve and close SOS alert",
          },
        ],
        faqs: [
          {
            q: "Can SOS be canceled?",
            a: "Yes — a 5s cancel overlay is shown to avoid false alarms.",
          },
          {
            q: "How are false alarms handled?",
            a: "ML model checks GPS movement pattern and ambient audio to gauge urgency.",
          },
        ],
      },
      {
        heading: "Escalation Protocol",
        body: "The SOS system follows a strict escalation protocol based on location and severity.",
        bullets: [
          "Immediate notification to nearest authority",
          "Automatic escalation if no response in 2 minutes",
          "Smart routing based on incident type and location",
          "Integration with local emergency services",
        ],
        demoSteps: [
          "Trigger test SOS alert",
          "Watch real-time escalation workflow",
          "Observe multi-channel notifications",
          "View response tracking dashboard",
        ],
      },
    ],
  },
  {
    id: "geo-fencing",
    title: "Smart Geo-Fencing",
    short: "AI-powered location monitoring with safety zone alerts.",
    icon: "MapPin",
    heroColor: "bg-ne-assam",
    sections: [
      {
        heading: "Overview",
        body: "Advanced geofencing system that monitors tourist locations and provides safety zone alerts.",
        bullets: [
          "Real-time location tracking",
          "Smart safety zone detection",
          "Automatic alerts for restricted areas",
          "AI-powered risk assessment",
        ],
      },
    ],
  },
  {
    id: "real-time",
    title: "Real-time Monitoring",
    short: "Live tracking and instant notifications for enhanced safety.",
    icon: "Shield",
    heroColor: "bg-ne-meghalaya",
    sections: [
      {
        heading: "Overview",
        body: "Comprehensive real-time monitoring system for tourist safety and security.",
        bullets: [
          "Live location tracking",
          "Instant notifications",
          "24/7 monitoring dashboard",
          "Automated safety alerts",
        ],
      },
    ],
  },
  {
    id: "ai-chatbot",
    title: "AI Assistant",
    short: "24/7 intelligent support and emergency guidance.",
    icon: "MessageSquare",
    heroColor: "bg-ne-mizoram",
    sections: [
      {
        heading: "Overview",
        body: "AI-powered assistant providing round-the-clock support and emergency guidance.",
        bullets: [
          "Natural language processing",
          "Emergency protocol guidance",
          "Multilingual support",
          "Contextual assistance",
        ],
      },
    ],
  },
  {
    id: "iot-wearables",
    title: "IoT Wearables",
    short: "Smart devices for continuous health and safety monitoring.",
    icon: "Wifi",
    heroColor: "bg-ne-nagaland",
    sections: [
      {
        heading: "Overview",
        body: "Smart wearable devices for continuous health and safety monitoring.",
        bullets: [
          "Health vitals monitoring",
          "Activity tracking",
          "Emergency detection",
          "Seamless connectivity",
        ],
      },
    ],
  },
  {
    id: "efir",
    title: "Electronic FIR",
    short: "Digital incident reporting and case management system.",
    icon: "FileText",
    heroColor: "bg-ne-tripura",
    sections: [
      {
        heading: "Overview",
        body: "Digital system for filing and managing First Information Reports (FIR).",
        bullets: [
          "Online FIR filing",
          "Digital case management",
          "Status tracking",
          "Document management",
        ],
      },
    ],
  },
  {
    id: "multilingual",
    title: "Multilingual Support",
    short:
      "Support for 70+ languages including all Northeast Indian languages.",
    icon: "Globe",
    heroColor: "bg-ne-manipur",
    sections: [
      {
        heading: "Overview",
        body: "Comprehensive multilingual support for diverse user needs.",
        bullets: [
          "70+ language support",
          "Northeast Indian languages",
          "Real-time translation",
          "Cultural adaptation",
        ],
      },
    ],
  },
  {
    id: "privacy-security",
    title: "Privacy & Security",
    short: "End-to-end encryption and privacy-first data handling.",
    icon: "Lock",
    heroColor: "bg-ne-arunachal",
    sections: [
      {
        heading: "Overview",
        body: "Advanced privacy and security measures to protect user data.",
        bullets: [
          "End-to-end encryption",
          "Privacy-first design",
          "Secure data handling",
          "Compliance standards",
        ],
      },
    ],
  },
  {
    id: "admin-settings",
    title: "Admin Settings",
    short: "Comprehensive system configuration and management tools.",
    icon: "Settings",
    heroColor: "bg-ne-tea-brown",
    sections: [
      {
        heading: "Overview",
        body: "Complete administrative control and system configuration tools.",
        bullets: [
          "System configuration",
          "User management",
          "Security settings",
          "Performance monitoring",
        ],
      },
    ],
  },
];
