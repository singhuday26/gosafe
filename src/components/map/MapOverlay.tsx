import React from "react";

interface MapOverlayProps {
  isLoading: boolean;
  error?: string;
  className?: string;
}

export const MapOverlay: React.FC<MapOverlayProps> = ({
  isLoading,
  error,
  className = "",
}) => {
  if (!isLoading && !error) return null;

  return (
    <div
      className={`absolute inset-0 bg-white/50 flex items-center justify-center ${className}`}
    >
      {isLoading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      )}
      {error && (
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};
