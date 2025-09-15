import React from "react";
import { Link } from "react-router-dom";
import { FEATURES } from "../data/features";
import {
  AlertTriangle,
  Key,
  MapPin,
  MessageSquare,
  Shield,
  Settings,
  Globe,
  Wifi,
  FileText,
  Lock,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, LucideIcon> = {
  Key,
  AlertTriangle,
  MapPin,
  MessageSquare,
  Shield,
  Settings,
  Globe,
  Wifi,
  FileText,
  Lock,
};

interface DashboardButtonsProps {
  className?: string;
}

export function DashboardButtons({ className }: DashboardButtonsProps) {
  return (
    <section
      aria-label="GoSafe features"
      className={cn(
        "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {FEATURES.map((feature) => {
        const Icon = feature.icon ? iconMap[feature.icon] : Shield;

        return (
          <Card
            key={feature.id}
            className="relative overflow-hidden transition-all hover:shadow-lg bg-[hsl(var(--ne-tea-brown))] text-white hover:bg-[hsl(var(--ne-tea-brown))]"
          >
            <Link
              to={`/feature/${feature.id}`}
              className="absolute inset-0 z-10"
              aria-describedby={`feature-${feature.id}-desc`}
            >
              <span className="sr-only">Learn more about {feature.title}</span>
            </Link>

            <CardHeader className="relative z-20">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-white/20">
                  <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                {feature.tags?.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="ml-2 bg-white/20 text-white hover:bg-white/30"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <CardTitle className="mt-4 text-white">{feature.title}</CardTitle>
              <CardDescription
                id={`feature-${feature.id}-desc`}
                className="text-white/80"
              >
                {feature.short}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-20">
              <div className="flex items-center text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-white hover:text-white/90"
                >
                  Learn more
                  <span className="sr-only"> about {feature.title}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
