import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user role when user is authenticated
        if (session?.user) {
          setTimeout(async () => {
            try {
              // First try to get role from user metadata (for immediate access)
              const roleFromMetadata = session.user.user_metadata?.role;
              if (roleFromMetadata) {
                setUserRole(roleFromMetadata);
              }

              // Then try to get from profiles table (this will be the authoritative source)
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('user_id', session.user.id)
                .maybeSingle();
              
              if (error && error.code !== '42P17') { // Ignore recursion errors for now
                console.error('Error fetching user role:', error);
              } else if (profile?.role) {
                setUserRole(profile.role);
              } else if (!roleFromMetadata) {
                // Fallback to default role if no profile exists yet
                setUserRole('tourist'); 
              }
            } catch (error) {
              console.error('Error in role fetch:', error);
              // Use role from metadata or default
              const roleFromMetadata = session.user.user_metadata?.role;
              setUserRole(roleFromMetadata || 'tourist');
            }
          }, 0);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user role for existing session
        setTimeout(async () => {
          try {
            // First try to get role from user metadata
            const roleFromMetadata = session.user.user_metadata?.role;
            if (roleFromMetadata) {
              setUserRole(roleFromMetadata);
            }

            // Then try to get from profiles table
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('user_id', session.user.id)
              .maybeSingle();
            
            if (error && error.code !== '42P17') { // Ignore recursion errors
              console.error('Error fetching user role:', error);
            } else if (profile?.role) {
              setUserRole(profile.role);
            } else if (!roleFromMetadata) {
              setUserRole('tourist');
            }
          } catch (error) {
            console.error('Error in role fetch:', error);
            const roleFromMetadata = session.user.user_metadata?.role;
            setUserRole(roleFromMetadata || 'tourist');
          }
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      // Use the actual deployed URL for email redirect
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Create profile if sign up successful and user is confirmed
      if (data.user && !error) {
        // Only try to create profile if user is confirmed (for immediate signups)
        // For email confirmation flows, this will be handled after email verification
        if (data.user.email_confirmed_at || !data.user.confirmation_sent_at) {
          const profileData = {
            user_id: data.user.id,
            full_name: userData?.full_name || '',
            role: userData?.role || 'tourist',
            phone_number: userData?.phone_number || '',
            organization: userData?.organization || '',
          };

          const { error: profileError } = await supabase
            .from('profiles')
            .insert([profileData]);

          if (profileError) {
            console.error('Error creating profile:', profileError);
            // Don't show this as an error to user since signup was successful
          }
        }
      }

      toast({
        title: "Sign Up Successful",
        description: data.user?.email_confirmed_at 
          ? "Account created successfully!" 
          : "Please check your email to verify your account.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
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
    } catch (error: any) {
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
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
      } else {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign Out Error",
        description: error.message,
        variant: "destructive",
      });
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
    } catch (error: any) {
      toast({
        title: "Password Reset Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
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