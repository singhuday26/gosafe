import { supabase as supabaseAuth } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

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
  full_name?: string;
  role?: "tourist" | "admin" | "authority";
  phone_number?: string;
  organization?: string;
  assigned_geo_fence_ids?: string[] | null;
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
  full_name?: string;
  phone_number?: string;
  role?: "tourist" | "admin" | "authority";
  organization?: string;
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

      const { data, error } = await supabaseAuth.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (error) {
        // Check for specific error messages to provide better UX
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password");
        }
        if (error.message.includes("Email not confirmed")) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error("Login failed");
      }

      // Check if email is verified
      if (!data.user.email_confirmed_at) {
        throw new Error("EMAIL_NOT_VERIFIED");
      }

      // Get user profile
      const profile = await this.getUserProfile(data.user.id);

      return {
        id: data.user.id,
        email: data.user.email || "",
        name: profile.full_name || "",
        role: profile.role || "tourist",
        isVerified: true,
        digitalId: undefined, // Will be set separately if needed
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Don't wrap EMAIL_NOT_VERIFIED error
      if (errorMessage === "EMAIL_NOT_VERIFIED") {
        throw new Error("EMAIL_NOT_VERIFIED");
      }

      throw new Error(`Login failed: ${errorMessage}`);
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

      const { data, error } = await supabaseAuth.auth.signUp({
        email: userData.email.trim(),
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`,
          data: {
            full_name: userData.name.trim(),
            phone_number: userData.phone?.trim() || null,
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
        full_name: userData.name,
        phone_number: userData.phone,
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

  // New: Register Tourist with extended profile and optional document
  async registerTourist(args: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    nationality?: string;
    role?: "tourist";
    emergencyContactsJson: string; // serialized array
    documentUrl?: string;
    documentHash?: string;
  }): Promise<AuthUser> {
    const {
      email,
      password,
      name,
      phone,
      nationality,
      role = "tourist",
      emergencyContactsJson,
      documentUrl,
      documentHash,
    } = args;

    // Create auth user with metadata role
    const { data, error } = await supabaseAuth.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          role,
          full_name: name,
          phone_number: phone || null,
        },
      },
    });
    if (error || !data.user) {
      throw new Error(error?.message || "Failed to register");
    }

    // Create basic profile
    const profilePayload: Database["public"]["Tables"]["profiles"]["Insert"] = {
      user_id: data.user.id,
      full_name: name,
      phone_number: phone || null,
      role,
    };

    const { error: profileError } = await supabaseAuth
      .from("profiles")
      .insert([profilePayload]);
    if (profileError) {
      throw new Error(profileError.message);
    }

    // Create digital tourist ID with tourist-specific data
    const touristPayload: Database["public"]["Tables"]["digital_tourist_ids"]["Insert"] =
      {
        tourist_name: name,
        aadhaar_number: "", // Will be updated later if provided
        passport_number: nationality || "",
        trip_itinerary: "Tourist registration",
        emergency_contacts: JSON.parse(emergencyContactsJson),
        valid_from: new Date().toISOString(),
        valid_to: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // Valid for 1 year
        blockchain_hash: documentHash || `hash_${data.user.id}_${Date.now()}`,
        status: "active",
      };

    const { data: touristData, error: touristError } = await supabaseAuth
      .from("digital_tourist_ids")
      .insert([touristPayload])
      .select()
      .single();

    if (touristError) {
      throw new Error(touristError.message);
    }

    return {
      id: data.user.id,
      email,
      name,
      role,
      isVerified: false,
      digitalId: touristData?.id || undefined,
    };
  }

  async logout(): Promise<void> {
    try {
      const { error } = await supabaseAuth.auth.signOut();
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
      } = await supabaseAuth.auth.getUser();

      if (error || !user) {
        return null;
      }

      const profile = await this.getUserProfile(user.id);

      return {
        id: user.id,
        email: user.email || "",
        name: profile.full_name || "",
        role: profile.role || "tourist",
        isVerified: true,
        digitalId: undefined, // Will be set separately if needed
      };
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  }

  // New API: Send password reset email
  async forgotPassword(email: string): Promise<void> {
    try {
      if (!email?.trim()) {
        throw new Error("Email is required");
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      const redirectTo = `${window.location.origin}/auth/reset-password`;
      const { error } = await supabaseAuth.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo }
      );
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(
        `Password reset request failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // New API: Complete password reset (after user followed email link)
  async resetPassword(newPassword: string): Promise<void> {
    try {
      if (!newPassword?.trim()) {
        throw new Error("New password is required");
      }
      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      const { error } = await supabaseAuth.auth.updateUser({
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

  // New API: Resend verification email
  async resendVerification(email: string): Promise<void> {
    try {
      if (!email?.trim()) {
        throw new Error("Email is required");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      const { error } = await supabaseAuth.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(
        `Failed to resend verification email: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // New API: Check if user email is verified
  async isEmailVerified(email: string): Promise<boolean> {
    try {
      if (!email?.trim()) {
        return false;
      }

      const {
        data: { user },
      } = await supabaseAuth.auth.getUser();
      if (!user || user.email !== email.trim()) {
        return false;
      }

      return !!user.email_confirmed_at;
    } catch (error) {
      console.error("Failed to check email verification:", error);
      return false;
    }
  }

  // New API: Get role-based redirect URL
  getRedirectUrlForRole(role: string): string {
    switch (role) {
      case "tourist":
        return "/tourist/dashboard";
      case "authority":
        return "/authority/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/dashboard";
    }
  }

  async verifyDigitalId(digitalId: string): Promise<boolean> {
    try {
      // Validate input
      if (!digitalId?.trim()) {
        return false;
      }

      const { data, error } = await supabaseAuth
        .from("digital_tourist_ids")
        .select("status")
        .eq("id", digitalId.trim())
        .single();

      if (error) {
        return false;
      }

      return data?.status === "active";
    } catch (error) {
      console.error("Digital ID verification failed:", error);
      return false;
    }
  }

  private async getUserProfile(userId: string): Promise<UserProfile> {
    if (!userId?.trim()) {
      throw new Error("User ID is required");
    }

    const { data, error } = await supabaseAuth
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Failed to get user profile:", error);
      // Return default profile if not found
      return {
        user_id: userId,
        full_name: "",
        role: "tourist",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    // Type assertion to ensure role compatibility
    const profile: UserProfile = {
      user_id: data.user_id,
      full_name: data.full_name,
      role: (data.role as "tourist" | "admin" | "authority") || "tourist",
      phone_number: data.phone_number,
      organization: data.organization,
      assigned_geo_fence_ids: data.assigned_geo_fence_ids,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return profile;
  }

  private async createUserProfile(
    profileData: CreateProfileData
  ): Promise<void> {
    // Validate required fields
    if (!profileData.user_id?.trim()) {
      throw new Error("User ID is required for profile creation");
    }

    const payload: Database["public"]["Tables"]["profiles"]["Insert"] = {
      user_id: profileData.user_id.trim(),
      full_name: profileData.full_name?.trim() || null,
      phone_number: profileData.phone_number?.trim() || null,
      role: profileData.role || "tourist",
      organization: profileData.organization?.trim() || null,
    };

    const { error } = await supabaseAuth.from("profiles").insert([payload]);

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
