import { supabase } from "../lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "tourist" | "admin" | "authority";
  isVerified: boolean;
  digitalId?: string;
}

export interface UserProfile {
  user_id: string;
  name?: string;
  role?: "tourist" | "admin" | "authority";
  is_verified?: boolean;
  digital_id?: string;
  full_name?: string;
  phone?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  nationality?: string;
  age?: number;
  preferences?: Record<string, string | number | boolean>;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: "tourist" | "admin";
}

export interface CreateProfileData {
  user_id: string;
  email?: string;
  name?: string;
  phone?: string;
  role?: "tourist" | "admin" | "authority";
  emergency_contact?: string;
  emergency_phone?: string;
  nationality?: string;
  age?: number;
}

export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      // Validate input
      if (!credentials.email?.trim()) {
        throw new Error("Email is required");
      }

      if (!credentials.password?.trim()) {
        throw new Error("Password is required");
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        throw new Error("Invalid email format");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error("Login failed");
      }

      // Get user profile
      const profile = await this.getUserProfile(data.user.id);

      return {
        id: data.user.id,
        email: data.user.email || "",
        name: profile.name || "",
        role: profile.role || "tourist",
        isVerified: profile.is_verified || false,
        digitalId: profile.digital_id,
      };
    } catch (error) {
      throw new Error(
        `Login failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async register(userData: RegisterData): Promise<AuthUser> {
    try {
      // Validate input
      if (!userData.email?.trim()) {
        throw new Error("Email is required");
      }

      if (!userData.password?.trim()) {
        throw new Error("Password is required");
      }

      if (!userData.name?.trim()) {
        throw new Error("Name is required");
      }

      if (userData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error("Invalid email format");
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email.trim(),
        password: userData.password,
        options: {
          data: {
            name: userData.name.trim(),
            phone: userData.phone?.trim() || null,
            role: userData.role || "tourist",
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error("Registration failed");
      }

      // Create user profile
      await this.createUserProfile({
        user_id: data.user.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role || "tourist",
      });

      return {
        id: data.user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role || "tourist",
        isVerified: false,
      };
    } catch (error) {
      throw new Error(
        `Registration failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(
        `Logout failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      const profile = await this.getUserProfile(user.id);

      return {
        id: user.id,
        email: user.email || "",
        name: profile.name || "",
        role: profile.role || "tourist",
        isVerified: profile.is_verified || false,
        digitalId: profile.digital_id,
      };
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      // Validate input
      if (!email?.trim()) {
        throw new Error("Email is required");
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(
        `Password reset failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      // Validate input
      if (!newPassword?.trim()) {
        throw new Error("New password is required");
      }

      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(
        `Password update failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async verifyDigitalId(digitalId: string): Promise<boolean> {
    try {
      // Validate input
      if (!digitalId?.trim()) {
        return false;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("is_verified")
        .eq("digital_id", digitalId.trim())
        .single();

      if (error) {
        return false;
      }

      return data?.is_verified || false;
    } catch (error) {
      console.error("Digital ID verification failed:", error);
      return false;
    }
  }

  private async getUserProfile(userId: string): Promise<UserProfile> {
    if (!userId?.trim()) {
      throw new Error("User ID is required");
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Failed to get user profile:", error);
      // Return default profile if not found
      return {
        user_id: userId,
        name: "",
        role: "tourist",
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return data;
  }

  private async createUserProfile(
    profileData: CreateProfileData
  ): Promise<void> {
    // Validate required fields
    if (!profileData.user_id?.trim()) {
      throw new Error("User ID is required for profile creation");
    }

    const { error } = await supabase.from("user_profiles").insert([
      {
        ...profileData,
        user_id: profileData.user_id.trim(),
        email: profileData.email?.trim() || null,
        name: profileData.name?.trim() || null,
        phone: profileData.phone?.trim() || null,
        emergency_contact: profileData.emergency_contact?.trim() || null,
        emergency_phone: profileData.emergency_phone?.trim() || null,
        nationality: profileData.nationality?.trim() || null,
      },
    ]);

    if (error) {
      console.error("Failed to create user profile:", error);
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  }

  // Mock methods for development (replace with real implementation)
  async mockLogin(role: "tourist" | "admin" | "authority"): Promise<AuthUser> {
    const mockUser: AuthUser = {
      id: `mock-${role}-${Date.now()}`,
      email: `${role}@gosafe.local`,
      name: `Mock ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role,
      isVerified: true,
      digitalId: role === "tourist" ? `DID-${Date.now()}` : undefined,
    };

    // Store in localStorage for persistence
    localStorage.setItem("currentUser", JSON.stringify(mockUser));
    if (role === "tourist") {
      localStorage.setItem(
        "currentTouristId",
        mockUser.digitalId || mockUser.id
      );
      localStorage.setItem("touristName", mockUser.name);
    } else if (role === "admin") {
      localStorage.setItem("adminToken", mockUser.id);
      localStorage.setItem("adminName", mockUser.name);
    }

    return mockUser;
  }
}
