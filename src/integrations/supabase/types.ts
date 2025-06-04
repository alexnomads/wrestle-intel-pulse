export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      championships: {
        Row: {
          created_at: string
          current_champion_id: string | null
          division: string | null
          id: string
          is_active: boolean | null
          promotion_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_champion_id?: string | null
          division?: string | null
          id?: string
          is_active?: boolean | null
          promotion_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_champion_id?: string | null
          division?: string | null
          id?: string
          is_active?: boolean | null
          promotion_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "championships_current_champion_id_fkey"
            columns: ["current_champion_id"]
            isOneToOne: false
            referencedRelation: "wrestlers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "championships_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          created_at: string
          id: string
          name: string
          roster_url: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          roster_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          roster_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      wrestlers: {
        Row: {
          brand: string | null
          championship_title: string | null
          created_at: string
          debut_date: string | null
          division: string | null
          finisher: string | null
          height: string | null
          hometown: string | null
          id: string
          image_url: string | null
          is_champion: boolean | null
          last_scraped_at: string | null
          name: string
          profile_url: string | null
          promotion_id: string | null
          real_name: string | null
          status: string
          updated_at: string
          weight: string | null
        }
        Insert: {
          brand?: string | null
          championship_title?: string | null
          created_at?: string
          debut_date?: string | null
          division?: string | null
          finisher?: string | null
          height?: string | null
          hometown?: string | null
          id?: string
          image_url?: string | null
          is_champion?: boolean | null
          last_scraped_at?: string | null
          name: string
          profile_url?: string | null
          promotion_id?: string | null
          real_name?: string | null
          status?: string
          updated_at?: string
          weight?: string | null
        }
        Update: {
          brand?: string | null
          championship_title?: string | null
          created_at?: string
          debut_date?: string | null
          division?: string | null
          finisher?: string | null
          height?: string | null
          hometown?: string | null
          id?: string
          image_url?: string | null
          is_champion?: boolean | null
          last_scraped_at?: string | null
          name?: string
          profile_url?: string | null
          promotion_id?: string | null
          real_name?: string | null
          status?: string
          updated_at?: string
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wrestlers_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      wrestling_events: {
        Row: {
          created_at: string
          day_of_week: number | null
          event_date: string | null
          event_time: string | null
          event_type: string | null
          id: string
          is_recurring: boolean | null
          location: string | null
          name: string
          network: string | null
          promotion_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          event_date?: string | null
          event_time?: string | null
          event_type?: string | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          name: string
          network?: string | null
          promotion_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          event_date?: string | null
          event_time?: string | null
          event_type?: string | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          name?: string
          network?: string | null
          promotion_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wrestling_events_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
