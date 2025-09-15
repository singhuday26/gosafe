// Map Components
export { MapComponent } from "./map";
export type { MapComponentProps, Tourist, GeoFence, SOSAlert } from "./map";

// SOS Components
export { SOSButton, SOSOverlay, SOSHistory } from "./sos";
export type {
  SOSAlert as SOSComponentAlert,
  EmergencyContact,
  SOSConfig,
} from "./sos";

// Dashboard Components
export { StatCard, AlertQueue, ActivityFeed } from "./dashboard";
export type { DashboardStats, DashboardAlert, ActivityItem } from "./dashboard";

// GeoFence Components
export { GeoFenceEditor, GeoFenceList } from "./geofence";

// Profile Components
export { UserProfile, ProfileForm, EmergencyContacts } from "./profile";
export type {
  UserProfileData,
  EmergencyContactData,
  UserPreferences,
} from "./profile";

// UI Components (re-exports)
export { Button } from "./ui/button";
export { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
export { Input } from "./ui/input";
export { Badge } from "./ui/badge";
export { Switch } from "./ui/switch";

// Existing Components
export { ChatBot } from "./ChatBot";
export { ChatBotWrapper } from "./ChatBotWrapper";
export { DashboardButtons } from "./DashboardButtons";
export { default as LanguageSelector } from "./LanguageSelector";
export { default as LanguageTransition } from "./LanguageTransition";
export { default as ProtectedRoute } from "./ProtectedRoute";
