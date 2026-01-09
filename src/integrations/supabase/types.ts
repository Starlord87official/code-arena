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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      battle_history: {
        Row: {
          battle_id: string
          clan_a_id: string
          clan_a_name: string
          clan_a_score: number
          clan_b_id: string
          clan_b_name: string
          clan_b_score: number
          created_at: string
          elo_change: number
          ended_at: string
          id: string
          mvp_username: string | null
          mvp_xp: number | null
          problems_solved_a: number
          problems_solved_b: number
          started_at: string
          total_problems: number
          winner: string | null
          xp_change: number
        }
        Insert: {
          battle_id: string
          clan_a_id: string
          clan_a_name: string
          clan_a_score?: number
          clan_b_id: string
          clan_b_name: string
          clan_b_score?: number
          created_at?: string
          elo_change?: number
          ended_at?: string
          id?: string
          mvp_username?: string | null
          mvp_xp?: number | null
          problems_solved_a?: number
          problems_solved_b?: number
          started_at?: string
          total_problems?: number
          winner?: string | null
          xp_change?: number
        }
        Update: {
          battle_id?: string
          clan_a_id?: string
          clan_a_name?: string
          clan_a_score?: number
          clan_b_id?: string
          clan_b_name?: string
          clan_b_score?: number
          created_at?: string
          elo_change?: number
          ended_at?: string
          id?: string
          mvp_username?: string | null
          mvp_xp?: number | null
          problems_solved_a?: number
          problems_solved_b?: number
          started_at?: string
          total_problems?: number
          winner?: string | null
          xp_change?: number
        }
        Relationships: []
      }
      clan_announcements: {
        Row: {
          clan_id: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean
          mentor_id: string
          title: string
          updated_at: string
        }
        Insert: {
          clan_id: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          mentor_id: string
          title: string
          updated_at?: string
        }
        Update: {
          clan_id?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          mentor_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      clan_members: {
        Row: {
          avatar: string | null
          clan_id: string
          id: string
          joined_at: string
          last_active: string
          streak: number
          user_id: string | null
          username: string
          xp: number
        }
        Insert: {
          avatar?: string | null
          clan_id: string
          id?: string
          joined_at?: string
          last_active?: string
          streak?: number
          user_id?: string | null
          username: string
          xp?: number
        }
        Update: {
          avatar?: string | null
          clan_id?: string
          id?: string
          joined_at?: string
          last_active?: string
          streak?: number
          user_id?: string | null
          username?: string
          xp?: number
        }
        Relationships: []
      }
      mentor_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          clan_id: string | null
          created_at: string
          email: string
          expertise: Database["public"]["Enums"]["mentor_expertise"] | null
          id: string
          invited_by: string
          name: string | null
          status: Database["public"]["Enums"]["invite_status"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          clan_id?: string | null
          created_at?: string
          email: string
          expertise?: Database["public"]["Enums"]["mentor_expertise"] | null
          id?: string
          invited_by: string
          name?: string | null
          status?: Database["public"]["Enums"]["invite_status"]
          token: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          clan_id?: string | null
          created_at?: string
          email?: string
          expertise?: Database["public"]["Enums"]["mentor_expertise"] | null
          id?: string
          invited_by?: string
          name?: string | null
          status?: Database["public"]["Enums"]["invite_status"]
          token?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          college_name: string | null
          college_year: string | null
          created_at: string
          division: string | null
          email: string | null
          id: string
          left_clan_at: string | null
          occupation_type: string | null
          onboarding_completed: boolean
          primary_roadmap: string | null
          streak: number | null
          updated_at: string
          username: string | null
          xp: number | null
          years_of_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          college_name?: string | null
          college_year?: string | null
          created_at?: string
          division?: string | null
          email?: string | null
          id: string
          left_clan_at?: string | null
          occupation_type?: string | null
          onboarding_completed?: boolean
          primary_roadmap?: string | null
          streak?: number | null
          updated_at?: string
          username?: string | null
          xp?: number | null
          years_of_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          college_name?: string | null
          college_year?: string | null
          created_at?: string
          division?: string | null
          email?: string | null
          id?: string
          left_clan_at?: string | null
          occupation_type?: string | null
          onboarding_completed?: boolean
          primary_roadmap?: string | null
          streak?: number | null
          updated_at?: string
          username?: string | null
          xp?: number | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      roadmap_topics: {
        Row: {
          created_at: string
          id: string
          roadmap_id: string
          topic_name: string
          topic_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          roadmap_id: string
          topic_name: string
          topic_order: number
        }
        Update: {
          created_at?: string
          id?: string
          roadmap_id?: string
          topic_name?: string
          topic_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_topics_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmaps: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_active_roadmaps: {
        Row: {
          id: string
          roadmap_id: string
          started_at: string
          user_id: string
        }
        Insert: {
          id?: string
          roadmap_id: string
          started_at?: string
          user_id: string
        }
        Update: {
          id?: string
          roadmap_id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_active_roadmaps_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roadmap_progress: {
        Row: {
          completed_at: string | null
          id: string
          roadmap_id: string
          started_at: string | null
          state: Database["public"]["Enums"]["topic_state"]
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          roadmap_id: string
          started_at?: string | null
          state?: Database["public"]["Enums"]["topic_state"]
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          roadmap_id?: string
          started_at?: string | null
          state?: Database["public"]["Enums"]["topic_state"]
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roadmap_progress_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roadmap_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "roadmap_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          clan_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          clan_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          clan_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_profile"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_mentor_invite: { Args: { invite_token: string }; Returns: Json }
      has_clan_role: {
        Args: {
          _clan_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      start_roadmap: { Args: { p_roadmap_id: string }; Returns: Json }
      update_topic_state: {
        Args: {
          p_state: Database["public"]["Enums"]["topic_state"]
          p_topic_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "mentor" | "student"
      invite_status: "pending" | "accepted" | "expired"
      mentor_expertise: "dsa" | "cp" | "web" | "system_design"
      topic_state: "not_started" | "in_progress" | "completed"
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
      app_role: ["mentor", "student"],
      invite_status: ["pending", "accepted", "expired"],
      mentor_expertise: ["dsa", "cp", "web", "system_design"],
      topic_state: ["not_started", "in_progress", "completed"],
    },
  },
} as const
