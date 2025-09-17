import React, { useState } from "react";
import { Shield, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const mainNavItems = [
    { label: "Home", href: "/", id: "home" },
    {
      label: "Tourist Registration",
      href: "/auth?tab=signup",
      id: "registration",
      description: "Sign up for GoSafe digital ID",
    },
    {
      label: "Safety Guidelines",
      href: "/safety-guidelines",
      id: "guidelines",
    },
    { label: "SOS Guide", href: "/sos-guide", id: "sos-guide" },
    {
      label: "Travel Resources",
      href: "/travel-resources",
      id: "travel-resources",
      submenu: [
        { label: "Emergency Contacts", href: "/emergency-contacts" },
        { label: "Regional Info", href: "/regional-info" },
        { label: "Cultural Guidelines", href: "/cultural-guidelines" },
      ],
    },
    { label: "Tourist Support", href: "/tourist-support", id: "support" },
    { label: "About GoSafe", href: "/about", id: "about" },
    { label: "Contact Us", href: "/contact", id: "contact" },
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => handleNavigation("/")}
          >
            <Shield className="h-8 w-8 text-primary mr-2" />
            <div>
              <h1 className="text-xl font-bold">GoSafe</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Tourist Safety Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-4">
                {mainNavItems.map((item) => (
                  <NavigationMenuItem key={item.id}>
                    {item.submenu ? (
                      <>
                        <NavigationMenuTrigger className="h-9 px-3">
                          {item.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                            {item.submenu.map((subItem) => (
                              <NavigationMenuLink
                                key={subItem.href}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                                onClick={() => handleNavigation(subItem.href)}
                              >
                                <div className="text-sm font-medium leading-none">
                                  {subItem.label}
                                </div>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink
                        className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                        onClick={() => handleNavigation(item.href)}
                      >
                        {item.label}
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center space-x-4">
            <LanguageSelector />

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/help")}
              className="text-sm"
            >
              Help Center
            </Button>

            <Button size="sm" onClick={() => navigate("/auth")}>
              Sign In / Register
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center space-x-2">
            <LanguageSelector />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center">
                    <Shield className="h-6 w-6 text-primary mr-2" />
                    GoSafe Menu
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {/* Mobile Navigation Items */}
                  {mainNavItems.map((item) => (
                    <div key={item.id}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => handleNavigation(item.href)}
                      >
                        {item.label}
                      </Button>
                      {item.submenu && (
                        <div className="ml-4 mt-2 space-y-2">
                          {item.submenu.map((subItem) => (
                            <Button
                              key={subItem.href}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-left text-sm text-muted-foreground"
                              onClick={() => handleNavigation(subItem.href)}
                            >
                              {subItem.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="border-t pt-4 space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleNavigation("/help")}
                    >
                      Help Center
                    </Button>

                    <Button
                      className="w-full"
                      onClick={() => handleNavigation("/auth")}
                    >
                      Sign In / Register
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
