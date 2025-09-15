import React, { useState, useEffect, ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface LanguageTransitionProps {
  children: ReactNode;
  className?: string;
  duration?: number;
}

const LanguageTransition: React.FC<LanguageTransitionProps> = ({
  children,
  className = "",
  duration = 200,
}) => {
  const { i18n } = useTranslation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [content, setContent] = useState(children);

  useEffect(() => {
    const handleLanguageChange = () => {
      setIsTransitioning(true);

      // Start fade out
      setTimeout(() => {
        setContent(children);

        // Start fade in
        setTimeout(() => {
          setIsTransitioning(false);
        }, duration / 2);
      }, duration / 2);
    };

    // Listen for custom language change events
    window.addEventListener("languageChanged", handleLanguageChange);

    // Also listen to i18next events
    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      window.removeEventListener("languageChanged", handleLanguageChange);
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [children, duration, i18n]);

  // Update content when children change (for external updates)
  useEffect(() => {
    if (!isTransitioning) {
      setContent(children);
    }
  }, [children, isTransitioning]);

  return (
    <div
      className={`transition-all ${
        isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
      } ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transformOrigin: "center",
      }}
    >
      {content}
    </div>
  );
};

export default LanguageTransition;
