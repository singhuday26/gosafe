/*
 * GoSafe App.tsx - STABLE VERSION
 * 
 * ✅ WORKING STATE: September 17, 2025
 * - Authentication working with timeout protection
 * - All navigation routes restored and functional
 * - No infinite loading or white screen issues
 * - Fast refresh working properly
 * 
 * ⚠️ CAUTION: Do not modify this file without creating a backup
 * Backup saved as: App.working-backup.tsx
 * 
 * Temporarily disabled (can be re-enabled when needed):
 * - ChatBotWrapper (was causing reload issues)
 * - AnomalyDetectionProvider (was causing reload issues)  
 * - @/i18n internationalization (was causing conflicts)
 */

import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
// Temporarily removed problematic imports
// import { ChatBotWrapper } from "@/components/ChatBotWrapper";
// import { AnomalyDetectionProvider } from "@/components/AnomalyDetectionProvider";
// import "@/i18n";

// Lazy load route components - Essential routes (keep current working state)
const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const Login = lazy(() => import("./pages/auth/Login"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const EmailVerify = lazy(() => import("./pages/auth/EmailVerify"));
const TouristRegister = lazy(() => import("./pages/auth/register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/reset-password"));
const TouristDashboard = lazy(() => import("./pages/TouristDashboard"));
const AuthorityLogin = lazy(() => import("./pages/AuthorityLogin"));
const AuthorityDashboard = lazy(() => import("./pages/AuthorityDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TouristRegistrationFlow = lazy(
  () => import("./pages/TouristRegistrationFlow")
);
const EmailVerificationHandler = lazy(
  () => import("./pages/auth/EmailVerificationHandler")
);

// Additional navigation routes (restoring missing links)
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const SafetyGuidelines = lazy(() => import("./pages/SafetyGuidelines"));
const SOSGuide = lazy(() => import("./pages/SOSGuide"));
const TravelResources = lazy(() => import("./pages/TravelResources"));
const EmergencyContacts = lazy(() => import("./pages/EmergencyContacts"));
const RegionalInfo = lazy(() => import("./pages/RegionalInfo"));
const CulturalGuidelines = lazy(() => import("./pages/CulturalGuidelines"));
const TouristSupport = lazy(() => import("./pages/TouristSupport"));
const Help = lazy(() => import("./pages/Help"));
const Demo = lazy(() => import("./pages/Demo"));
const AboutSIH = lazy(() => import("./pages/AboutSIH"));
const GeoFenceEditor = lazy(() => import("./pages/GeoFenceEditor"));
const BlockchainTouristRegistration = lazy(
  () => import("./pages/BlockchainTouristRegistration")
);
const SupabaseTest = lazy(() => import("./components/SupabaseConnectionTest"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2,
      networkMode: "online",
      refetchOnReconnect: true,
    },
  },
});

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  console.log("App: Rendering - Main App");

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Core Routes - Keep exactly as working */}
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<SignUp />} />
                <Route path="/auth/verify" element={<EmailVerify />} />
                <Route
                  path="/auth/verification-handler"
                  element={<EmailVerificationHandler />}
                />
                <Route
                  path="/auth/callback"
                  element={<EmailVerificationHandler />}
                />
                <Route path="/auth/authority" element={<AuthorityLogin />} />
                <Route path="/auth/register" element={<TouristRegister />} />
                <Route
                  path="/auth/forgot-password"
                  element={<ForgotPassword />}
                />
                <Route
                  path="/auth/reset-password"
                  element={<ResetPassword />}
                />
                <Route
                  path="/blockchain-tourist-registration"
                  element={<TouristRegistrationFlow />}
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <TouristDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tourist"
                  element={
                    <ProtectedRoute requiredRole="tourist">
                      <TouristDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/authority/login" element={<AuthorityLogin />} />
                <Route
                  path="/authority"
                  element={
                    <ProtectedRoute requiredRole="authority">
                      <AuthorityDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Navigation Routes - Restoring missing links */}
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/safety-guidelines" element={<SafetyGuidelines />} />
                <Route path="/sos-guide" element={<SOSGuide />} />
                <Route path="/travel-resources" element={<TravelResources />} />
                <Route path="/emergency-contacts" element={<EmergencyContacts />} />
                <Route path="/regional-info" element={<RegionalInfo />} />
                <Route path="/cultural-guidelines" element={<CulturalGuidelines />} />
                <Route path="/tourist-support" element={<TouristSupport />} />
                <Route path="/help" element={<Help />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/about-sih" element={<AboutSIH />} />
                
                {/* Additional routes that were present before */}
                <Route
                  path="/register"
                  element={
                    <ProtectedRoute requiredRole="tourist">
                      <TouristRegister />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/geofences"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <GeoFenceEditor />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/blockchain-tourist-registration-old"
                  element={<BlockchainTouristRegistration />}
                />
                <Route path="/supabase-test" element={<SupabaseTest />} />
                <Route path="/privacy" element={<NotFound />} />
                <Route path="/terms" element={<NotFound />} />
                
                {/* Catch-all route - keep at the end */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
