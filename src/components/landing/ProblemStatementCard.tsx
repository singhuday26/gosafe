import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  ExternalLink,
  FileText,
  Award,
  Users,
  MapPin,
  Clock,
} from "lucide-react";

const ProblemStatementCard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const problemExcerpt = `Tourist safety in Northeast India faces critical challenges with limited digital infrastructure, 
  language barriers, and inadequate emergency response coordination across remote regions. Traditional safety 
  systems lack real-time tracking, blockchain verification, and multi-stakeholder integration essential for 
  comprehensive tourist protection.`;

  const fullProblemStatement = `
**SIH25002: Digital Tourist Safety Platform for Northeast India**

**Problem Context:**
Northeast India, comprising eight states (Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura), attracts millions of domestic and international tourists annually. However, the region faces unique challenges in ensuring comprehensive tourist safety:

**Key Challenges:**

1. **Geographic Complexity:**
   - Remote mountainous terrain with limited connectivity
   - Border areas with restricted access and security concerns
   - Scattered tourist destinations across vast distances
   - Weather-dependent accessibility in monsoon seasons

2. **Infrastructure Limitations:**
   - Inconsistent mobile network coverage in remote areas
   - Limited digital infrastructure for real-time communication
   - Gaps in emergency response coordination systems
   - Fragmented information systems across states

3. **Cultural and Linguistic Barriers:**
   - Multiple local languages and dialects (50+ languages)
   - Cultural sensitivities requiring local knowledge
   - Communication gaps between tourists and local authorities
   - Need for multilingual emergency assistance

4. **Safety Coordination Issues:**
   - Lack of centralized tourist tracking systems
   - Delayed emergency response in remote locations
   - Insufficient coordination between state authorities
   - Limited real-time information sharing capabilities

5. **Digital Identity Challenges:**
   - No standardized digital ID for tourists
   - Difficulty in verification across state boundaries
   - Lack of blockchain-backed secure identification
   - Manual processes prone to delays and errors

**Required Solution Components:**

1. **Real-time Tracking System:**
   - GPS-based location monitoring
   - Geo-fence creation for safe zones
   - Emergency alert mechanisms
   - Offline capability for remote areas

2. **Multi-stakeholder Integration:**
   - Tourist registration and verification
   - Authority dashboard for monitoring
   - Emergency response coordination
   - Cross-state information sharing

3. **Blockchain-backed Digital Identity:**
   - Secure, tamper-proof tourist IDs
   - QR code-based quick verification
   - Emergency contact management
   - Travel history tracking

4. **Multilingual Support:**
   - Interface in local languages
   - Voice-based emergency assistance
   - Cultural context integration
   - Local guide connectivity

5. **Emergency Response System:**
   - One-tap SOS activation
   - Automatic authority notification
   - Location sharing with emergency contacts
   - Rapid response coordination

**Expected Outcomes:**
- Reduced emergency response time from hours to minutes
- 100% digital coverage across Northeast India
- Seamless multi-state tourist movement
- Enhanced safety confidence for domestic and international tourists
- Standardized safety protocols across all northeastern states

**Innovation Requirements:**
- Blockchain integration for secure digital identity
- AI-powered risk assessment and alerts
- IoT integration for environmental monitoring
- Machine learning for predictive safety analysis
- Cloud-native architecture for scalability

**Evaluation Criteria:**
- Technical innovation and scalability
- User experience and accessibility
- Integration capabilities with existing systems
- Security and privacy compliance
- Real-world deployment feasibility
- Cost-effectiveness and sustainability
`;

  const competitionStats = [
    { label: "Competition", value: "Smart India Hackathon 2025", icon: Award },
    { label: "Problem Code", value: "SIH25002", icon: FileText },
    { label: "Category", value: "Software Edition", icon: Users },
    {
      label: "Focus Region",
      value: "Northeast India (8 States)",
      icon: MapPin,
    },
    { label: "Timeline", value: "36 Hours Development", icon: Clock },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-primary/20 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center mb-4">
                <Badge variant="destructive" className="text-sm font-semibold">
                  <AlertTriangle className="mr-1 h-4 w-4" />
                  Critical Challenge
                </Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold mb-4">
                The Problem We're Solving
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                Addressing tourist safety challenges across Northeast India
                through innovative digital solutions
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Problem Excerpt */}
              <div className="bg-muted/50 p-6 rounded-lg border-l-4 border-primary">
                <p className="text-lg leading-relaxed text-foreground">
                  {problemExcerpt}
                </p>
              </div>

              {/* Competition Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {competitionStats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 bg-background p-4 rounded-lg border"
                  >
                    <stat.icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="font-semibold">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="flex-1">
                      <FileText className="mr-2 h-5 w-5" />
                      Read Full Problem Statement
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">
                        SIH25002: Digital Tourist Safety Platform
                      </DialogTitle>
                      <DialogDescription>
                        Complete problem statement and requirements for Smart
                        India Hackathon 2025
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] pr-4">
                      <div className="prose prose-slate max-w-none dark:prose-invert">
                        <div className="whitespace-pre-line text-sm leading-relaxed">
                          {fullProblemStatement}
                        </div>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>

                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() =>
                    window.open("https://www.sih.gov.in/", "_blank")
                  }
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Smart India Hackathon 2025
                </Button>
              </div>

              {/* Innovation Highlight */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
                <h4 className="font-bold mb-2 text-primary">
                  Our Innovation Approach:
                </h4>
                <p className="text-muted-foreground">
                  GoSafe addresses these challenges through blockchain-backed
                  digital identity, real-time geo-fencing, multi-language
                  support, and coordinated emergency response systems designed
                  specifically for Northeast India's unique requirements.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProblemStatementCard;
