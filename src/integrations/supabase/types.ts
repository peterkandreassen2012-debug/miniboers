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
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          sector: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          sector: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          sector?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      investments: {
        Row: {
          created_at: string
          id: string
          investor_id: string
          price_per_share: number
          shares: number
          stock_id: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          investor_id: string
          price_per_share: number
          shares: number
          stock_id: string
          total_amount: number
        }
        Update: {
          created_at?: string
          id?: string
          investor_id?: string
          price_per_share?: number
          shares?: number
          stock_id?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "investments_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "stocks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock_requests: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          reviewed_at: string | null
          reviewed_by: string | null
          sector: string
          status: Database["public"]["Enums"]["request_status"]
          symbol: string
          total_shares: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          sector: string
          status?: Database["public"]["Enums"]["request_status"]
          symbol: string
          total_shares: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          sector?: string
          status?: Database["public"]["Enums"]["request_status"]
          symbol?: string
          total_shares?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      stocks: {
        Row: {
          available_shares: number
          company_id: string
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          price: number
          sector: string
          symbol: string
          total_shares: number
          updated_at: string
        }
        Insert: {
          available_shares: number
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          price: number
          sector: string
          symbol: string
          total_shares: number
          updated_at?: string
        }
        Update: {
          available_shares?: number
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          price?: number
          sector?: string
          symbol?: string
          total_shares?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stocks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "investor" | "company"
      request_status: "pending" | "approved" | "rejected"
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
    Enums: {
      app_role: ["admin", "investor", "company"],
      request_status: ["pending", "approved", "rejected"],
    },
  },
} as const
