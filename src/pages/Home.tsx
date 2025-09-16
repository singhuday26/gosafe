import React from "react";
import Navigation from "@/components/landing/Navigation";
import HeroSection from "@/components/landing/HeroSection";
import QuickStatsStrip from "@/components/landing/QuickStatsStrip";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ProblemStatementCard from "@/components/landing/ProblemStatementCard";
import LiveDemoSection from "@/components/landing/LiveDemoSection";
import PartnershipsCompliance from "@/components/landing/PartnershipsCompliance";
import EnhancedFooter from "@/components/landing/EnhancedFooter";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <HeroSection />

      {/* Quick Stats Strip */}
      <QuickStatsStrip />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Problem Statement */}
      <ProblemStatementCard />

      {/* Live Demo */}
      <LiveDemoSection />

      {/* Partnerships & Compliance */}
      <PartnershipsCompliance />

      {/* Enhanced Footer */}
      <EnhancedFooter />
    </div>
  );
};

export default Home;
