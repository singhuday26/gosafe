import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Shield, Users, TrendingUp } from "lucide-react";

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: string;
  isDemo?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({
  icon: Icon,
  label,
  value,
  trend,
  isDemo,
}) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-primary/10">
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center mb-3">
          <Icon className="h-8 w-8 text-primary" />
          {isDemo && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Demo
            </Badge>
          )}
        </div>
        <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
        <div className="text-sm text-muted-foreground mb-2">{label}</div>
        {trend && (
          <div className="flex items-center justify-center text-xs">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-green-500">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const QuickStatsStrip: React.FC = () => {
  const [animatedValues, setAnimatedValues] = useState({
    regions: 0,
    responseTime: 0,
    geofences: 0,
    digitalIds: 0,
  });

  // Animate numbers on mount
  useEffect(() => {
    const targets = {
      regions: 8,
      responseTime: 98, // representing 98 seconds (1:38)
      geofences: 150,
      digitalIds: 2500,
    };

    const duration = 2000; // 2 seconds
    const steps = 60; // 60 steps for smooth animation
    const interval = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedValues({
        regions: Math.round(targets.regions * progress),
        responseTime: Math.round(targets.responseTime * progress),
        geofences: Math.round(targets.geofences * progress),
        digitalIds: Math.round(targets.digitalIds * progress),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const formatResponseTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const stats = [
    {
      icon: MapPin,
      label: "Regions Covered",
      value: `${animatedValues.regions}/8`,
      trend: "+2 this quarter",
      isDemo: false,
    },
    {
      icon: Clock,
      label: "Avg Response Time",
      value: formatResponseTime(animatedValues.responseTime),
      trend: "-15% faster",
      isDemo: true,
    },
    {
      icon: Shield,
      label: "Active Geo-fences",
      value: animatedValues.geofences.toLocaleString(),
      trend: "+12% this month",
      isDemo: true,
    },
    {
      icon: Users,
      label: "Digital IDs Issued",
      value: animatedValues.digitalIds.toLocaleString(),
      trend: "+45% growth",
      isDemo: true,
    },
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4 text-sm">
            Live Platform Statistics
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Real-time Safety Metrics
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Monitoring tourist safety across Northeast India with advanced
            technology and rapid response capabilities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`animate-fade-in animation-delay-${index}`}
            >
              <StatItem {...stat} />
            </div>
          ))}
        </div>

        {/* Additional Context */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            * Demo values shown for development environment.
            <br className="hidden sm:block" />
            Live statistics will reflect actual deployment data.
          </p>
        </div>
      </div>
    </section>
  );
};

export default QuickStatsStrip;
