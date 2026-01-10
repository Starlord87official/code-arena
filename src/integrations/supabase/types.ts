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
      ai_settings: {
        Row: {
          ai_enabled: boolean
          daily_limit_per_user: number
          id: string
          updated_at: string
        }
        Insert: {
          ai_enabled?: boolean
          daily_limit_per_user?: number
          id?: string
          updated_at?: string
        }
        Update: {
          ai_enabled?: boolean
          daily_limit_per_user?: number
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          insight_type: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          insight_type: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          insight_type?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
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
      doubts: {
        Row: {
          category: Database["public"]["Enums"]["doubt_category"]
          code_block: string | null
          content: string
          created_at: string
          difficulty: Database["public"]["Enums"]["doubt_difficulty"]
          id: string
          is_solved: boolean
          solved_at: string | null
          title: string
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["doubt_category"]
          code_block?: string | null
          content: string
          created_at?: string
          difficulty: Database["public"]["Enums"]["doubt_difficulty"]
          id?: string
          is_solved?: boolean
          solved_at?: string | null
          title: string
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["doubt_category"]
          code_block?: string | null
          content?: string
          created_at?: string
          difficulty?: Database["public"]["Enums"]["doubt_difficulty"]
          id?: string
          is_solved?: boolean
          solved_at?: string | null
          title?: string
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doubts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "roadmap_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: Database["public"]["Enums"]["friend_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: Database["public"]["Enums"]["friend_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["friend_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_requests_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_codes: {
        Row: {
          code: string
          code_hash: string | null
          created_at: string
          id: string
          is_active: boolean
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          code_hash?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          code_hash?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          used_at?: string | null
          used_by?: string | null
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
      planner_events: {
        Row: {
          category: string
          created_at: string
          description: string | null
          end_date: string | null
          event_date: string
          id: string
          is_system_event: boolean
          reference_id: string | null
          system_event_type: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_date: string
          id?: string
          is_system_event?: boolean
          reference_id?: string | null
          system_event_type?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_date?: string
          id?: string
          is_system_event?: boolean
          reference_id?: string | null
          system_event_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
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
      revision_queue: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          problem_id: string
          problem_title: string
          scheduled_date: string
          status: string
          topic: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          problem_id: string
          problem_title: string
          scheduled_date: string
          status?: string
          topic?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          problem_id?: string
          problem_title?: string
          scheduled_date?: string
          status?: string
          topic?: string | null
          updated_at?: string
          user_id?: string
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
      user_activity: {
        Row: {
          activity_date: string
          created_at: string
          id: string
          problems_solved: number
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_date?: string
          created_at?: string
          id?: string
          problems_solved?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_date?: string
          created_at?: string
          id?: string
          problems_solved?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
          {
            foreignKeyName: "fk_user_roles_profile"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_targets: {
        Row: {
          created_at: string
          daily_target: number | null
          id: string
          monthly_target: number | null
          updated_at: string
          user_id: string
          weekly_target: number | null
        }
        Insert: {
          created_at?: string
          daily_target?: number | null
          id?: string
          monthly_target?: number | null
          updated_at?: string
          user_id: string
          weekly_target?: number | null
        }
        Update: {
          created_at?: string
          daily_target?: number | null
          id?: string
          monthly_target?: number | null
          updated_at?: string
          user_id?: string
          weekly_target?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_targets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_targets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          division: string | null
          id: string | null
          joined_at: string | null
          streak: number | null
          username: string | null
          xp: number | null
        }
        Insert: {
          avatar_url?: string | null
          division?: string | null
          id?: string | null
          joined_at?: string | null
          streak?: number | null
          username?: string | null
          xp?: number | null
        }
        Update: {
          avatar_url?: string | null
          division?: string | null
          id?: string | null
          joined_at?: string | null
          streak?: number | null
          username?: string | null
          xp?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_mentor_invite: { Args: { invite_token: string }; Returns: Json }
      add_to_revision_queue: {
        Args: {
          p_days_until_revision?: number
          p_problem_id: string
          p_problem_title: string
          p_topic?: string
        }
        Returns: Json
      }
      claim_invite_code: {
        Args: { p_code: string; p_user_id: string }
        Returns: Json
      }
      complete_revision: { Args: { p_topic_id: string }; Returns: Json }
      complete_revision_item: { Args: { p_id: string }; Returns: Json }
      create_doubt: {
        Args: {
          p_category: Database["public"]["Enums"]["doubt_category"]
          p_code_block?: string
          p_content: string
          p_difficulty: Database["public"]["Enums"]["doubt_difficulty"]
          p_title: string
          p_topic_id: string
        }
        Returns: Json
      }
      get_activity_summary: { Args: never; Returns: Json }
      get_ai_usage_today: { Args: never; Returns: Json }
      get_eligible_doubt_topics: { Args: never; Returns: Json }
      get_friend_requests: { Args: never; Returns: Json }
      get_friends: { Args: never; Returns: Json }
      get_friendship_status: {
        Args: { p_other_user_id: string }
        Returns: Json
      }
      get_invite_info: { Args: { invite_token: string }; Returns: Json }
      get_or_create_user_targets: {
        Args: never
        Returns: {
          created_at: string
          daily_target: number | null
          id: string
          monthly_target: number | null
          updated_at: string
          user_id: string
          weekly_target: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "user_targets"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_public_profile: { Args: { p_username: string }; Returns: Json }
      get_public_profile_fields: {
        Args: { profile_row: Database["public"]["Tables"]["profiles"]["Row"] }
        Returns: Json
      }
      get_revision_queue: { Args: never; Returns: Json }
      get_visible_doubts: {
        Args: {
          p_category?: Database["public"]["Enums"]["doubt_category"]
          p_difficulty?: Database["public"]["Enums"]["doubt_difficulty"]
          p_search?: string
          p_show_solved?: boolean
          p_topic_id?: string
        }
        Returns: Json
      }
      has_clan_role: {
        Args: {
          _clan_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hash_invite_code: { Args: { p_code: string }; Returns: string }
      is_clan_admin: {
        Args: { _clan_id: string; _user_id: string }
        Returns: boolean
      }
      is_clan_member: {
        Args: { _clan_id: string; _user_id: string }
        Returns: boolean
      }
      is_reading_public_fields: { Args: never; Returns: boolean }
      join_clan: { Args: { p_clan_id: string }; Returns: Json }
      mark_doubt_solved: { Args: { p_doubt_id: string }; Returns: Json }
      record_activity: { Args: { p_problems_solved?: number }; Returns: Json }
      record_ai_usage: {
        Args: {
          p_context?: Json
          p_insight_type: string
          p_tokens_used?: number
        }
        Returns: Json
      }
      respond_friend_request: {
        Args: { p_accept: boolean; p_request_id: string }
        Returns: Json
      }
      send_friend_request: { Args: { p_receiver_id: string }; Returns: Json }
      start_roadmap: { Args: { p_roadmap_id: string }; Returns: Json }
      update_clan_member_stats: {
        Args: { p_streak?: number; p_user_id: string; p_xp_delta?: number }
        Returns: Json
      }
      update_topic_state: {
        Args: {
          p_state: Database["public"]["Enums"]["topic_state"]
          p_topic_id: string
        }
        Returns: Json
      }
      update_user_targets: {
        Args: { p_daily?: number; p_monthly?: number; p_weekly?: number }
        Returns: Json
      }
      validate_invite_code: { Args: { p_code: string }; Returns: Json }
    }
    Enums: {
      app_role: "mentor" | "student"
      doubt_category: "study" | "job" | "internship" | "referral"
      doubt_difficulty: "beginner" | "intermediate" | "advanced"
      friend_status: "pending" | "accepted" | "rejected"
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
      doubt_category: ["study", "job", "internship", "referral"],
      doubt_difficulty: ["beginner", "intermediate", "advanced"],
      friend_status: ["pending", "accepted", "rejected"],
      invite_status: ["pending", "accepted", "expired"],
      mentor_expertise: ["dsa", "cp", "web", "system_design"],
      topic_state: ["not_started", "in_progress", "completed"],
    },
  },
} as const
