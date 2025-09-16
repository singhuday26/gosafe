import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  Users,
  AlertTriangle,
  MapPin,
  Settings,
  LogOut,
  Bell,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChatBotWrapper } from "@/components/ChatBotWrapper";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const adminName = localStorage.getItem("adminName") || "Admin";
  const activeAlerts = 3; // Mock data - should come from context/state

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    toast({
      title: "Logged out",
      description: "You have been safely logged out.",
    });
    navigate("/authority-login");
  };

  const navigationItems = [
    {
      title: "Dashboard",
      path: "/admin-dashboard",
      icon: BarChart3,
    },
    {
      title: "SOS Queue",
      path: "/admin/sos-queue",
      icon: AlertTriangle,
    },
    {
      title: "Tourist Management",
      path: "/admin/tourists",
      icon: Users,
    },
    {
      title: "GeoFence Management",
      path: "/admin/geofences",
      icon: MapPin,
    },
    {
      title: "Analytics",
      path: "/admin/analytics",
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary mr-3" />
              <div>
                <h1 className="text-xl font-bold">GoSafe Admin Portal</h1>
                <p className="text-sm text-muted-foreground">
                  Authority Dashboard
                </p>
              </div>
            </div>

            {/* Navigation for larger screens */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Button>
                );
              })}
            </nav>

            {/* Admin Controls */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {activeAlerts > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {activeAlerts}
                  </Badge>
                )}
              </Button>

              {/* Admin Badge */}
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 border-blue-200"
              >
                <Shield className="mr-1 h-3 w-3" />
                Admin
              </Badge>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src="/placeholder-admin.jpg"
                        alt={adminName}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {adminName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {adminName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Authority Administrator
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Mobile Navigation */}
                  <div className="lg:hidden">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem
                          key={item.path}
                          onClick={() => navigate(item.path)}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator />
                  </div>

                  <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar for larger screens */}
      <div className="flex">
        <aside className="hidden md:flex w-64 min-h-screen bg-card border-r">
          <div className="flex flex-col w-full">
            {/* Quick Stats */}
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold mb-3">Quick Overview</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Active Tourists
                  </span>
                  <Badge variant="secondary">127</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    SOS Alerts
                  </span>
                  <Badge variant="destructive">{activeAlerts}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Safe Zones
                  </span>
                  <Badge variant="default">12</Badge>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => navigate(item.path)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Button>
                  );
                })}
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">{children || <Outlet />}</main>
      </div>

      {/* Chatbot */}
      <ChatBotWrapper forceRole="admin" enabled={true} />

      {/* Footer */}
      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                GoSafe Admin Portal - Authority Management System
              </span>
            </div>
            <div className="text-sm text-muted-foreground">Version 1.0.0</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
