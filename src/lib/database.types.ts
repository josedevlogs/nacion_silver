export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'moderator' | 'admin';
export type PassportLevel = 'silver' | 'residente_silver' | 'ciudadano_silver' | 'embajador_silver';
export type ContentType = 'article' | 'announcement' | 'event' | 'challenge_promo';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type ChallengeType = 'internal' | 'external';
export type ChallengeOrigin = 'nacion' | 'aula' | 'microaula' | 'bienestar' | 'event';
export type ValidationMethod = 'manual' | 'code' | 'qr' | 'integration';
export type ChallengeStatus = 'pending' | 'completed';
export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'expired' | 'pending_confirmation';
export type PaymentMethod = 'paypal' | 'offline';
export type TransactionType = 'earned' | 'deducted' | 'admin_adjustment';
export type FeedPostType = 'announcement' | 'poll' | 'visual' | 'activation';
export type FeedPostStatus = 'draft' | 'published' | 'archived';
export type GroupAccessMode = 'open' | 'closed' | 'invitation' | 'conditional';
export type ClubSilverRequestStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          full_name: string;
          age: number;
          dni: string;
          nationality: string;
          country: string;
          city: string;
          interests: string[];
          current_level: PassportLevel;
          total_points: number;
          role: UserRole;
          profile_completed: boolean;
          avatar_url: string | null;
          es_club_silver: boolean;
          email: string | null;
          is_banned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          age: number;
          dni: string;
          nationality: string;
          country: string;
          city: string;
          interests: string[];
          current_level?: PassportLevel;
          total_points?: number;
          role?: UserRole;
          profile_completed?: boolean;
          avatar_url?: string | null;
          es_club_silver?: boolean;
          email?: string | null;
          is_banned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          age?: number;
          dni?: string;
          nationality?: string;
          country?: string;
          city?: string;
          interests?: string[];
          current_level?: PassportLevel;
          total_points?: number;
          role?: UserRole;
          profile_completed?: boolean;
          avatar_url?: string | null;
          es_club_silver?: boolean;
          email?: string | null;
          is_banned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      passport_levels: {
        Row: {
          id: number;
          level_name: PassportLevel;
          display_name: string;
          description: string;
          min_points: number;
          max_points: number | null;
          level_order: number;
          benefits_description: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          level_name: PassportLevel;
          display_name: string;
          description: string;
          min_points: number;
          max_points?: number | null;
          level_order: number;
          benefits_description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          level_name?: PassportLevel;
          display_name?: string;
          description?: string;
          min_points?: number;
          max_points?: number | null;
          level_order?: number;
          benefits_description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      silver_points_transactions: {
        Row: {
          id: string;
          user_id: string;
          points: number;
          transaction_type: TransactionType;
          source: string;
          reason: string;
          reference_id: string | null;
          balance_after: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          points: number;
          transaction_type?: TransactionType;
          source: string;
          reason: string;
          reference_id?: string | null;
          balance_after: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          points?: number;
          transaction_type?: TransactionType;
          source?: string;
          reason?: string;
          reference_id?: string | null;
          balance_after?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          full_description: string | null;
          image_url: string | null;
          challenge_type: ChallengeType;
          origin: ChallengeOrigin;
          points_reward: number;
          validation_method: ValidationMethod;
          validation_code: string | null;
          category: string | null;
          tags: string[];
          is_active: boolean;
          is_featured: boolean;
          display_order: number;
          max_completions: number | null;
          total_completions: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          full_description?: string | null;
          image_url?: string | null;
          challenge_type?: ChallengeType;
          origin?: ChallengeOrigin;
          points_reward?: number;
          validation_method?: ValidationMethod;
          validation_code?: string | null;
          category?: string | null;
          tags?: string[];
          is_active?: boolean;
          is_featured?: boolean;
          display_order?: number;
          max_completions?: number | null;
          total_completions?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          full_description?: string | null;
          image_url?: string | null;
          challenge_type?: ChallengeType;
          origin?: ChallengeOrigin;
          points_reward?: number;
          validation_method?: ValidationMethod;
          validation_code?: string | null;
          category?: string | null;
          tags?: string[];
          is_active?: boolean;
          is_featured?: boolean;
          display_order?: number;
          max_completions?: number | null;
          total_completions?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_challenges: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          status: ChallengeStatus;
          validation_data: string | null;
          points_earned: number;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          status?: ChallengeStatus;
          validation_data?: string | null;
          points_earned?: number;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_id?: string;
          status?: ChallengeStatus;
          validation_data?: string | null;
          points_earned?: number;
          started_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      contents: {
        Row: {
          id: string;
          title: string;
          short_description: string | null;
          full_content: string;
          image_url: string | null;
          content_type: ContentType;
          category: string | null;
          tags: string[];
          points_reward: number;
          status: ContentStatus;
          published_at: string | null;
          scheduled_for: string | null;
          view_count: number;
          completion_count: number;
          favorite_count: number;
          is_featured: boolean;
          display_order: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          short_description?: string | null;
          full_content: string;
          image_url?: string | null;
          content_type?: ContentType;
          category?: string | null;
          tags?: string[];
          points_reward?: number;
          status?: ContentStatus;
          published_at?: string | null;
          scheduled_for?: string | null;
          view_count?: number;
          completion_count?: number;
          favorite_count?: number;
          is_featured?: boolean;
          display_order?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          short_description?: string | null;
          full_content?: string;
          image_url?: string | null;
          content_type?: ContentType;
          category?: string | null;
          tags?: string[];
          points_reward?: number;
          status?: ContentStatus;
          published_at?: string | null;
          scheduled_for?: string | null;
          view_count?: number;
          completion_count?: number;
          favorite_count?: number;
          is_featured?: boolean;
          display_order?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_content_interactions: {
        Row: {
          id: string;
          user_id: string;
          content_id: string;
          viewed: boolean;
          completed: boolean;
          favorited: boolean;
          points_earned: number;
          first_viewed_at: string | null;
          completed_at: string | null;
          favorited_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_id: string;
          viewed?: boolean;
          completed?: boolean;
          favorited?: boolean;
          points_earned?: number;
          first_viewed_at?: string | null;
          completed_at?: string | null;
          favorited_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_id?: string;
          viewed?: boolean;
          completed?: boolean;
          favorited?: boolean;
          points_earned?: number;
          first_viewed_at?: string | null;
          completed_at?: string | null;
          favorited_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      benefits: {
        Row: {
          id: string;
          title: string;
          short_description: string;
          full_description: string;
          image_url: string | null;
          category: string;
          required_level: PassportLevel;
          requires_silver_club: boolean;
          redemption_instructions: string;
          redemption_code: string | null;
          terms_and_conditions: string | null;
          usage_limit: number | null;
          total_redemptions: number;
          valid_from: string | null;
          valid_until: string | null;
          is_active: boolean;
          is_featured: boolean;
          display_order: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          short_description: string;
          full_description: string;
          image_url?: string | null;
          category?: string;
          required_level?: PassportLevel;
          requires_silver_club?: boolean;
          redemption_instructions: string;
          redemption_code?: string | null;
          terms_and_conditions?: string | null;
          usage_limit?: number | null;
          total_redemptions?: number;
          valid_from?: string | null;
          valid_until?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          display_order?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          short_description?: string;
          full_description?: string;
          image_url?: string | null;
          category?: string;
          required_level?: PassportLevel;
          requires_silver_club?: boolean;
          redemption_instructions?: string;
          redemption_code?: string | null;
          terms_and_conditions?: string | null;
          usage_limit?: number | null;
          total_redemptions?: number;
          valid_from?: string | null;
          valid_until?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          display_order?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      silver_club_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          status: SubscriptionStatus;
          plan_type: string;
          start_date: string | null;
          end_date: string | null;
          trial_end_date: string | null;
          next_billing_date: string | null;
          payment_method: PaymentMethod | null;
          payment_reference: string | null;
          amount_paid: number | null;
          currency: string;
          payment_proof_url: string | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
          confirmed_by: string | null;
          confirmed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: SubscriptionStatus;
          plan_type?: string;
          start_date?: string | null;
          end_date?: string | null;
          trial_end_date?: string | null;
          next_billing_date?: string | null;
          payment_method?: PaymentMethod | null;
          payment_reference?: string | null;
          amount_paid?: number | null;
          currency?: string;
          payment_proof_url?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          confirmed_by?: string | null;
          confirmed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: SubscriptionStatus;
          plan_type?: string;
          start_date?: string | null;
          end_date?: string | null;
          trial_end_date?: string | null;
          next_billing_date?: string | null;
          payment_method?: PaymentMethod | null;
          payment_reference?: string | null;
          amount_paid?: number | null;
          currency?: string;
          payment_proof_url?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          confirmed_by?: string | null;
          confirmed_at?: string | null;
        };
        Relationships: [];
      };
      user_activity_log: {
        Row: {
          id: string;
          user_id: string;
          activity_type: string;
          activity_description: string;
          reference_type: string | null;
          reference_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: string;
          activity_description: string;
          reference_type?: string | null;
          reference_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: string;
          activity_description?: string;
          reference_type?: string | null;
          reference_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      feed_posts: {
        Row: {
          id: string;
          post_type: FeedPostType;
          title: string;
          body: string | null;
          link_url: string | null;
          external_media_url: string | null;
          challenge_id: string | null;
          poll_option_1: string | null;
          poll_option_2: string | null;
          poll_option_3: string | null;
          poll_closes_at: string | null;
          poll_closed_manually: boolean;
          is_pinned: boolean;
          published_at: string | null;
          status: FeedPostStatus;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_type?: FeedPostType;
          title: string;
          body?: string | null;
          link_url?: string | null;
          external_media_url?: string | null;
          challenge_id?: string | null;
          poll_option_1?: string | null;
          poll_option_2?: string | null;
          poll_option_3?: string | null;
          poll_closes_at?: string | null;
          poll_closed_manually?: boolean;
          is_pinned?: boolean;
          published_at?: string | null;
          status?: FeedPostStatus;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_type?: FeedPostType;
          title?: string;
          body?: string | null;
          link_url?: string | null;
          external_media_url?: string | null;
          challenge_id?: string | null;
          poll_option_1?: string | null;
          poll_option_2?: string | null;
          poll_option_3?: string | null;
          poll_closes_at?: string | null;
          poll_closed_manually?: boolean;
          is_pinned?: boolean;
          published_at?: string | null;
          status?: FeedPostStatus;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      feed_post_reactions: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          emoji: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          emoji: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          emoji?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      feed_poll_votes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          option_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          option_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          option_index?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      community_groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          objective: string | null;
          access_mode: GroupAccessMode;
          min_passport_level: PassportLevel | null;
          requires_silver_club: boolean;
          facilitator_user_id: string | null;
          facilitator_display_name: string | null;
          max_members: number;
          next_session_at: string | null;
          next_session_label: string | null;
          is_listed: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          objective?: string | null;
          access_mode?: GroupAccessMode;
          min_passport_level?: PassportLevel | null;
          requires_silver_club?: boolean;
          facilitator_user_id?: string | null;
          facilitator_display_name?: string | null;
          max_members?: number;
          next_session_at?: string | null;
          next_session_label?: string | null;
          is_listed?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          objective?: string | null;
          access_mode?: GroupAccessMode;
          min_passport_level?: PassportLevel | null;
          requires_silver_club?: boolean;
          facilitator_user_id?: string | null;
          facilitator_display_name?: string | null;
          max_members?: number;
          next_session_at?: string | null;
          next_session_label?: string | null;
          is_listed?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      community_group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          is_facilitator: boolean;
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          is_facilitator?: boolean;
          joined_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          is_facilitator?: boolean;
          joined_at?: string;
        };
        Relationships: [];
      };
      club_silver_requests: {
        Row: {
          id: string;
          user_id: string;
          plan_type: string;
          status: ClubSilverRequestStatus;
          user_notes: string | null;
          payment_reference: string | null;
          created_at: string;
          updated_at: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
          admin_notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_type?: string;
          status?: ClubSilverRequestStatus;
          user_notes?: string | null;
          payment_reference?: string | null;
          created_at?: string;
          updated_at?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          admin_notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_type?: string;
          status?: ClubSilverRequestStatus;
          user_notes?: string | null;
          payment_reference?: string | null;
          created_at?: string;
          updated_at?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          admin_notes?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      add_silver_points: {
        Args: {
          p_user_id: string;
          p_points: number;
          p_source: string;
          p_reason: string;
          p_reference_id?: string;
          p_transaction_type?: TransactionType;
        };
        Returns: Json;
      };
      complete_challenge: {
        Args: {
          p_user_id: string;
          p_challenge_id: string;
          p_validation_data?: string;
        };
        Returns: Json;
      };
      mark_content_completed: {
        Args: {
          p_user_id: string;
          p_content_id: string;
        };
        Returns: Json;
      };
      toggle_content_favorite: {
        Args: {
          p_user_id: string;
          p_content_id: string;
        };
        Returns: Json;
      };
      record_content_view: {
        Args: {
          p_user_id: string;
          p_content_id: string;
        };
        Returns: Json;
      };
      get_user_dashboard_stats: {
        Args: {
          p_user_id: string;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
  };
}
