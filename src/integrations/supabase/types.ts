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
      anticheat_flags: {
        Row: {
          created_at: string
          evidence: Json
          id: string
          kind: Database["public"]["Enums"]["anticheat_kind"]
          match_id: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          severity: number
          status: Database["public"]["Enums"]["anticheat_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          evidence?: Json
          id?: string
          kind: Database["public"]["Enums"]["anticheat_kind"]
          match_id?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          severity?: number
          status?: Database["public"]["Enums"]["anticheat_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          evidence?: Json
          id?: string
          kind?: Database["public"]["Enums"]["anticheat_kind"]
          match_id?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          severity?: number
          status?: Database["public"]["Enums"]["anticheat_status"]
          user_id?: string
        }
        Relationships: []
      }
      battle_configs: {
        Row: {
          ban_count: number
          created_at: string
          difficulty_curve: Json
          duration_minutes: number
          id: string
          is_active: boolean
          is_rated: boolean
          key: string
          mode: string
          pick_count: number
          problem_count: number
          submission_limit: number
          tiebreak_rules: Json
        }
        Insert: {
          ban_count?: number
          created_at?: string
          difficulty_curve?: Json
          duration_minutes?: number
          id?: string
          is_active?: boolean
          is_rated?: boolean
          key: string
          mode: string
          pick_count?: number
          problem_count?: number
          submission_limit?: number
          tiebreak_rules?: Json
        }
        Update: {
          ban_count?: number
          created_at?: string
          difficulty_curve?: Json
          duration_minutes?: number
          id?: string
          is_active?: boolean
          is_rated?: boolean
          key?: string
          mode?: string
          pick_count?: number
          problem_count?: number
          submission_limit?: number
          tiebreak_rules?: Json
        }
        Relationships: []
      }
      battle_event_log: {
        Row: {
          created_at: string
          event_type: string
          id: string
          match_id: string
          payload: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          match_id: string
          payload?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          match_id?: string
          payload?: Json
          user_id?: string | null
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
      battle_invites: {
        Row: {
          created_at: string
          difficulty_mix: string[]
          duration_minutes: number
          expires_at: string
          hints_enabled: boolean
          id: string
          is_rated: boolean
          match_id: string | null
          problem_count: number
          receiver_id: string
          responded_at: string | null
          sender_id: string
          status: string
        }
        Insert: {
          created_at?: string
          difficulty_mix?: string[]
          duration_minutes?: number
          expires_at?: string
          hints_enabled?: boolean
          id?: string
          is_rated?: boolean
          match_id?: string | null
          problem_count?: number
          receiver_id: string
          responded_at?: string | null
          sender_id: string
          status?: string
        }
        Update: {
          created_at?: string
          difficulty_mix?: string[]
          duration_minutes?: number
          expires_at?: string
          hints_enabled?: boolean
          id?: string
          is_rated?: boolean
          match_id?: string | null
          problem_count?: number
          receiver_id?: string
          responded_at?: string | null
          sender_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_invites_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "battle_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_match_problems: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          match_id: string
          order_index: number
          points: number
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          match_id: string
          order_index?: number
          points?: number
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          match_id?: string
          order_index?: number
          points?: number
        }
        Relationships: [
          {
            foreignKeyName: "battle_match_problems_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_match_problems_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "battle_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_match_submissions: {
        Row: {
          code: string
          code_hash: string | null
          compile_log: string | null
          id: string
          idempotency_key: string | null
          judged_at: string | null
          language: string
          match_id: string
          memory_kb: number | null
          problem_id: string
          runtime_ms: number | null
          score: number
          status: string
          submitted_at: string
          testcases_passed: number | null
          testcases_total: number | null
          user_id: string
          verdict: Database["public"]["Enums"]["submission_verdict"]
          verdict_payload: Json | null
        }
        Insert: {
          code?: string
          code_hash?: string | null
          compile_log?: string | null
          id?: string
          idempotency_key?: string | null
          judged_at?: string | null
          language?: string
          match_id: string
          memory_kb?: number | null
          problem_id: string
          runtime_ms?: number | null
          score?: number
          status?: string
          submitted_at?: string
          testcases_passed?: number | null
          testcases_total?: number | null
          user_id: string
          verdict?: Database["public"]["Enums"]["submission_verdict"]
          verdict_payload?: Json | null
        }
        Update: {
          code?: string
          code_hash?: string | null
          compile_log?: string | null
          id?: string
          idempotency_key?: string | null
          judged_at?: string | null
          language?: string
          match_id?: string
          memory_kb?: number | null
          problem_id?: string
          runtime_ms?: number | null
          score?: number
          status?: string
          submitted_at?: string
          testcases_passed?: number | null
          testcases_total?: number | null
          user_id?: string
          verdict?: Database["public"]["Enums"]["submission_verdict"]
          verdict_payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_match_submissions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "battle_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_match_submissions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "battle_match_problems"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_matches: {
        Row: {
          config_id: string | null
          created_at: string
          created_by: string
          duration_minutes: number
          ended_at: string | null
          hints_enabled: boolean
          id: string
          invalidated_reason: string | null
          invite_id: string | null
          is_draw: boolean | null
          is_rated: boolean
          judge_provider: string
          mode: string
          phase_started_at: string
          problem_count: number
          season_id: string | null
          started_at: string | null
          state: Database["public"]["Enums"]["match_state"]
          status: string
          winner_id: string | null
        }
        Insert: {
          config_id?: string | null
          created_at?: string
          created_by: string
          duration_minutes?: number
          ended_at?: string | null
          hints_enabled?: boolean
          id?: string
          invalidated_reason?: string | null
          invite_id?: string | null
          is_draw?: boolean | null
          is_rated?: boolean
          judge_provider?: string
          mode?: string
          phase_started_at?: string
          problem_count?: number
          season_id?: string | null
          started_at?: string | null
          state?: Database["public"]["Enums"]["match_state"]
          status?: string
          winner_id?: string | null
        }
        Update: {
          config_id?: string | null
          created_at?: string
          created_by?: string
          duration_minutes?: number
          ended_at?: string | null
          hints_enabled?: boolean
          id?: string
          invalidated_reason?: string | null
          invite_id?: string | null
          is_draw?: boolean | null
          is_rated?: boolean
          judge_provider?: string
          mode?: string
          phase_started_at?: string
          problem_count?: number
          season_id?: string | null
          started_at?: string | null
          state?: Database["public"]["Enums"]["match_state"]
          status?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_matches_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "battle_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_matches_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_participants: {
        Row: {
          created_at: string
          disconnected_at: string | null
          elo_after: number | null
          elo_before: number
          elo_change: number | null
          hints_used: number
          id: string
          is_forfeit: boolean
          match_id: string
          problems_solved: number
          reconnected_at: string | null
          score: number
          total_solve_time_sec: number
          user_id: string
          wrong_submissions: number
          xp_earned: number
        }
        Insert: {
          created_at?: string
          disconnected_at?: string | null
          elo_after?: number | null
          elo_before?: number
          elo_change?: number | null
          hints_used?: number
          id?: string
          is_forfeit?: boolean
          match_id: string
          problems_solved?: number
          reconnected_at?: string | null
          score?: number
          total_solve_time_sec?: number
          user_id: string
          wrong_submissions?: number
          xp_earned?: number
        }
        Update: {
          created_at?: string
          disconnected_at?: string | null
          elo_after?: number | null
          elo_before?: number
          elo_change?: number | null
          hints_used?: number
          id?: string
          is_forfeit?: boolean
          match_id?: string
          problems_solved?: number
          reconnected_at?: string | null
          score?: number
          total_solve_time_sec?: number
          user_id?: string
          wrong_submissions?: number
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "battle_participants_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "battle_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_queue: {
        Row: {
          created_at: string
          elo: number
          expires_at: string
          id: string
          matched_at: string | null
          mode: string
          status: string
          target_user_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          elo?: number
          expires_at?: string
          id?: string
          matched_at?: string | null
          mode: string
          status?: string
          target_user_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          elo?: number
          expires_at?: string
          id?: string
          matched_at?: string | null
          mode?: string
          status?: string
          target_user_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      battle_sessions: {
        Row: {
          battle_id: string
          created_at: string
          duration_minutes: number
          elo_change: number | null
          end_time: string | null
          id: string
          mode: string
          player_a_elo: number
          player_a_id: string
          player_a_score: number
          player_b_elo: number
          player_b_id: string
          player_b_score: number
          problems: Json
          start_time: string
          status: string
          winner_id: string | null
          xp_awarded_a: number | null
          xp_awarded_b: number | null
        }
        Insert: {
          battle_id?: string
          created_at?: string
          duration_minutes?: number
          elo_change?: number | null
          end_time?: string | null
          id?: string
          mode: string
          player_a_elo?: number
          player_a_id: string
          player_a_score?: number
          player_b_elo?: number
          player_b_id: string
          player_b_score?: number
          problems?: Json
          start_time?: string
          status?: string
          winner_id?: string | null
          xp_awarded_a?: number | null
          xp_awarded_b?: number | null
        }
        Update: {
          battle_id?: string
          created_at?: string
          duration_minutes?: number
          elo_change?: number | null
          end_time?: string | null
          id?: string
          mode?: string
          player_a_elo?: number
          player_a_id?: string
          player_a_score?: number
          player_b_elo?: number
          player_b_id?: string
          player_b_score?: number
          problems?: Json
          start_time?: string
          status?: string
          winner_id?: string | null
          xp_awarded_a?: number | null
          xp_awarded_b?: number | null
        }
        Relationships: []
      }
      challenge_completions: {
        Row: {
          challenge_id: string
          completed_at: string
          id: string
          language: string | null
          memory_kb: number | null
          runtime_ms: number | null
          user_id: string
          xp_earned: number
        }
        Insert: {
          challenge_id: string
          completed_at?: string
          id?: string
          language?: string | null
          memory_kb?: number | null
          runtime_ms?: number | null
          user_id: string
          xp_earned?: number
        }
        Update: {
          challenge_id?: string
          completed_at?: string
          id?: string
          language?: string | null
          memory_kb?: number | null
          runtime_ms?: number | null
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_packs: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          difficulty_range: string[] | null
          estimated_hours: number | null
          icon: string | null
          id: string
          is_featured: boolean | null
          is_new: boolean | null
          order_index: number | null
          slug: string
          title: string
          unlock_level: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty_range?: string[] | null
          estimated_hours?: number | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          is_new?: boolean | null
          order_index?: number | null
          slug: string
          title: string
          unlock_level?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty_range?: string[] | null
          estimated_hours?: number | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          is_new?: boolean | null
          order_index?: number | null
          slug?: string
          title?: string
          unlock_level?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          challenge_type: string
          company_tags: string[] | null
          constraints: string[]
          created_at: string
          description: string
          difficulty: string
          estimated_time_minutes: number | null
          examples: Json
          hints: string[] | null
          id: string
          is_active: boolean
          is_beta: boolean | null
          is_daily: boolean
          is_new: boolean | null
          pack_id: string | null
          pattern_type: string | null
          prerequisite_challenge_id: string | null
          problem_statement: string
          rank_impact_loss: number
          rank_impact_win: number
          slug: string
          tags: string[]
          time_limit: number
          title: string
          unlock_level: number | null
          updated_at: string
          xp_reward: number
        }
        Insert: {
          challenge_type?: string
          company_tags?: string[] | null
          constraints?: string[]
          created_at?: string
          description: string
          difficulty: string
          estimated_time_minutes?: number | null
          examples?: Json
          hints?: string[] | null
          id?: string
          is_active?: boolean
          is_beta?: boolean | null
          is_daily?: boolean
          is_new?: boolean | null
          pack_id?: string | null
          pattern_type?: string | null
          prerequisite_challenge_id?: string | null
          problem_statement: string
          rank_impact_loss?: number
          rank_impact_win?: number
          slug: string
          tags?: string[]
          time_limit?: number
          title: string
          unlock_level?: number | null
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          challenge_type?: string
          company_tags?: string[] | null
          constraints?: string[]
          created_at?: string
          description?: string
          difficulty?: string
          estimated_time_minutes?: number | null
          examples?: Json
          hints?: string[] | null
          id?: string
          is_active?: boolean
          is_beta?: boolean | null
          is_daily?: boolean
          is_new?: boolean | null
          pack_id?: string | null
          pattern_type?: string | null
          prerequisite_challenge_id?: string | null
          problem_statement?: string
          rank_impact_loss?: number
          rank_impact_win?: number
          slug?: string
          tags?: string[]
          time_limit?: number
          title?: string
          unlock_level?: number | null
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenges_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "challenge_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_prerequisite_challenge_id_fkey"
            columns: ["prerequisite_challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_activity_log: {
        Row: {
          clan_id: string
          created_at: string
          id: string
          message: string
          meta: Json | null
          type: string
        }
        Insert: {
          clan_id: string
          created_at?: string
          id?: string
          message: string
          meta?: Json | null
          type: string
        }
        Update: {
          clan_id?: string
          created_at?: string
          id?: string
          message?: string
          meta?: Json | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "clan_activity_log_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
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
      clan_applications: {
        Row: {
          clan_id: string
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          clan_id: string
          created_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          clan_id?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clan_applications_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_invites: {
        Row: {
          clan_id: string
          created_at: string
          id: string
          invited_by: string
          status: string
          user_id: string
        }
        Insert: {
          clan_id: string
          created_at?: string
          id?: string
          invited_by: string
          status?: string
          user_id: string
        }
        Update: {
          clan_id?: string
          created_at?: string
          id?: string
          invited_by?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clan_invites_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
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
      clan_members_v2: {
        Row: {
          clan_id: string
          daily_xp_date: string
          daily_xp_today: number
          id: string
          joined_at: string
          last_active_at: string
          role: string
          total_xp: number
          user_id: string
          weekly_xp: number
        }
        Insert: {
          clan_id: string
          daily_xp_date?: string
          daily_xp_today?: number
          id?: string
          joined_at?: string
          last_active_at?: string
          role?: string
          total_xp?: number
          user_id: string
          weekly_xp?: number
        }
        Update: {
          clan_id?: string
          daily_xp_date?: string
          daily_xp_today?: number
          id?: string
          joined_at?: string
          last_active_at?: string
          role?: string
          total_xp?: number
          user_id?: string
          weekly_xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "clan_members_v2_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_quests: {
        Row: {
          clan_id: string
          created_at: string
          id: string
          progress: number
          quest_type: string
          reward_xp: number
          target: number
          week_start: string
        }
        Insert: {
          clan_id: string
          created_at?: string
          id?: string
          progress?: number
          quest_type: string
          reward_xp?: number
          target?: number
          week_start: string
        }
        Update: {
          clan_id?: string
          created_at?: string
          id?: string
          progress?: number
          quest_type?: string
          reward_xp?: number
          target?: number
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "clan_quests_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_war_contributions: {
        Row: {
          clan_id: string
          clan_war_id: string
          created_at: string
          id: string
          points: number
          source: string
          user_id: string
        }
        Insert: {
          clan_id: string
          clan_war_id: string
          created_at?: string
          id?: string
          points?: number
          source: string
          user_id: string
        }
        Update: {
          clan_id?: string
          clan_war_id?: string
          created_at?: string
          id?: string
          points?: number
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clan_war_contributions_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clan_war_contributions_clan_war_id_fkey"
            columns: ["clan_war_id"]
            isOneToOne: false
            referencedRelation: "clan_wars"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_wars: {
        Row: {
          clan_a: string
          clan_b: string
          created_at: string
          id: string
          result: string
          score_a: number
          score_b: number
          week_start: string
        }
        Insert: {
          clan_a: string
          clan_b: string
          created_at?: string
          id?: string
          result?: string
          score_a?: number
          score_b?: number
          week_start: string
        }
        Update: {
          clan_a?: string
          clan_b?: string
          created_at?: string
          id?: string
          result?: string
          score_a?: number
          score_b?: number
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "clan_wars_clan_a_fkey"
            columns: ["clan_a"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clan_wars_clan_b_fkey"
            columns: ["clan_b"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clans: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          level: number
          max_members: number
          motto: string | null
          name: string
          privacy: string
          rank_tier: string
          tag: string
          timezone: string
          total_xp: number
          updated_at: string
          weekly_xp: number
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          level?: number
          max_members?: number
          motto?: string | null
          name: string
          privacy?: string
          rank_tier?: string
          tag: string
          timezone?: string
          total_xp?: number
          updated_at?: string
          weekly_xp?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          level?: number
          max_members?: number
          motto?: string | null
          name?: string
          privacy?: string
          rank_tier?: string
          tag?: string
          timezone?: string
          total_xp?: number
          updated_at?: string
          weekly_xp?: number
        }
        Relationships: []
      }
      contest_announcements: {
        Row: {
          content: string
          contest_id: string
          created_at: string
          id: string
          is_global: boolean
          title: string
        }
        Insert: {
          content: string
          contest_id: string
          created_at?: string
          id?: string
          is_global?: boolean
          title: string
        }
        Update: {
          content?: string
          contest_id?: string
          created_at?: string
          id?: string
          is_global?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_announcements_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_integrity: {
        Row: {
          contest_id: string
          copy_paste_count: number
          fullscreen_exits: number
          id: string
          tab_switches: number
          updated_at: string
          user_id: string
        }
        Insert: {
          contest_id: string
          copy_paste_count?: number
          fullscreen_exits?: number
          id?: string
          tab_switches?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          contest_id?: string
          copy_paste_count?: number
          fullscreen_exits?: number
          id?: string
          tab_switches?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_integrity_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_problems: {
        Row: {
          constraints_text: string[] | null
          contest_id: string
          created_at: string
          difficulty: string
          examples: Json
          id: string
          label: string
          memory_limit_kb: number
          order_index: number
          points: number
          problem_statement: string
          time_limit_ms: number
          title: string
        }
        Insert: {
          constraints_text?: string[] | null
          contest_id: string
          created_at?: string
          difficulty?: string
          examples?: Json
          id?: string
          label: string
          memory_limit_kb?: number
          order_index?: number
          points?: number
          problem_statement: string
          time_limit_ms?: number
          title: string
        }
        Update: {
          constraints_text?: string[] | null
          contest_id?: string
          created_at?: string
          difficulty?: string
          examples?: Json
          id?: string
          label?: string
          memory_limit_kb?: number
          order_index?: number
          points?: number
          problem_statement?: string
          time_limit_ms?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_problems_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_rating_changes: {
        Row: {
          contest_id: string
          created_at: string
          delta: number
          id: string
          new_rating: number
          old_rating: number
          rank: number
          user_id: string
        }
        Insert: {
          contest_id: string
          created_at?: string
          delta: number
          id?: string
          new_rating: number
          old_rating: number
          rank: number
          user_id: string
        }
        Update: {
          contest_id?: string
          created_at?: string
          delta?: number
          id?: string
          new_rating?: number
          old_rating?: number
          rank?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_rating_changes_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_registrations: {
        Row: {
          contest_id: string
          id: string
          language: string | null
          registered_at: string
          team_id: string | null
          user_id: string
        }
        Insert: {
          contest_id: string
          id?: string
          language?: string | null
          registered_at?: string
          team_id?: string | null
          user_id: string
        }
        Update: {
          contest_id?: string
          id?: string
          language?: string | null
          registered_at?: string
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_registrations_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_submissions: {
        Row: {
          code: string
          contest_id: string
          id: string
          language: string
          memory_kb: number | null
          penalty_time: number | null
          problem_id: string
          runtime_ms: number | null
          score: number | null
          status: string
          submitted_at: string
          team_id: string | null
          testcases_passed: number | null
          testcases_total: number | null
          user_id: string
        }
        Insert: {
          code: string
          contest_id: string
          id?: string
          language?: string
          memory_kb?: number | null
          penalty_time?: number | null
          problem_id: string
          runtime_ms?: number | null
          score?: number | null
          status?: string
          submitted_at?: string
          team_id?: string | null
          testcases_passed?: number | null
          testcases_total?: number | null
          user_id: string
        }
        Update: {
          code?: string
          contest_id?: string
          id?: string
          language?: string
          memory_kb?: number | null
          penalty_time?: number | null
          problem_id?: string
          runtime_ms?: number | null
          score?: number | null
          status?: string
          submitted_at?: string
          team_id?: string | null
          testcases_passed?: number | null
          testcases_total?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_submissions_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_submissions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "contest_problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_submissions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "contest_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_teams: {
        Row: {
          clan_id: string | null
          contest_id: string
          created_at: string
          created_by: string
          id: string
          team_name: string
        }
        Insert: {
          clan_id?: string | null
          contest_id: string
          created_at?: string
          created_by: string
          id?: string
          team_name: string
        }
        Update: {
          clan_id?: string | null
          contest_id?: string
          created_at?: string
          created_by?: string
          id?: string
          team_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_teams_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      contests: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string
          duration_minutes: number
          end_time: string
          format: string
          id: string
          is_championship_qualifier: boolean
          max_participants: number | null
          mode: string
          rating_impact: boolean
          rules_json: Json | null
          start_time: string
          status: string
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          end_time: string
          format?: string
          id?: string
          is_championship_qualifier?: boolean
          max_participants?: number | null
          mode?: string
          rating_impact?: boolean
          rules_json?: Json | null
          start_time: string
          status?: string
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          end_time?: string
          format?: string
          id?: string
          is_championship_qualifier?: boolean
          max_participants?: number | null
          mode?: string
          rating_impact?: boolean
          rules_json?: Json | null
          start_time?: string
          status?: string
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      daily_challenge_completions: {
        Row: {
          challenge_id: string
          completed_at: string
          completion_date: string
          id: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string
          completion_date?: string
          id?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string
          completion_date?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      doubt_comments: {
        Row: {
          content: string
          created_at: string
          doubt_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          doubt_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          doubt_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doubt_comments_doubt_id_fkey"
            columns: ["doubt_id"]
            isOneToOne: false
            referencedRelation: "doubts"
            referencedColumns: ["id"]
          },
        ]
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
      leaderboard_snapshots: {
        Row: {
          captured_at: string
          id: string
          payload: Json
          season_id: string
          tier: Database["public"]["Enums"]["rank_tier"] | null
        }
        Insert: {
          captured_at?: string
          id?: string
          payload: Json
          season_id: string
          tier?: Database["public"]["Enums"]["rank_tier"] | null
        }
        Update: {
          captured_at?: string
          id?: string
          payload?: Json
          season_id?: string
          tier?: Database["public"]["Enums"]["rank_tier"] | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_snapshots_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      lockin_contract_missions: {
        Row: {
          completed_at: string | null
          contract_id: string
          created_at: string
          id: string
          mission_date: string
          problem_id: string | null
          status: string
          task_type: string
          title: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          contract_id: string
          created_at?: string
          id?: string
          mission_date?: string
          problem_id?: string | null
          status?: string
          task_type: string
          title: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          contract_id?: string
          created_at?: string
          id?: string
          mission_date?: string
          problem_id?: string | null
          status?: string
          task_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lockin_contract_missions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "lockin_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      lockin_contracts: {
        Row: {
          accepted_by_a: boolean
          accepted_by_b: boolean
          created_at: string
          daily_target: number
          duo_streak: number
          end_date: string | null
          gap_list: string[]
          id: string
          next_trial_date: string | null
          next_trial_format: string | null
          partner_a_id: string
          partner_b_id: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          accepted_by_a?: boolean
          accepted_by_b?: boolean
          created_at?: string
          daily_target?: number
          duo_streak?: number
          end_date?: string | null
          gap_list?: string[]
          id?: string
          next_trial_date?: string | null
          next_trial_format?: string | null
          partner_a_id: string
          partner_b_id: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_by_a?: boolean
          accepted_by_b?: boolean
          created_at?: string
          daily_target?: number
          duo_streak?: number
          end_date?: string | null
          gap_list?: string[]
          id?: string
          next_trial_date?: string | null
          next_trial_format?: string | null
          partner_a_id?: string
          partner_b_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      lockin_partner_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          responded_at: string | null
          sender_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          responded_at?: string | null
          sender_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          responded_at?: string | null
          sender_id?: string
          status?: string
        }
        Relationships: []
      }
      lockin_partner_stats: {
        Row: {
          best_streak: number
          chemistry_score: number
          clutch_score: number
          completed_contracts: number
          created_at: string
          current_streak: number
          discipline_score: number
          id: string
          reliability_score: number
          total_contracts: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_streak?: number
          chemistry_score?: number
          clutch_score?: number
          completed_contracts?: number
          created_at?: string
          current_streak?: number
          discipline_score?: number
          id?: string
          reliability_score?: number
          total_contracts?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_streak?: number
          chemistry_score?: number
          clutch_score?: number
          completed_contracts?: number
          created_at?: string
          current_streak?: number
          discipline_score?: number
          id?: string
          reliability_score?: number
          total_contracts?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lockin_training_cards: {
        Row: {
          accountability_style: string
          comm_style: string
          contest_rating: string | null
          created_at: string
          daily_commitment: number
          focus: string
          goal: string
          id: string
          internal_rating: number
          language: string
          no_ghosting_rule: boolean
          pace: string
          preferred_slots: Json
          solved_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accountability_style: string
          comm_style: string
          contest_rating?: string | null
          created_at?: string
          daily_commitment?: number
          focus: string
          goal: string
          id?: string
          internal_rating?: number
          language: string
          no_ghosting_rule?: boolean
          pace: string
          preferred_slots?: Json
          solved_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accountability_style?: string
          comm_style?: string
          contest_rating?: string | null
          created_at?: string
          daily_commitment?: number
          focus?: string
          goal?: string
          id?: string
          internal_rating?: number
          language?: string
          no_ghosting_rule?: boolean
          pace?: string
          preferred_slots?: Json
          solved_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lockin_trial_reports: {
        Row: {
          contract_id: string
          created_at: string
          generated_at: string
          id: string
          next_week_plan: Json
          qualified: boolean
          revision_plan: Json
          time_lost_breakdown: Json
          trial_id: string
          user_id: string
          wrong_attempt_patterns: Json
        }
        Insert: {
          contract_id: string
          created_at?: string
          generated_at?: string
          id?: string
          next_week_plan?: Json
          qualified?: boolean
          revision_plan?: Json
          time_lost_breakdown?: Json
          trial_id: string
          user_id: string
          wrong_attempt_patterns?: Json
        }
        Update: {
          contract_id?: string
          created_at?: string
          generated_at?: string
          id?: string
          next_week_plan?: Json
          qualified?: boolean
          revision_plan?: Json
          time_lost_breakdown?: Json
          trial_id?: string
          user_id?: string
          wrong_attempt_patterns?: Json
        }
        Relationships: [
          {
            foreignKeyName: "lockin_trial_reports_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "lockin_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lockin_trial_reports_trial_id_fkey"
            columns: ["trial_id"]
            isOneToOne: false
            referencedRelation: "lockin_trials"
            referencedColumns: ["id"]
          },
        ]
      }
      lockin_trials: {
        Row: {
          contract_id: string
          created_at: string
          duration_minutes: number
          ended_at: string | null
          format: string
          id: string
          problems: Json
          results: Json
          scheduled_at: string
          started_at: string | null
          status: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          duration_minutes?: number
          ended_at?: string | null
          format: string
          id?: string
          problems?: Json
          results?: Json
          scheduled_at: string
          started_at?: string | null
          status?: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          duration_minutes?: number
          ended_at?: string | null
          format?: string
          id?: string
          problems?: Json
          results?: Json
          scheduled_at?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lockin_trials_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "lockin_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      match_topic_actions: {
        Row: {
          action: string
          created_at: string
          id: string
          match_id: string
          order_index: number
          topic: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          match_id: string
          order_index?: number
          topic: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          match_id?: string
          order_index?: number
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      match_topic_pool: {
        Row: {
          id: string
          match_id: string
          source: string
          topic: string
        }
        Insert: {
          id?: string
          match_id: string
          source?: string
          topic: string
        }
        Update: {
          id?: string
          match_id?: string
          source?: string
          topic?: string
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
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          severity: string
          subtext: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          severity?: string
          subtext?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          severity?: string
          subtext?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      oa_assessments: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          order_index: number | null
          pack_id: string
          rules_json: Json | null
          sections_json: Json | null
          title: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          order_index?: number | null
          pack_id: string
          rules_json?: Json | null
          sections_json?: Json | null
          title: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          order_index?: number | null
          pack_id?: string
          rules_json?: Json | null
          sections_json?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "oa_assessments_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "oa_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      oa_attempt_answers: {
        Row: {
          answer: string | null
          attempt_id: string
          created_at: string
          id: string
          question_id: string
          score: number | null
          status: string
          time_spent_sec: number | null
          updated_at: string
        }
        Insert: {
          answer?: string | null
          attempt_id: string
          created_at?: string
          id?: string
          question_id: string
          score?: number | null
          status?: string
          time_spent_sec?: number | null
          updated_at?: string
        }
        Update: {
          answer?: string | null
          attempt_id?: string
          created_at?: string
          id?: string
          question_id?: string
          score?: number | null
          status?: string
          time_spent_sec?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oa_attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "oa_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oa_attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "oa_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      oa_attempts: {
        Row: {
          assessment_id: string
          created_at: string
          id: string
          integrity_json: Json | null
          max_score: number | null
          score: number | null
          started_at: string
          status: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          id?: string
          integrity_json?: Json | null
          max_score?: number | null
          score?: number | null
          started_at?: string
          status?: string
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          id?: string
          integrity_json?: Json | null
          max_score?: number | null
          score?: number | null
          started_at?: string
          status?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oa_attempts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "oa_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      oa_packs: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string
          duration_minutes: number
          icon: string | null
          id: string
          is_featured: boolean | null
          order_index: number | null
          role_track: string
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          order_index?: number | null
          role_track?: string
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          order_index?: number | null
          role_track?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      oa_questions: {
        Row: {
          assessment_id: string
          company: string | null
          config_json: Json
          constraints_text: string | null
          created_at: string
          difficulty: string
          id: string
          input_format: string | null
          output_format: string | null
          points: number
          question_order: number
          sample_input: string | null
          sample_output: string | null
          section_index: number
          statement: string
          tags: string[] | null
          topic: string | null
          type: string
        }
        Insert: {
          assessment_id: string
          company?: string | null
          config_json?: Json
          constraints_text?: string | null
          created_at?: string
          difficulty?: string
          id?: string
          input_format?: string | null
          output_format?: string | null
          points?: number
          question_order?: number
          sample_input?: string | null
          sample_output?: string | null
          section_index?: number
          statement: string
          tags?: string[] | null
          topic?: string | null
          type: string
        }
        Update: {
          assessment_id?: string
          company?: string | null
          config_json?: Json
          constraints_text?: string | null
          created_at?: string
          difficulty?: string
          id?: string
          input_format?: string | null
          output_format?: string | null
          points?: number
          question_order?: number
          sample_input?: string | null
          sample_output?: string | null
          section_index?: number
          statement?: string
          tags?: string[] | null
          topic?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "oa_questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "oa_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      oa_readiness: {
        Row: {
          best_score: number | null
          id: string
          oa_streak: number | null
          readiness_score: number | null
          total_attempts: number | null
          updated_at: string
          user_id: string
          weak_topics: string[] | null
        }
        Insert: {
          best_score?: number | null
          id?: string
          oa_streak?: number | null
          readiness_score?: number | null
          total_attempts?: number | null
          updated_at?: string
          user_id: string
          weak_topics?: string[] | null
        }
        Update: {
          best_score?: number | null
          id?: string
          oa_streak?: number | null
          readiness_score?: number | null
          total_attempts?: number | null
          updated_at?: string
          user_id?: string
          weak_topics?: string[] | null
        }
        Relationships: []
      }
      oa_set_problems: {
        Row: {
          created_at: string
          id: string
          question_id: string
          set_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          set_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          set_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oa_set_problems_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "oa_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oa_set_problems_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "oa_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      oa_sets: {
        Row: {
          company: string
          created_at: string
          difficulty: string
          duration_minutes: number
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          company?: string
          created_at?: string
          difficulty?: string
          duration_minutes?: number
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          difficulty?: string
          duration_minutes?: number
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      oa_testcases: {
        Row: {
          created_at: string
          id: string
          input: string
          is_hidden: boolean
          output: string
          question_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          input?: string
          is_hidden?: boolean
          output?: string
          question_id: string
        }
        Update: {
          created_at?: string
          id?: string
          input?: string
          is_hidden?: boolean
          output?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oa_testcases_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "oa_questions"
            referencedColumns: ["id"]
          },
        ]
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
      problem_testcases: {
        Row: {
          expected_output: string
          id: string
          input: string
          is_sample: boolean
          order_index: number
          problem_id: string
        }
        Insert: {
          expected_output: string
          id?: string
          input: string
          is_sample?: boolean
          order_index?: number
          problem_id: string
        }
        Update: {
          expected_output?: string
          id?: string
          input?: string
          is_sample?: boolean
          order_index?: number
          problem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_testcases_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "contest_problems"
            referencedColumns: ["id"]
          },
        ]
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
          role: string
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
          role?: string
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
          role?: string
          streak?: number | null
          updated_at?: string
          username?: string | null
          xp?: number | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      promotion_series: {
        Row: {
          closed_at: string | null
          created_at: string
          id: string
          losses: number
          losses_allowed: number
          season_id: string
          status: Database["public"]["Enums"]["promotion_status"]
          target_tier: Database["public"]["Enums"]["rank_tier"]
          user_id: string
          wins: number
          wins_required: number
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          id?: string
          losses?: number
          losses_allowed?: number
          season_id: string
          status?: Database["public"]["Enums"]["promotion_status"]
          target_tier: Database["public"]["Enums"]["rank_tier"]
          user_id: string
          wins?: number
          wins_required?: number
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          id?: string
          losses?: number
          losses_allowed?: number
          season_id?: string
          status?: Database["public"]["Enums"]["promotion_status"]
          target_tier?: Database["public"]["Enums"]["rank_tier"]
          user_id?: string
          wins?: number
          wins_required?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotion_series_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      rank_states: {
        Row: {
          decay_applied_at: string | null
          demotion_shield: number
          division: Database["public"]["Enums"]["rank_division"]
          games_played: number
          id: string
          last_match_at: string | null
          loss_streak: number
          lp: number
          mmr: number
          mmr_deviation: number
          placements_remaining: number
          season_id: string
          tier: Database["public"]["Enums"]["rank_tier"]
          updated_at: string
          user_id: string
          win_streak: number
        }
        Insert: {
          decay_applied_at?: string | null
          demotion_shield?: number
          division?: Database["public"]["Enums"]["rank_division"]
          games_played?: number
          id?: string
          last_match_at?: string | null
          loss_streak?: number
          lp?: number
          mmr?: number
          mmr_deviation?: number
          placements_remaining?: number
          season_id: string
          tier?: Database["public"]["Enums"]["rank_tier"]
          updated_at?: string
          user_id: string
          win_streak?: number
        }
        Update: {
          decay_applied_at?: string | null
          demotion_shield?: number
          division?: Database["public"]["Enums"]["rank_division"]
          games_played?: number
          id?: string
          last_match_at?: string | null
          loss_streak?: number
          lp?: number
          mmr?: number
          mmr_deviation?: number
          placements_remaining?: number
          season_id?: string
          tier?: Database["public"]["Enums"]["rank_tier"]
          updated_at?: string
          user_id?: string
          win_streak?: number
        }
        Relationships: [
          {
            foreignKeyName: "rank_states_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      rating_history: {
        Row: {
          actual_score: number
          created_at: string
          expected_score: number
          id: string
          k_factor: number
          lp_after: number
          lp_before: number
          match_id: string | null
          mmr_after: number
          mmr_before: number
          reason: string
          season_id: string
          tier_after: Database["public"]["Enums"]["rank_tier"]
          tier_before: Database["public"]["Enums"]["rank_tier"]
          user_id: string
        }
        Insert: {
          actual_score: number
          created_at?: string
          expected_score: number
          id?: string
          k_factor: number
          lp_after: number
          lp_before: number
          match_id?: string | null
          mmr_after: number
          mmr_before: number
          reason: string
          season_id: string
          tier_after: Database["public"]["Enums"]["rank_tier"]
          tier_before: Database["public"]["Enums"]["rank_tier"]
          user_id: string
        }
        Update: {
          actual_score?: number
          created_at?: string
          expected_score?: number
          id?: string
          k_factor?: number
          lp_after?: number
          lp_before?: number
          match_id?: string | null
          mmr_after?: number
          mmr_before?: number
          reason?: string
          season_id?: string
          tier_after?: Database["public"]["Enums"]["rank_tier"]
          tier_before?: Database["public"]["Enums"]["rank_tier"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rating_history_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
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
      seasons: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          name: string
          soft_reset_factor: number
          starts_at: string
          status: Database["public"]["Enums"]["season_status"]
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          name: string
          soft_reset_factor?: number
          starts_at: string
          status?: Database["public"]["Enums"]["season_status"]
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          name?: string
          soft_reset_factor?: number
          starts_at?: string
          status?: Database["public"]["Enums"]["season_status"]
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
      user_battle_stats: {
        Row: {
          best_win_streak: number
          created_at: string
          draws: number
          elo: number
          id: string
          last_battle_at: string | null
          losses: number
          total_duels: number
          total_xp_earned: number
          updated_at: string
          user_id: string
          win_streak: number
          wins: number
        }
        Insert: {
          best_win_streak?: number
          created_at?: string
          draws?: number
          elo?: number
          id?: string
          last_battle_at?: string | null
          losses?: number
          total_duels?: number
          total_xp_earned?: number
          updated_at?: string
          user_id: string
          win_streak?: number
          wins?: number
        }
        Update: {
          best_win_streak?: number
          created_at?: string
          draws?: number
          elo?: number
          id?: string
          last_battle_at?: string | null
          losses?: number
          total_duels?: number
          total_xp_earned?: number
          updated_at?: string
          user_id?: string
          win_streak?: number
          wins?: number
        }
        Relationships: []
      }
      user_contest_ratings: {
        Row: {
          best_rank: number | null
          contests_played: number
          current_streak: number
          id: string
          max_rating: number
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_rank?: number | null
          contests_played?: number
          current_streak?: number
          id?: string
          max_rating?: number
          rating?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_rank?: number | null
          contests_played?: number
          current_streak?: number
          id?: string
          max_rating?: number
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_pack_progress: {
        Row: {
          completed_at: string | null
          id: string
          pack_id: string
          started_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          pack_id: string
          started_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          pack_id?: string
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pack_progress_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "challenge_packs"
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
      mentor_invites_safe: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          clan_id: string | null
          created_at: string | null
          email_masked: string | null
          expertise: Database["public"]["Enums"]["mentor_expertise"] | null
          id: string | null
          invited_by: string | null
          name: string | null
          status: Database["public"]["Enums"]["invite_status"] | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          clan_id?: string | null
          created_at?: string | null
          email_masked?: never
          expertise?: Database["public"]["Enums"]["mentor_expertise"] | null
          id?: string | null
          invited_by?: string | null
          name?: string | null
          status?: Database["public"]["Enums"]["invite_status"] | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          clan_id?: string | null
          created_at?: string | null
          email_masked?: never
          expertise?: Database["public"]["Enums"]["mentor_expertise"] | null
          id?: string | null
          invited_by?: string | null
          name?: string | null
          status?: Database["public"]["Enums"]["invite_status"] | null
        }
        Relationships: []
      }
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
          streak?: never
          username?: string | null
          xp?: never
        }
        Update: {
          avatar_url?: string | null
          division?: string | null
          id?: string | null
          joined_at?: string | null
          streak?: never
          username?: string | null
          xp?: never
        }
        Relationships: []
      }
    }
    Functions: {
      _battle_topic_action: {
        Args: { p_action: string; p_match_id: string; p_topic: string }
        Returns: Json
      }
      accept_mentor_invite: { Args: { invite_token: string }; Returns: Json }
      add_doubt_comment: {
        Args: { p_content: string; p_doubt_id: string }
        Returns: Json
      }
      add_to_revision_queue: {
        Args: {
          p_days_until_revision?: number
          p_problem_id: string
          p_problem_title: string
          p_topic?: string
        }
        Returns: Json
      }
      admin_invalidate_match: {
        Args: { _match_id: string; _reason: string }
        Returns: undefined
      }
      apply_submission_verdict: {
        Args: {
          p_payload?: Json
          p_submission_id: string
          p_verdict: Database["public"]["Enums"]["submission_verdict"]
        }
        Returns: Json
      }
      apply_to_clan: { Args: { p_clan_id: string }; Returns: Json }
      approve_clan_application: {
        Args: { p_application_id: string }
        Returns: Json
      }
      ban_topic: {
        Args: { p_match_id: string; p_topic: string }
        Returns: Json
      }
      battle_transition:
        | {
            Args: {
              _actor?: string
              _match_id: string
              _to: Database["public"]["Enums"]["match_state"]
            }
            Returns: Database["public"]["Enums"]["match_state"]
          }
        | {
            Args: {
              p_actor?: string
              p_match_id: string
              p_payload?: Json
              p_to_state: Database["public"]["Enums"]["match_state"]
            }
            Returns: Database["public"]["Enums"]["match_state"]
          }
      cancel_battle_queue: { Args: never; Returns: number }
      check_battle_queue_status: { Args: never; Returns: Json }
      check_daily_streak: { Args: never; Returns: Json }
      claim_invite_code: {
        Args: { p_code: string; p_user_id: string }
        Returns: Json
      }
      complete_challenge: {
        Args: {
          p_challenge_id: string
          p_language?: string
          p_memory_kb?: number
          p_runtime_ms?: number
        }
        Returns: Json
      }
      complete_daily_challenge: {
        Args: { p_challenge_id: string }
        Returns: Json
      }
      complete_duo_battle:
        | { Args: { p_session_id: string }; Returns: Json }
        | {
            Args: {
              p_player_a_score: number
              p_player_b_score: number
              p_session_id: string
            }
            Returns: Json
          }
      complete_revision: { Args: { p_topic_id: string }; Returns: Json }
      complete_revision_item: { Args: { p_id: string }; Returns: Json }
      create_clan: {
        Args: {
          p_description?: string
          p_max_members?: number
          p_motto?: string
          p_name: string
          p_privacy?: string
          p_tag: string
          p_timezone?: string
        }
        Returns: Json
      }
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
      current_season_id: { Args: never; Returns: string }
      delete_doubt_comment: { Args: { p_comment_id: string }; Returns: Json }
      ensure_rank_state: {
        Args: { _user_id: string }
        Returns: {
          decay_applied_at: string | null
          demotion_shield: number
          division: Database["public"]["Enums"]["rank_division"]
          games_played: number
          id: string
          last_match_at: string | null
          loss_streak: number
          lp: number
          mmr: number
          mmr_deviation: number
          placements_remaining: number
          season_id: string
          tier: Database["public"]["Enums"]["rank_tier"]
          updated_at: string
          user_id: string
          win_streak: number
        }
        SetofOptions: {
          from: "*"
          to: "rank_states"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      finalize_match: { Args: { _match_id: string }; Returns: Json }
      get_activity_summary: { Args: never; Returns: Json }
      get_ai_usage_today: { Args: never; Returns: Json }
      get_battle_opponent_profile: {
        Args: { p_session_id: string }
        Returns: {
          avatar_url: string
          division: string
          id: string
          username: string
          xp: number
        }[]
      }
      get_challenge_stats: {
        Args: never
        Returns: {
          attempt_count: number
          challenge_id: string
          solve_count: number
          success_rate: number
        }[]
      }
      get_doubt_comment_count: { Args: { p_doubt_id: string }; Returns: number }
      get_doubt_comments: { Args: { p_doubt_id: string }; Returns: Json }
      get_eligible_doubt_topics: { Args: never; Returns: Json }
      get_friend_requests: { Args: never; Returns: Json }
      get_friends: { Args: never; Returns: Json }
      get_friendship_status: {
        Args: { p_other_user_id: string }
        Returns: Json
      }
      get_invite_info: { Args: { invite_token: string }; Returns: Json }
      get_invite_status_by_token: { Args: { p_token: string }; Returns: Json }
      get_leaderboard: {
        Args: {
          _limit?: number
          _season_id?: string
          _tier?: Database["public"]["Enums"]["rank_tier"]
        }
        Returns: {
          games_played: number
          lp: number
          tier: Database["public"]["Enums"]["rank_tier"]
          user_id: string
        }[]
      }
      get_leaderboard_data: {
        Args: { p_division?: string; p_limit?: number }
        Returns: {
          avatar_url: string
          division: string
          id: string
          joined_at: string
          streak: number
          username: string
          xp: number
        }[]
      }
      get_match_history: {
        Args: { _limit?: number; _user_id?: string }
        Returns: {
          ended_at: string
          match_id: string
          mode: string
          opponents: Json
          score: number
          state: Database["public"]["Enums"]["match_state"]
          winner_id: string
        }[]
      }
      get_match_state: { Args: { p_match_id: string }; Returns: Json }
      get_my_mentor_invites: {
        Args: never
        Returns: {
          accepted_at: string
          accepted_by: string
          clan_id: string
          created_at: string
          email_masked: string
          expertise: Database["public"]["Enums"]["mentor_expertise"]
          id: string
          invited_by: string
          name: string
          status: Database["public"]["Enums"]["invite_status"]
        }[]
      }
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
      get_pack_stats: { Args: { p_pack_id: string }; Returns: Json }
      get_public_profile: { Args: { p_username: string }; Returns: Json }
      get_public_profile_fields: {
        Args: { profile_row: Database["public"]["Tables"]["profiles"]["Row"] }
        Returns: Json
      }
      get_public_profiles: {
        Args: { p_limit?: number }
        Returns: {
          avatar_url: string
          division: string
          id: string
          joined_at: string
          streak: number
          username: string
          xp: number
        }[]
      }
      get_rank_snapshot: {
        Args: { _season_id?: string; _user_id?: string }
        Returns: Json
      }
      get_revision_queue: { Args: never; Returns: Json }
      get_user_battle_stats: { Args: never; Returns: Json }
      get_user_level: { Args: { p_user_id: string }; Returns: number }
      get_user_pack_progress: {
        Args: { p_pack_id: string; p_user_id: string }
        Returns: Json
      }
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_challenge_unlocked: {
        Args: { p_challenge_id: string; p_user_id: string }
        Returns: boolean
      }
      is_clan_admin: {
        Args: { _clan_id: string; _user_id: string }
        Returns: boolean
      }
      is_clan_member: {
        Args: { _clan_id: string; _user_id: string }
        Returns: boolean
      }
      is_reading_public_fields: { Args: never; Returns: boolean }
      join_battle_queue: {
        Args: { p_mode: string; p_target_user_id?: string }
        Returns: string
      }
      join_clan: { Args: { p_clan_id: string }; Returns: Json }
      leave_clan_v2: { Args: never; Returns: Json }
      log_anticheat_event: {
        Args: {
          _evidence?: Json
          _kind: Database["public"]["Enums"]["anticheat_kind"]
          _match_id: string
          _severity?: number
        }
        Returns: string
      }
      mark_doubt_solved: { Args: { p_doubt_id: string }; Returns: Json }
      mm_dequeue: { Args: { _reason?: string }; Returns: number }
      mm_enqueue: {
        Args: { _config_key?: string; _mode: string; _region?: string }
        Returns: string
      }
      mm_status: {
        Args: never
        Returns: {
          elo: number
          matched_at: string
          mode: string
          queue_id: string
          waiting_seconds: number
        }[]
      }
      mm_tick: { Args: never; Returns: number }
      pick_topic: {
        Args: { p_match_id: string; p_topic: string }
        Returns: Json
      }
      re_apply_match: { Args: { _match_id: string }; Returns: undefined }
      re_decay_inactive: { Args: { _season_id: string }; Returns: number }
      re_expected_score: {
        Args: { _mmr_a: number; _mmr_b: number }
        Returns: number
      }
      re_k_factor: {
        Args: { _deviation: number; _games: number; _is_placement: boolean }
        Returns: number
      }
      re_tier_from_lp: {
        Args: { _lp: number }
        Returns: Database["public"]["Enums"]["rank_tier"]
      }
      ready_check_respond: {
        Args: { p_match_id: string; p_ready: boolean }
        Returns: Json
      }
      record_activity: { Args: { p_problems_solved?: number }; Returns: Json }
      record_ai_usage: {
        Args: {
          p_context?: Json
          p_insight_type: string
          p_tokens_used?: number
        }
        Returns: Json
      }
      record_battle_result: {
        Args: {
          p_battle_id: string
          p_clan_a_id: string
          p_clan_a_name: string
          p_clan_a_score: number
          p_clan_b_id: string
          p_clan_b_name: string
          p_clan_b_score: number
          p_elo_change?: number
          p_ended_at: string
          p_mvp_username?: string
          p_mvp_xp?: number
          p_problems_solved_a: number
          p_problems_solved_b: number
          p_started_at: string
          p_total_problems: number
          p_xp_change?: number
        }
        Returns: Json
      }
      respond_friend_request: {
        Args: { p_accept: boolean; p_request_id: string }
        Returns: Json
      }
      review_anticheat_flag: {
        Args: {
          _decision: Database["public"]["Enums"]["anticheat_status"]
          _flag_id: string
        }
        Returns: undefined
      }
      score_match: {
        Args: { _match_id: string }
        Returns: {
          is_draw: boolean
          winner_id: string
        }[]
      }
      score_problem: {
        Args: {
          _base: number
          _limit_sec: number
          _solve_sec: number
          _wrong: number
        }
        Returns: number
      }
      send_friend_request: { Args: { p_receiver_id: string }; Returns: Json }
      start_roadmap: { Args: { p_roadmap_id: string }; Returns: Json }
      submit_battle_solution: {
        Args: {
          p_code: string
          p_idempotency_key?: string
          p_language: string
          p_match_id: string
          p_problem_id: string
        }
        Returns: string
      }
      transfer_clan_leadership: {
        Args: { p_new_leader_id: string }
        Returns: Json
      }
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
      anticheat_kind:
        | "tab_blur"
        | "paste_burst"
        | "ai_pattern"
        | "dup_submission"
        | "collusion_window"
        | "plagiarism_score"
        | "solve_anomaly"
        | "disconnect_abuse"
      anticheat_status:
        | "pending_review"
        | "dismissed"
        | "warning"
        | "penalty"
        | "match_invalidated"
      app_role: "mentor" | "student"
      doubt_category: "study" | "job" | "internship" | "referral"
      doubt_difficulty: "beginner" | "intermediate" | "advanced"
      friend_status: "pending" | "accepted" | "rejected"
      invite_status: "pending" | "accepted" | "expired"
      match_state:
        | "idle"
        | "queued"
        | "match_found"
        | "ready_check"
        | "ban_pick"
        | "active"
        | "judging"
        | "completed"
        | "cancelled"
        | "abandoned"
        | "invalidated"
      mentor_expertise: "dsa" | "cp" | "web" | "system_design"
      promotion_status: "active" | "promoted" | "failed"
      rank_division: "IV" | "III" | "II" | "I"
      rank_tier:
        | "bronze"
        | "silver"
        | "gold"
        | "platinum"
        | "diamond"
        | "master"
        | "grandmaster"
        | "challenger"
      season_status: "upcoming" | "active" | "ended"
      submission_verdict:
        | "pending"
        | "accepted"
        | "wrong_answer"
        | "time_limit"
        | "runtime_error"
        | "compile_error"
        | "memory_limit"
        | "internal_error"
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
      anticheat_kind: [
        "tab_blur",
        "paste_burst",
        "ai_pattern",
        "dup_submission",
        "collusion_window",
        "plagiarism_score",
        "solve_anomaly",
        "disconnect_abuse",
      ],
      anticheat_status: [
        "pending_review",
        "dismissed",
        "warning",
        "penalty",
        "match_invalidated",
      ],
      app_role: ["mentor", "student"],
      doubt_category: ["study", "job", "internship", "referral"],
      doubt_difficulty: ["beginner", "intermediate", "advanced"],
      friend_status: ["pending", "accepted", "rejected"],
      invite_status: ["pending", "accepted", "expired"],
      match_state: [
        "idle",
        "queued",
        "match_found",
        "ready_check",
        "ban_pick",
        "active",
        "judging",
        "completed",
        "cancelled",
        "abandoned",
        "invalidated",
      ],
      mentor_expertise: ["dsa", "cp", "web", "system_design"],
      promotion_status: ["active", "promoted", "failed"],
      rank_division: ["IV", "III", "II", "I"],
      rank_tier: [
        "bronze",
        "silver",
        "gold",
        "platinum",
        "diamond",
        "master",
        "grandmaster",
        "challenger",
      ],
      season_status: ["upcoming", "active", "ended"],
      submission_verdict: [
        "pending",
        "accepted",
        "wrong_answer",
        "time_limit",
        "runtime_error",
        "compile_error",
        "memory_limit",
        "internal_error",
      ],
      topic_state: ["not_started", "in_progress", "completed"],
    },
  },
} as const
