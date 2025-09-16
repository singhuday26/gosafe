import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Calendar,
  Users,
  Target,
  ExternalLink,
  ArrowLeft,
  Building2,
  Globe,
  Lightbulb,
  Trophy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutSIH: React.FC = () => {
  const navigate = useNavigate();

  const keyFeatures = [
    {
      icon: Lightbulb,
      title: "Innovation-Driven",
      description:
        "36-hour hackathon fostering creative solutions to real-world problems",
    },
    {
      icon: Building2,
      title: "Government Partnered",
      description:
        "Direct collaboration with ministries and government departments",
    },
    {
      icon: Users,
      title: "Student-Centric",
      description:
        "Empowering young minds to contribute to national development",
    },
    {
      icon: Trophy,
      title: "Solution-Oriented",
      description: "Focus on implementable solutions with real-world impact",
    },
  ];

  const statistics = [
    {
      label: "Participating Institutions",
      value: "3000+",
      description: "Colleges and universities nationwide",
    },
    {
      label: "Student Participants",
      value: "50,000+",
      description: "Young innovators and problem solvers",
    },
    {
      label: "Problem Statements",
      value: "400+",
      description: "Real challenges from various sectors",
    },
    {
      label: "Years Running",
      value: "8+",
      description: "Continuous innovation since 2017",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-12">
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
              <Badge variant="outline" className="mb-4">
                <Award className="mr-1 h-4 w-4" />
                Government Initiative
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Smart India Hackathon 2025
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                India's biggest hackathon fostering innovation and creating
                solutions for national challenges
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="text-sm">
                  <Calendar className="mr-1 h-4 w-4" />
                  December 2024
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  <Globe className="mr-1 h-4 w-4" />
                  Pan-India Event
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  <Target className="mr-1 h-4 w-4" />
                  Problem ID: SIH25002
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl">
                  About Smart India Hackathon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg">
                  Smart India Hackathon (SIH) is a nationwide initiative by the
                  Government of India to provide students with a platform to
                  solve some of the pressing problems we face in our daily lives
                  and create a pathway for innovation and entrepreneurship.
                </p>

                <p>
                  SIH brings together brilliant minds from educational
                  institutions across India to develop innovative solutions for
                  challenges posed by various government departments,
                  ministries, and organizations. The hackathon serves as a
                  bridge between academic learning and real-world
                  problem-solving.
                </p>

                <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                  <h3 className="font-bold mb-2 text-primary">
                    Mission Statement
                  </h3>
                  <p className="text-muted-foreground">
                    To harness the creativity and technical expertise of young
                    minds to create innovative solutions that address real-world
                    challenges and contribute to India's digital transformation
                    and socio-economic development.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Key Features */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {keyFeatures.map((feature, index) => (
                <Card key={index} className="border-primary/10">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Statistics */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  SIH by Numbers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statistics.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {stat.value}
                      </div>
                      <div className="font-semibold mb-1">{stat.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {stat.description}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Our Problem Statement */}
            <Card className="mb-12 border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Target className="mr-2 h-6 w-6 text-primary" />
                  Our Challenge: SIH25002
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg">
                  <h3 className="font-bold mb-2 text-primary">
                    Digital Tourist Safety Platform for Northeast India
                  </h3>
                  <p className="text-muted-foreground">
                    Develop a comprehensive digital platform to ensure tourist
                    safety across the eight northeastern states of India,
                    addressing unique challenges like remote terrain, limited
                    connectivity, and multi-lingual requirements.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Problem Category</h4>
                    <p className="text-sm text-muted-foreground">
                      Software Edition
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Target Region</h4>
                    <p className="text-sm text-muted-foreground">
                      Northeast India (8 States)
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Innovation Focus</h4>
                    <p className="text-sm text-muted-foreground">
                      Blockchain & Real-time Safety
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                Learn More About Smart India Hackathon
              </h2>
              <p className="text-muted-foreground mb-6">
                Discover more about India's premier hackathon and innovation
                platform
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() =>
                    window.open("https://www.sih.gov.in/", "_blank")
                  }
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Official SIH Website
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to GoSafe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutSIH;
