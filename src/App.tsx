import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ChatBotWrapper } from "@/components/ChatBotWrapper";
import "@/i18n";

// Lazy load route components
const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const TouristRegister = lazy(() => import("./pages/auth/register"));
const ForgotPassword = lazy(() => import("./pages/auth/forgot-password"));
const ResetPassword = lazy(() => import("./pages/auth/reset-password"));
const TouristDashboard = lazy(() => import("./pages/TouristDashboard"));
const AuthorityLogin = lazy(() => import("./pages/AuthorityLogin"));
const AuthorityDashboard = lazy(() => import("./pages/AuthorityDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const GeoFenceEditor = lazy(() => import("./pages/GeoFenceEditor"));
const Help = lazy(() => import("./pages/Help"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AboutSIH = lazy(() => import("./pages/AboutSIH"));
const SOSGuide = lazy(() => import("./pages/SOSGuide"));
const SafetyGuidelines = lazy(() => import("./pages/SafetyGuidelines"));
const TouristSupport = lazy(() => import("./pages/TouristSupport"));
const EmergencyContacts = lazy(() => import("./pages/EmergencyContacts"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
      gcTime: 30 * 60 * 1000, // Cache garbage collection after 30 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 2, // Retry failed queries twice
      networkMode: "online", // Only fetch when online
      refetchOnReconnect: true, // Refetch when reconnecting
    },
  },
});

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<Auth />} />
              <Route path="/auth/register" element={<TouristRegister />} />
              <Route
                path="/auth/forgot-password"
                element={<ForgotPassword />}
              />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="">
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <ProtectedRoute requiredRole="tourist">
                    <TouristRegister />
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
              <Route
                path="/admin/geofences"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <GeoFenceEditor />
                  </ProtectedRoute>
                }
              />
              <Route path="/help" element={<Help />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about-sih" element={<AboutSIH />} />
              <Route path="/sos-guide" element={<SOSGuide />} />
              <Route path="/safety-guidelines" element={<SafetyGuidelines />} />
              <Route path="/tourist-support" element={<TouristSupport />} />
              <Route
                path="/emergency-contacts"
                element={<EmergencyContacts />}
              />
              <Route path="/privacy" element={<NotFound />} />
              <Route path="/terms" element={<NotFound />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <ChatBotWrapper />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);
export default App;
