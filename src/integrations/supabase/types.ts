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
      autonomous_wrestling_events: {
        Row: {
          city: string
          created_at: string
          date: string
          event_name: string
          event_type: string
          id: string
          last_updated: string
          match_card: string[] | null
          network: string
          promotion: string
          time_cet: string
          time_et: string
          time_pt: string
          venue: string
        }
        Insert: {
          city: string
          created_at?: string
          date: string
          event_name: string
          event_type: string
          id?: string
          last_updated?: string
          match_card?: string[] | null
          network: string
          promotion: string
          time_cet: string
          time_et: string
          time_pt: string
          venue: string
        }
        Update: {
          city?: string
          created_at?: string
          date?: string
          event_name?: string
          event_type?: string
          id?: string
          last_updated?: string
          match_card?: string[] | null
          network?: string
          promotion?: string
          time_cet?: string
          time_et?: string
          time_pt?: string
          venue?: string
        }
        Relationships: []
      }
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
      contract_status: {
        Row: {
          contract_end: string | null
          contract_start: string | null
          contract_type: string | null
          created_at: string
          id: string
          notes: string | null
          salary_tier: string | null
          status: string
          updated_at: string
          wrestler_id: string | null
        }
        Insert: {
          contract_end?: string | null
          contract_start?: string | null
          contract_type?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          salary_tier?: string | null
          status?: string
          updated_at?: string
          wrestler_id?: string | null
        }
        Update: {
          contract_end?: string | null
          contract_start?: string | null
          contract_type?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          salary_tier?: string | null
          status?: string
          updated_at?: string
          wrestler_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_status_wrestler_id_fkey"
            columns: ["wrestler_id"]
            isOneToOne: false
            referencedRelation: "wrestlers"
            referencedColumns: ["id"]
          },
        ]
      }
      elo_rankings: {
        Row: {
          created_at: string
          elo_rating: number
          id: string
          last_match_date: string | null
          promotion: string | null
          ranking_position: number | null
          trend: string | null
          updated_at: string
          wrestler_name: string
        }
        Insert: {
          created_at?: string
          elo_rating: number
          id?: string
          last_match_date?: string | null
          promotion?: string | null
          ranking_position?: number | null
          trend?: string | null
          updated_at?: string
          wrestler_name: string
        }
        Update: {
          created_at?: string
          elo_rating?: number
          id?: string
          last_match_date?: string | null
          promotion?: string | null
          ranking_position?: number | null
          trend?: string | null
          updated_at?: string
          wrestler_name?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          author: string | null
          content: string | null
          created_at: string
          id: string
          keywords: string[] | null
          promotion_mentions: string[] | null
          published_at: string | null
          sentiment_score: number | null
          source: string
          title: string
          updated_at: string
          url: string
          wrestler_mentions: string[] | null
        }
        Insert: {
          author?: string | null
          content?: string | null
          created_at?: string
          id?: string
          keywords?: string[] | null
          promotion_mentions?: string[] | null
          published_at?: string | null
          sentiment_score?: number | null
          source: string
          title: string
          updated_at?: string
          url: string
          wrestler_mentions?: string[] | null
        }
        Update: {
          author?: string | null
          content?: string | null
          created_at?: string
          id?: string
          keywords?: string[] | null
          promotion_mentions?: string[] | null
          published_at?: string | null
          sentiment_score?: number | null
          source?: string
          title?: string
          updated_at?: string
          url?: string
          wrestler_mentions?: string[] | null
        }
        Relationships: []
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
      storylines: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          fan_reception_score: number | null
          id: string
          intensity_score: number | null
          participants: string[]
          promotion_id: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          fan_reception_score?: number | null
          id?: string
          intensity_score?: number | null
          participants: string[]
          promotion_id?: string | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          fan_reception_score?: number | null
          id?: string
          intensity_score?: number | null
          participants?: string[]
          promotion_id?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "storylines_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_sales: {
        Row: {
          attendance_percentage: number | null
          capacity: number | null
          created_at: string
          event_date: string
          event_name: string
          id: string
          promotion: string | null
          tickets_sold: number | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          attendance_percentage?: number | null
          capacity?: number | null
          created_at?: string
          event_date: string
          event_name: string
          id?: string
          promotion?: string | null
          tickets_sold?: number | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          attendance_percentage?: number | null
          capacity?: number | null
          created_at?: string
          event_date?: string
          event_name?: string
          id?: string
          promotion?: string | null
          tickets_sold?: number | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      tv_ratings: {
        Row: {
          air_date: string
          created_at: string
          demographic_rating: number | null
          id: string
          network: string | null
          rating: number | null
          show: string
          updated_at: string
          viewership: number | null
        }
        Insert: {
          air_date: string
          created_at?: string
          demographic_rating?: number | null
          id?: string
          network?: string | null
          rating?: number | null
          show: string
          updated_at?: string
          viewership?: number | null
        }
        Update: {
          air_date?: string
          created_at?: string
          demographic_rating?: number | null
          id?: string
          network?: string | null
          rating?: number | null
          show?: string
          updated_at?: string
          viewership?: number | null
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
          card_announced: boolean | null
          created_at: string
          day_of_week: number | null
          event_date: string | null
          event_time: string | null
          event_type: string | null
          id: string
          is_recurring: boolean | null
          location: string | null
          main_event: string | null
          name: string
          network: string | null
          poster_image_url: string | null
          promotion_id: string | null
          sold_out: boolean | null
          ticket_url: string | null
          updated_at: string
          venue_capacity: number | null
        }
        Insert: {
          card_announced?: boolean | null
          created_at?: string
          day_of_week?: number | null
          event_date?: string | null
          event_time?: string | null
          event_type?: string | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          main_event?: string | null
          name: string
          network?: string | null
          poster_image_url?: string | null
          promotion_id?: string | null
          sold_out?: boolean | null
          ticket_url?: string | null
          updated_at?: string
          venue_capacity?: number | null
        }
        Update: {
          card_announced?: boolean | null
          created_at?: string
          day_of_week?: number | null
          event_date?: string | null
          event_time?: string | null
          event_type?: string | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          main_event?: string | null
          name?: string
          network?: string | null
          poster_image_url?: string | null
          promotion_id?: string | null
          sold_out?: boolean | null
          ticket_url?: string | null
          updated_at?: string
          venue_capacity?: number | null
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
      wrestling_matches: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          match_order: number | null
          match_type: string
          participants: string[]
          title: string | null
          updated_at: string
          winner: string | null
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          match_order?: number | null
          match_type: string
          participants: string[]
          title?: string | null
          updated_at?: string
          winner?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          match_order?: number | null
          match_type?: string
          participants?: string[]
          title?: string | null
          updated_at?: string
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wrestling_matches_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "wrestling_events"
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
