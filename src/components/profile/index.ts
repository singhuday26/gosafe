// Profile Components
export { UserProfile } from "./UserProfile";
export { ProfileForm } from "./ProfileForm";
export { EmergencyContacts } from "./EmergencyContacts";

// Profile Types
export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
  age?: number;
  emergencyContacts: EmergencyContactData[];
  preferences: UserPreferences;
}

export interface EmergencyContactData {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: "primary" | "secondary";
}

export interface UserPreferences {
  language: string;
  notifications: {
    sms: boolean;
    email: boolean;
    push: boolean;
  };
  privacy: {
    shareLocation: boolean;
    allowTracking: boolean;
  };
  accessibility: {
    fontSize: "small" | "medium" | "large";
    highContrast: boolean;
  };
}
