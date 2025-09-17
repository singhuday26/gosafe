import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Shield } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Navigate
        to={`/auth?returnUrl=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // Check role requirements
  if (requiredRole) {
    const requiredRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    if (!userRole || !requiredRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on user role
      const dashboardMap: { [key: string]: string } = {
        tourist: "/tourist",
        authority: "/authority",
        admin: "/admin",
      };

      const redirectPath = dashboardMap[userRole || "tourist"] || "/tourist";
      return <Navigate to={redirectPath} replace />;
    }
  } else {
    // If no specific role required, ensure user has a valid role
    if (!userRole) {
      return <Navigate to="/auth" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
