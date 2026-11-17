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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          cep: string | null
          city: string | null
          client_type: Database["public"]["Enums"]["client_type"]
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          owner_id: string
          phone: string | null
          state: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          cep?: string | null
          city?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          owner_id?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          cep?: string | null
          city?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner_id?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          address: string | null
          bank_info: string | null
          cnpj: string | null
          default_validity_days: number
          email: string | null
          general_conditions: string | null
          id: number
          legal_name: string | null
          logo_url: string | null
          payment_terms: string | null
          phone: string | null
          proposal_text: string | null
          trade_name: string | null
          updated_at: string
          warranties: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          bank_info?: string | null
          cnpj?: string | null
          default_validity_days?: number
          email?: string | null
          general_conditions?: string | null
          id?: number
          legal_name?: string | null
          logo_url?: string | null
          payment_terms?: string | null
          phone?: string | null
          proposal_text?: string | null
          trade_name?: string | null
          updated_at?: string
          warranties?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          bank_info?: string | null
          cnpj?: string | null
          default_validity_days?: number
          email?: string | null
          general_conditions?: string | null
          id?: number
          legal_name?: string | null
          logo_url?: string | null
          payment_terms?: string | null
          phone?: string | null
          proposal_text?: string | null
          trade_name?: string | null
          updated_at?: string
          warranties?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          default_margin: number
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          default_margin?: number
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          default_margin?: number
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          category_id: string | null
          code: string | null
          cost_price: number
          created_at: string
          description: string
          id: string
          image_url: string | null
          manufacturer: string | null
          model: string | null
          sale_price: number
          specs: Json
          supplier: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          code?: string | null
          cost_price?: number
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          model?: string | null
          sale_price?: number
          specs?: Json
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string | null
          code?: string | null
          cost_price?: number
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          model?: string | null
          sale_price?: number
          specs?: Json
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          phone?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      quote_items: {
        Row: {
          category_slug: string | null
          description: string
          id: string
          product_id: string | null
          quantity: number
          quote_id: string
          sort_order: number
          unit: string
          unit_cost: number
          unit_price: number
        }
        Insert: {
          category_slug?: string | null
          description: string
          id?: string
          product_id?: string | null
          quantity?: number
          quote_id: string
          sort_order?: number
          unit?: string
          unit_cost?: number
          unit_price?: number
        }
        Update: {
          category_slug?: string | null
          description?: string
          id?: string
          product_id?: string | null
          quantity?: number
          quote_id?: string
          sort_order?: number
          unit?: string
          unit_cost?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_revisions: {
        Row: {
          created_at: string
          created_by: string
          id: string
          quote_id: string
          revision: number
          snapshot: Json
        }
        Insert: {
          created_at?: string
          created_by?: string
          id?: string
          quote_id: string
          revision: number
          snapshot: Json
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          quote_id?: string
          revision?: number
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "quote_revisions_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          note: string | null
          quote_id: string
          status: Database["public"]["Enums"]["quote_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          quote_id: string
          status: Database["public"]["Enums"]["quote_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          quote_id?: string
          status?: Database["public"]["Enums"]["quote_status"]
        }
        Relationships: [
          {
            foreignKeyName: "quote_status_history_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_id: string | null
          created_at: string
          discount: number
          execution_days: number | null
          extra_cost: number
          freight_cost: number
          id: string
          labor_cost: number
          lost_reason: string | null
          margin_pct: number
          modality: Database["public"]["Enums"]["quote_modality"]
          next_contact: string | null
          notes: string | null
          number: string
          payment_terms: string | null
          revision: number
          seller_id: string
          sizing_input: Json
          sizing_result: Json
          sold_at: string | null
          status: Database["public"]["Enums"]["quote_status"]
          tax_pct: number
          title: string | null
          total_cost: number
          total_value: number
          travel_cost: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          discount?: number
          execution_days?: number | null
          extra_cost?: number
          freight_cost?: number
          id?: string
          labor_cost?: number
          lost_reason?: string | null
          margin_pct?: number
          modality: Database["public"]["Enums"]["quote_modality"]
          next_contact?: string | null
          notes?: string | null
          number?: string
          payment_terms?: string | null
          revision?: number
          seller_id?: string
          sizing_input?: Json
          sizing_result?: Json
          sold_at?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          tax_pct?: number
          title?: string | null
          total_cost?: number
          total_value?: number
          travel_cost?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          discount?: number
          execution_days?: number | null
          extra_cost?: number
          freight_cost?: number
          id?: string
          labor_cost?: number
          lost_reason?: string | null
          margin_pct?: number
          modality?: Database["public"]["Enums"]["quote_modality"]
          next_contact?: string | null
          notes?: string | null
          number?: string
          payment_terms?: string | null
          revision?: number
          seller_id?: string
          sizing_input?: Json
          sizing_result?: Json
          sold_at?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          tax_pct?: number
          title?: string | null
          total_cost?: number
          total_value?: number
          travel_cost?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sizing_parameters: {
        Row: {
          modality: Database["public"]["Enums"]["quote_modality"]
          params: Json
          updated_at: string
        }
        Insert: {
          modality: Database["public"]["Enums"]["quote_modality"]
          params?: Json
          updated_at?: string
        }
        Update: {
          modality?: Database["public"]["Enums"]["quote_modality"]
          params?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role: "admin" | "vendedor"
      client_type: "residencial" | "comercial" | "industrial" | "rural"
      quote_modality: "fotovoltaico" | "boiler" | "piscina" | "manual"
      quote_status:
        | "rascunho"
        | "enviado"
        | "negociacao"
        | "aprovado"
        | "perdido"
        | "expirado"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "vendedor"],
      client_type: ["residencial", "comercial", "industrial", "rural"],
      quote_modality: ["fotovoltaico", "boiler", "piscina", "manual"],
      quote_status: [
        "rascunho",
        "enviado",
        "negociacao",
        "aprovado",
        "perdido",
        "expirado",
      ],
    },
  },
} as const
