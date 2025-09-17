import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  full_name?: string;
  phone_number?: string;
  role?: string;
  organization?: string;
  blockchain_id?: string;
  blockchain_hash?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    userData?: UserData
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Helper function to fetch user role
  const fetchUserRole = async (user: User) => {
    try {
      // First try to get role from user metadata (for immediate access)
      const roleFromMetadata = user.user_metadata?.role;
      if (roleFromMetadata) {
        setUserRole(roleFromMetadata);
        return;
      }

      // Then try to get from profiles table (this will be the authoritative source)
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "42P17") {
        // Ignore recursion errors for now
        console.error("Error fetching user role:", error);
        setUserRole("tourist"); // Default fallback
      } else if (profile?.role) {
        setUserRole(profile.role);
      } else {
        setUserRole("tourist"); // Default fallback
      }
    } catch (error) {
      console.error("Error in role fetch:", error);
      // Use role from metadata or default
      const roleFromMetadata = user.user_metadata?.role;
      setUserRole(roleFromMetadata || "tourist");
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event, session?.user?.email);

      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      // Fetch user role when user is authenticated
      if (session?.user) {
        await fetchUserRole(session.user);
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      // Fetch user role for existing session
      if (session?.user) {
        await fetchUserRole(session.user);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    userData?: UserData
  ) => {
    try {
      // Use the actual deployed URL for email redirect
      const redirectUrl = `${window.location.origin}/auth/verify`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData,
        },
      });

      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // For email confirmation flow, don't create profile immediately
      // Profile will be created after email verification
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Sign Up Successful",
          description:
            "Please check your email to verify your account before signing in.",
        });
      } else if (data.user && data.user.email_confirmed_at) {
        // If email is already confirmed (rare case), create profile immediately
        const profileData = {
          user_id: data.user.id,
          full_name: userData?.full_name || "",
          role: userData?.role || "tourist",
          phone_number: userData?.phone_number || "",
          organization: userData?.organization || "",
        };

        const { error: profileError } = await supabase
          .from("profiles")
          .insert([profileData]);

        if (profileError && profileError.code !== "23505") {
          // Ignore duplicate key errors
          console.error("Error creating profile:", profileError);
        }

        toast({
          title: "Account Created Successfully",
          description: "You can now sign in to your account.",
        });
      }

      return { error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Sign Up Error",
        description: errorMessage,
        variant: "destructive",
      });
      return {
        error: error instanceof Error ? error : new Error(errorMessage),
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      return { error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Sign In Error",
        description: errorMessage,
        variant: "destructive",
      });
      return {
        error: error instanceof Error ? error : new Error(errorMessage),
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Sign Out Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      } else {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
        return { error: null };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Sign Out Error",
        description: errorMessage,
        variant: "destructive",
      });
      return {
        error: error instanceof Error ? error : new Error(errorMessage),
      };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast({
          title: "Password Reset Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for password reset instructions.",
      });

      return { error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Password Reset Error",
        description: errorMessage,
        variant: "destructive",
      });
      return {
        error: error instanceof Error ? error : new Error(errorMessage),
      };
    }
  };

  const value = {
    user,
    session,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
