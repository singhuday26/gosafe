import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ChatBotWrapper } from "@/components/ChatBotWrapper";
import '@/i18n';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TouristRegister from "./pages/TouristRegister";
import TouristDashboard from "./pages/TouristDashboard";
import AuthorityLogin from "./pages/AuthorityLogin";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<Auth />} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBotWrapper />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
