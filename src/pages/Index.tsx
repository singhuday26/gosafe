import {
  Shield,
  Users,
  MapPin,
  UserCheck,
  AlertTriangle,
  Globe,
  LogIn,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSelector from "@/components/LanguageSelector";
import LanguageTransition from "@/components/LanguageTransition";
import { useTranslation } from "react-i18next";

const Index = () => {
  const navigate = useNavigate();
  const { user, userRole, signOut, loading } = useAuth();
  const { t } = useTranslation();

  const featureIcons = {
    digitalId: Shield,
    geoFencing: MapPin,
    sos: AlertTriangle,
    authority: Users,
  };

  const features = [
    {
      icon: featureIcons.digitalId,
      key: "digitalId",
      title: t("features.list.digitalId.title"),
      description: t("features.list.digitalId.description"),
    },
    {
      icon: featureIcons.geoFencing,
      key: "geoFencing",
      title: t("features.list.geoFencing.title"),
      description: t("features.list.geoFencing.description"),
    },
    {
      icon: featureIcons.sos,
      key: "sos",
      title: t("features.list.sos.title"),
      description: t("features.list.sos.description"),
    },
    {
      icon: featureIcons.authority,
      key: "authority",
      title: t("features.list.authority.title"),
      description: t("features.list.authority.description"),
    },
  ];

  const stats = [
    {
      key: "activeTourists",
      label: t("stats.activeTourists.label"),
      value: t("stats.activeTourists.value"),
      trend: t("stats.activeTourists.trend"),
    },
    {
      key: "safetyScore",
      label: t("stats.safetyScore.label"),
      value: t("stats.safetyScore.value"),
      trend: t("stats.safetyScore.trend"),
    },
    {
      key: "responseTime",
      label: t("stats.responseTime.label"),
      value: t("stats.responseTime.value"),
      trend: t("stats.responseTime.trend"),
    },
    {
      key: "incidentsResolved",
      label: t("stats.incidentsResolved.label"),
      value: t("stats.incidentsResolved.value"),
      trend: t("stats.incidentsResolved.trend"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-ne-hero">
        <div className="absolute inset-0 bg-black/10 gradient-ne-hills"></div>
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center gap-1 sm:gap-2 z-10">
          <LanguageSelector />
          {user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3"
                onClick={() => {
                  const dashboardMap: { [key: string]: string } = {
                    tourist: "/tourist",
                    authority: "/authority",
                    admin: "/admin",
                  };
                  navigate(dashboardMap[userRole || "tourist"] || "/tourist");
                }}
              >
                <span className="hidden sm:inline">{t("nav.dashboard")}</span>
                <span className="sm:hidden">Dashboard</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3"
                onClick={signOut}
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">{t("nav.signOut")}</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="text-xs sm:text-sm px-2 sm:px-3"
              onClick={() => navigate("/auth")}
            >
              <LogIn className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">{t("nav.signIn")}</span>
              <span className="sm:hidden">Sign In</span>
            </Button>
          )}
        </div>
        <div className="relative container mx-auto px-4 py-12 sm:py-16 lg:py-20 text-center text-white">
          <LanguageTransition>
            <Badge
              variant="secondary"
              className="mb-4 sm:mb-6 bg-white/10 text-white border-white/20 font-body text-xs sm:text-sm"
            >
              {t("home.badge")}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6 leading-tight px-2">
              {t("home.title.line1")}
              <br />
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                {t("home.title.line2")}
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-white/90 max-w-3xl mx-auto font-body px-2">
              {t("home.description")}
            </p>
          </LanguageTransition>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              onClick={() => (user ? navigate("/tourist") : navigate("/auth"))}
            >
              <UserCheck className="mr-2 h-5 w-5" />
              {t("home.buttons.tourist")}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() =>
                user && userRole === "authority"
                  ? navigate("/authority")
                  : navigate("/auth")
              }
            >
              <Shield className="mr-2 h-5 w-5" />
              {t("home.buttons.authority")}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-5xl mx-auto px-2">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="ne-card bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in hover:bg-white/15 transition-all"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white mb-1 font-heading">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-white/80 mb-2 font-body leading-tight">
                    {stat.label}
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-xs font-body ${
                      stat.trend.startsWith("+")
                        ? "bg-ne-forest-green/20 text-white border-ne-forest-green/30"
                        : "bg-ne-sunset-orange/20 text-white border-ne-sunset-orange/30"
                    }`}
                  >
                    {stat.trend}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 gradient-ne-mist">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 border-ne-tea-brown text-ne-tea-brown font-body"
            >
              <Globe className="mr-2 h-4 w-4" />
              {t("features.badge")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-ne-tea-brown">
              {t("features.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-body">
              {t("features.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="ne-card ne-tribal-border shadow-ne-soft hover:shadow-ne-medium transition-ne animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="text-center">
                  <div className="inline-flex p-3 rounded-full bg-ne-tea-brown shadow-ne-glow mb-4 mx-auto">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-heading text-ne-tea-brown">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base font-body">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="ne-card shadow-ne-soft hover:shadow-ne-medium transition-ne hover:scale-105">
              <CardHeader>
                <CardTitle className="flex items-center font-heading text-ne-tea-brown">
                  <UserCheck className="mr-2 h-5 w-5 text-ne-tea-brown" />
                  {t("home.cards.tourist_registration.title")}
                </CardTitle>
                <CardDescription className="font-body">
                  {t("home.cards.tourist_registration.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() =>
                    user ? navigate("/register") : navigate("/auth?tab=signup")
                  }
                >
                  {user
                    ? t("home.cards.tourist_registration.button_authenticated")
                    : t(
                        "home.cards.tourist_registration.button_unauthenticated"
                      )}
                </Button>
              </CardContent>
            </Card>

            <Card className="ne-card shadow-ne-soft hover:shadow-ne-medium transition-ne hover:scale-105">
              <CardHeader>
                <CardTitle className="flex items-center font-heading text-ne-tea-brown">
                  <Shield className="mr-2 h-5 w-5 text-ne-tea-brown" />
                  {t("home.cards.authority_access.title")}
                </CardTitle>
                <CardDescription className="font-body">
                  {t("home.cards.authority_access.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    user && userRole === "authority"
                      ? navigate("/authority")
                      : navigate("/auth")
                  }
                >
                  {t("home.cards.authority_access.button")}
                </Button>
              </CardContent>
            </Card>

            <Card className="ne-card shadow-ne-soft hover:shadow-ne-medium transition-ne hover:scale-105">
              <CardHeader>
                <CardTitle className="flex items-center font-heading text-ne-tea-brown">
                  <Users className="mr-2 h-5 w-5 text-ne-tea-brown" />
                  {t("home.cards.admin_panel.title")}
                </CardTitle>
                <CardDescription className="font-body">
                  {t("home.cards.admin_panel.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    user && userRole === "admin"
                      ? navigate("/admin")
                      : navigate("/auth")
                  }
                >
                  {t("home.cards.admin_panel.button")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ne-tea-brown text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 mr-2" />
              <span className="text-2xl font-bold font-heading">
                {t("footer.title")}
              </span>
            </div>
            <p className="text-white/80 mb-4 font-body">
              {t("footer.subtitle")}
            </p>
            <div className="mb-4 font-body text-white/70">
              {t("footer.description")}
            </div>
          </div>

          {/* Useful Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 text-sm">
            <div>
              <h4 className="font-semibold mb-3 text-white">
                {t("footer.sections.government_resources.title")}
              </h4>
              <ul className="space-y-2 text-white/80">
                <li>
                  <a
                    href="https://www.incredibleindia.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {t(
                      "footer.sections.government_resources.links.incredible_india"
                    )}
                  </a>
                </li>
                <li>
                  <a
                    href="https://tourism.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {t(
                      "footer.sections.government_resources.links.ministry_tourism"
                    )}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.mha.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {t(
                      "footer.sections.government_resources.links.ministry_home_affairs"
                    )}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-white">
                {t("footer.sections.northeast_tourism.title")}
              </h4>
              <ul className="space-y-2 text-white/80">
                <li>
                  <a
                    href="https://assamtourism.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {t("footer.sections.northeast_tourism.links.assam_tourism")}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.arunachaltourism.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {t(
                      "footer.sections.northeast_tourism.links.arunachal_tourism"
                    )}
                  </a>
                </li>
                <li>
                  <a
                    href="https://meghalayatourism.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {t(
                      "footer.sections.northeast_tourism.links.meghalaya_tourism"
                    )}
                  </a>
                </li>
                <li>
                  <a
                    href="https://manipurtourism.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {t(
                      "footer.sections.northeast_tourism.links.manipur_tourism"
                    )}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-white">
                {t("footer.sections.emergency_services.title")}
              </h4>
              <ul className="space-y-2 text-white/80">
                <li>
                  <a
                    href="tel:100"
                    className="hover:text-white transition-colors"
                  >
                    {t("footer.sections.emergency_services.links.police")}
                  </a>
                </li>
                <li>
                  <a
                    href="tel:108"
                    className="hover:text-white transition-colors"
                  >
                    {t("footer.sections.emergency_services.links.ambulance")}
                  </a>
                </li>
                <li>
                  <a
                    href="tel:1363"
                    className="hover:text-white transition-colors"
                  >
                    {t(
                      "footer.sections.emergency_services.links.tourist_helpline"
                    )}
                  </a>
                </li>
                <li>
                  <a
                    href="tel:112"
                    className="hover:text-white transition-colors"
                  >
                    {t("footer.sections.emergency_services.links.emergency")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-white">
                {t("footer.sections.support.title")}
              </h4>
              <ul className="space-y-2 text-white/80">
                <li>
                  <button
                    onClick={() => navigate("/help")}
                    className="hover:text-white transition-colors text-left"
                  >
                    {t("footer.sections.support.links.help_center")}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/contact")}
                    className="hover:text-white transition-colors text-left"
                  >
                    {t("footer.sections.support.links.contact_us")}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/privacy")}
                    className="hover:text-white transition-colors text-left"
                  >
                    {t("footer.sections.support.links.privacy_policy")}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/terms")}
                    className="hover:text-white transition-colors text-left"
                  >
                    {t("footer.sections.support.links.terms_of_service")}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6 text-center">
            <Badge
              variant="secondary"
              className="bg-white/10 text-white border-white/20 font-body mb-3"
            >
              {t("footer.problem_statement")}
            </Badge>
            <p className="text-white/60 text-xs">{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
