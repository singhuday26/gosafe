// Service class exports
export { AuthService } from "./authService";
export { SOSService } from "./sosService";
export { GeoService } from "./geoService";

// Auth service types
export type {
  AuthUser,
  LoginCredentials,
  RegisterData,
  UserProfile,
  CreateProfileData,
} from "./authService";

// SOS service types
export type {
  SOSRequest,
  SOSResponse,
  SOSAlert,
  EmergencyContact,
  NotificationAlertData,
} from "./sosService";

// Geo service types
export type {
  LocationUpdate,
  GeoFenceAlert,
  RiskArea,
  SafetyScore,
} from "./geoService";

// Re-import for instance creation
import { AuthService } from "./authService";
import { SOSService } from "./sosService";
import { GeoService } from "./geoService";

// Service instances for easy access
export const authService = AuthService.getInstance();
export const sosService = SOSService.getInstance();
export const geoService = GeoService.getInstance();
