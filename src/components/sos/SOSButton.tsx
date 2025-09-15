import React, { useState, useEffect } from "react";
import { AlertTriangle, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SOSButtonProps {
  onTrigger: () => void;
  isActive: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  countdown?: number;
}

export const SOSButton: React.FC<SOSButtonProps> = ({
  onTrigger,
  isActive,
  disabled = false,
  size = "lg",
  className = "",
  countdown,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [holdDuration, setHoldDuration] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPressed && !isActive) {
      interval = setInterval(() => {
        setHoldDuration((prev) => {
          if (prev >= 3000) {
            // 3 seconds hold to trigger
            onTrigger();
            setIsPressed(false);
            return 0;
          }
          return prev + 100;
        });
      }, 100);
    } else {
      setHoldDuration(0);
    }

    return () => clearInterval(interval);
  }, [isPressed, isActive, onTrigger]);

  const handleMouseDown = () => {
    if (!disabled && !isActive) {
      setIsPressed(true);
      toast({
        title: "Hold to activate SOS",
        description: "Keep holding for 3 seconds to trigger emergency alert",
        duration: 2000,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    setHoldDuration(0);
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-12 w-12 text-sm";
      case "md":
        return "h-16 w-16 text-base";
      case "lg":
      default:
        return "h-20 w-20 text-lg";
    }
  };

  const progress = Math.min((holdDuration / 3000) * 100, 100);

  return (
    <div className={`relative ${className}`}>
      <Button
        size="icon"
        className={`
          ${getSizeClasses()}
          rounded-full
          ${
            isActive
              ? "bg-red-600 hover:bg-red-700 animate-pulse"
              : isPressed
              ? "bg-red-500 hover:bg-red-600"
              : "bg-red-500 hover:bg-red-600"
          }
          text-white shadow-lg transition-all duration-200
          ${isPressed ? "scale-110" : ""}
        `}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        disabled={disabled || isActive}
      >
        {isActive ? (
          <div className="flex flex-col items-center">
            <div className="animate-pulse text-xl">🚨</div>
            {countdown && <span className="text-xs">{countdown}s</span>}
          </div>
        ) : (
          <AlertTriangle className="h-8 w-8" />
        )}
      </Button>

      {/* Progress ring for hold duration */}
      {isPressed && (
        <div className="absolute inset-0 rounded-full">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 36 36"
          >
            <path
              className="text-red-200"
              strokeWidth="2"
              fill="none"
              stroke="currentColor"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-white"
              strokeWidth="2"
              strokeDasharray={`${progress}, 100`}
              strokeLinecap="round"
              fill="none"
              stroke="currentColor"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
