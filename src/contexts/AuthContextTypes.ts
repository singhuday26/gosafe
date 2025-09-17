import { createContext } from "react";
import { User, Session } from "@supabase/supabase-js";

interface UserData {
  full_name?: string;
  phone_number?: string;
  role?: string;
  organization?: string;
  blockchain_id?: string;
  blockchain_hash?: string;
}

export interface AuthContextType {
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
  resendVerification: (email: string) => Promise<{ error: Error | null }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export type { UserData };
