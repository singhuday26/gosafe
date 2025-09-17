import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { touristService } from "@/services/touristService";

interface StatCardProps {
  title: string;
  value?: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  className?: string;
  dataType?:
    | "totalTourists"
    | "activeTourists"
    | "totalAlerts"
    | "activeAlerts"
    | "safeZones"
    | "dangerZones"
    | "restrictedZones";
  useRealData?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value: propValue,
  description,
  icon,
  trend,
  badge,
  className = "",
  dataType,
  useRealData = true,
}) => {
  const [realValue, setRealValue] = useState<string | number>(propValue || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!useRealData || !dataType) {
      setRealValue(propValue || 0);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const metrics = await touristService.getSafetyMetrics();

        switch (dataType) {
          case "totalTourists":
            setRealValue(metrics.totalTourists);
            break;
          case "activeTourists":
            setRealValue(metrics.activeTourists);
            break;
          case "totalAlerts":
            setRealValue(metrics.totalAlerts);
            break;
          case "activeAlerts":
            setRealValue(metrics.activeAlerts);
            break;
          case "safeZones":
            setRealValue(metrics.safeZones);
            break;
          case "dangerZones":
            setRealValue(metrics.dangerZones);
            break;
          case "restrictedZones":
            setRealValue(metrics.restrictedZones);
            break;
          default:
            setRealValue(propValue || 0);
        }
      } catch (error) {
        console.error("Failed to fetch stat data:", error);
        setRealValue(propValue || 0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [useRealData, dataType, propValue]);

  const displayValue = useRealData && !loading ? realValue : propValue || 0;

  const getTrendIcon = () => {
    if (!trend) return null;

    if (trend.value > 0) {
      return <TrendingUp className="h-3 w-3" />;
    } else if (trend.value < 0) {
      return <TrendingDown className="h-3 w-3" />;
    } else {
      return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return "";

    if (trend.isPositive) {
      return trend.value > 0 ? "text-green-600" : "text-red-600";
    } else {
      return trend.value > 0 ? "text-red-600" : "text-green-600";
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {badge && (
            <Badge variant={badge.variant || "secondary"} className="text-xs">
              {badge.text}
            </Badge>
          )}
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            <div className="animate-pulse bg-muted rounded h-8 w-16"></div>
          ) : (
            displayValue
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center mt-2 text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="ml-1">
              {Math.abs(trend.value)}% {trend.label || "from last period"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
