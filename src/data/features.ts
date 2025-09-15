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
];
