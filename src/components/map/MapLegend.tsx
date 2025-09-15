import React from "react";

interface MapLegendProps {
  className?: string;
}

export const MapLegend: React.FC<MapLegendProps> = ({ className = "" }) => {
  return (
    <div
      className={`absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg ${className}`}
    >
      <h3 className="font-semibold text-sm mb-2">Map Legend</h3>
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Active Tourists</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span>SOS Alerts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span>Offline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-2 bg-green-500/20 border border-green-500"></div>
          <span>Safe Zones</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-2 bg-yellow-500/20 border border-yellow-500"></div>
          <span>Restricted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-2 bg-red-500/20 border border-red-500"></div>
          <span>Danger Zones</span>
        </div>
      </div>
    </div>
  );
};
