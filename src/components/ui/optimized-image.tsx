import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(!priority);
  const [currentSrc, setCurrentSrc] = useState<string>(
    priority
      ? src
      : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
  );

  useEffect(() => {
    if (!priority) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setCurrentSrc(src);
        setIsLoading(false);
      };
    }
  }, [src, priority]);

  const aspectRatio = width && height ? width / height : undefined;

  return (
    <div
      style={{
        position: "relative",
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "auto",
        aspectRatio,
      }}
    >
      {isLoading && (
        <Skeleton className="absolute inset-0" style={{ aspectRatio }} />
      )}
      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${
          isLoading
            ? "opacity-0"
            : "opacity-100 transition-opacity duration-200"
        }`}
        loading={priority ? "eager" : "lazy"}
        {...props}
      />
    </div>
  );
};
