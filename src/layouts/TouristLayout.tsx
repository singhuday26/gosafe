import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Shield, User, LogOut, Settings, HelpCircle } from "lucide-react";
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

interface TouristLayoutProps {
  children?: React.ReactNode;
}

export const TouristLayout: React.FC<TouristLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const currentTouristId = localStorage.getItem("currentTouristId");
  const touristName = localStorage.getItem("touristName") || "Tourist";

  const handleLogout = () => {
    localStorage.removeItem("currentTouristId");
    localStorage.removeItem("touristName");
    toast({
      title: "Logged out",
      description: "You have been safely logged out.",
    });
    navigate("/");
  };

  const navigationItems = [
    {
      title: "Dashboard",
      path: "/tourist-dashboard",
      icon: Shield,
    },
    {
      title: "Profile",
      path: "/tourist/profile",
      icon: User,
    },
    {
      title: "SOS History",
      path: "/tourist/sos-history",
      icon: Shield,
    },
    {
      title: "Help",
      path: "/help",
      icon: HelpCircle,
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
                <h1 className="text-xl font-bold">GoSafe Tourist Portal</h1>
                {currentTouristId && (
                  <p className="text-sm text-muted-foreground">
                    ID: {currentTouristId}
                  </p>
                )}
              </div>
            </div>

            {/* Navigation for larger screens */}
            <nav className="hidden md:flex items-center space-x-4">
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

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 border-green-200"
              >
                <Shield className="mr-1 h-3 w-3" />
                Verified
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src="/placeholder-user.jpg"
                        alt={touristName}
                      />
                      <AvatarFallback>
                        {touristName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {touristName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Tourist ID: {currentTouristId}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Mobile Navigation */}
                  <div className="md:hidden">
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

                  <DropdownMenuItem
                    onClick={() => navigate("/tourist/profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/tourist/settings")}
                  >
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

      {/* Main Content */}
      <main className="flex-1">{children || <Outlet />}</main>

      {/* Chatbot */}
      <ChatBotWrapper forceRole="tourist" enabled={true} />

      {/* Footer */}
      <footer className="bg-card border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                GoSafe Tourist Safety Platform
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Emergency: <span className="font-semibold">1363</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
