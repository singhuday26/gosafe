export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string
          metadata: Json | null
          response_time_ms: number | null
          session_id: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type: string
          metadata?: Json | null
          response_time_ms?: number | null
          session_id: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          response_time_ms?: number | null
          session_id?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          language_code: string
          last_activity: string
          metadata: Json | null
          session_id: string
          updated_at: string
          user_id: string
          user_role: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          language_code?: string
          last_activity?: string
          metadata?: Json | null
          session_id: string
          updated_at?: string
          user_id: string
          user_role: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          language_code?: string
          last_activity?: string
          metadata?: Json | null
          session_id?: string
          updated_at?: string
          user_id?: string
          user_role?: string
        }
        Relationships: []
      }
      digital_tourist_ids: {
        Row: {
          aadhaar_number: string
          blockchain_hash: string
          created_at: string
          emergency_contacts: Json
          id: string
          issued_at: string
          passport_number: string | null
          status: string
          tourist_name: string
          trip_itinerary: string
          updated_at: string
          valid_from: string
          valid_to: string
        }
        Insert: {
          aadhaar_number: string
          blockchain_hash: string
          created_at?: string
          emergency_contacts: Json
          id?: string
          issued_at?: string
          passport_number?: string | null
          status?: string
          tourist_name: string
          trip_itinerary: string
          updated_at?: string
          valid_from: string
          valid_to: string
        }
        Update: {
          aadhaar_number?: string
          blockchain_hash?: string
          created_at?: string
          emergency_contacts?: Json
          id?: string
          issued_at?: string
          passport_number?: string | null
          status?: string
          tourist_name?: string
          trip_itinerary?: string
          updated_at?: string
          valid_from?: string
          valid_to?: string
        }
        Relationships: []
      }
      geo_fences: {
        Row: {
          coordinates: Json
          created_at: string
          description: string | null
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          coordinates: Json
          created_at?: string
          description?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          coordinates?: Json
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          assigned_geo_fence_ids: string[] | null
          created_at: string
          full_name: string | null
          id: string
          organization: string | null
          phone_number: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_geo_fence_ids?: string[] | null
          created_at?: string
          full_name?: string | null
          id?: string
          organization?: string | null
          phone_number?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_geo_fence_ids?: string[] | null
          created_at?: string
          full_name?: string | null
          id?: string
          organization?: string | null
          phone_number?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sos_alerts: {
        Row: {
          address: string | null
          alert_type: string
          blockchain_hash: string
          created_at: string
          id: string
          latitude: number
          longitude: number
          message: string | null
          status: string
          timestamp: string
          tourist_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          alert_type: string
          blockchain_hash: string
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          message?: string | null
          status?: string
          timestamp?: string
          tourist_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          alert_type?: string
          blockchain_hash?: string
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          message?: string | null
          status?: string
          timestamp?: string
          tourist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sos_alerts_tourist_id_fkey"
            columns: ["tourist_id"]
            isOneToOne: false
            referencedRelation: "digital_tourist_ids"
            referencedColumns: ["id"]
          },
        ]
      }
      tourist_locations: {
        Row: {
          created_at: string
          id: string
          latitude: number
          longitude: number
          timestamp: string
          tourist_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          timestamp?: string
          tourist_id: string
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          timestamp?: string
          tourist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tourist_locations_tourist_id_fkey"
            columns: ["tourist_id"]
            isOneToOne: false
            referencedRelation: "digital_tourist_ids"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_chat_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_blockchain_hash: {
        Args: { data: Json }
        Returns: string
      }
      get_or_create_chat_session: {
        Args: {
          p_language_code?: string
          p_metadata?: Json
          p_user_id: string
          p_user_role: string
        }
        Returns: {
          is_new: boolean
          session_id: string
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      has_role: {
        Args: { required_role: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
