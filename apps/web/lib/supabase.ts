export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      changelogs: {
        Row: {
          author_id: string;
          content: string | null;
          id: string;
          image: string | null;
          project_id: string;
          publish_date: string | null;
          published: boolean;
          slug: string;
          summary: string | null;
          title: string;
        };
        Insert: {
          author_id: string;
          content?: string | null;
          id?: string;
          image?: string | null;
          project_id: string;
          publish_date?: string | null;
          published: boolean;
          slug?: string;
          summary?: string | null;
          title?: string;
        };
        Update: {
          author_id?: string;
          content?: string | null;
          id?: string;
          image?: string | null;
          project_id?: string;
          publish_date?: string | null;
          published?: boolean;
          slug?: string;
          summary?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'changelogs_author_id_fkey';
            columns: ['author_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'changelogs_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      feedback: {
        Row: {
          comment_count: number;
          created_at: string;
          description: string;
          id: string;
          project_id: string;
          raw_tags: Json[] | null;
          status: string | null;
          title: string;
          upvotes: number;
          user_id: string;
        };
        Insert: {
          comment_count?: number;
          created_at?: string;
          description: string;
          id?: string;
          project_id: string;
          raw_tags?: Json[] | null;
          status?: string | null;
          title: string;
          upvotes?: number;
          user_id: string;
        };
        Update: {
          comment_count?: number;
          created_at?: string;
          description?: string;
          id?: string;
          project_id?: string;
          raw_tags?: Json[] | null;
          status?: string | null;
          title?: string;
          upvotes?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'feedback_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'feedback_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      feedback_comments: {
        Row: {
          content: string;
          created_at: string;
          feedback_id: string;
          id: string;
          reply_to_id: string | null;
          upvoters: string[] | null;
          upvotes: number;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          feedback_id: string;
          id?: string;
          reply_to_id?: string | null;
          upvoters?: string[] | null;
          upvotes?: number;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          feedback_id?: string;
          id?: string;
          reply_to_id?: string | null;
          upvoters?: string[] | null;
          upvotes?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'feedback_comments_feedback_id_fkey';
            columns: ['feedback_id'];
            referencedRelation: 'feedback';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'feedback_comments_reply_to_id_fkey';
            columns: ['reply_to_id'];
            referencedRelation: 'feedback_comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'feedback_comments_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      feedback_tags: {
        Row: {
          color: string;
          created_at: string;
          id: string;
          name: string;
          project_id: string;
        };
        Insert: {
          color: string;
          created_at?: string;
          id?: string;
          name: string;
          project_id: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          id?: string;
          name?: string;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'feedback_tags_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      feedback_upvoters: {
        Row: {
          created_at: string;
          feedback_id: string;
          id: string;
          profile_id: string;
        };
        Insert: {
          created_at?: string;
          feedback_id: string;
          id?: string;
          profile_id: string;
        };
        Update: {
          created_at?: string;
          feedback_id?: string;
          id?: string;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'feedback_upvoters_feedback_id_fkey';
            columns: ['feedback_id'];
            referencedRelation: 'feedback';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'feedback_upvoters_profile_id_fkey';
            columns: ['profile_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          email: string;
          full_name: string;
          id: string;
        };
        Insert: {
          avatar_url?: string | null;
          email: string;
          full_name: string;
          id: string;
        };
        Update: {
          avatar_url?: string | null;
          email?: string;
          full_name?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      project_api_keys: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          permission: string;
          project_id: string;
          short_token: string;
          token: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          permission: string;
          project_id: string;
          short_token: string;
          token: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          permission?: string;
          project_id?: string;
          short_token?: string;
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'project_api_keys_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      project_configs: {
        Row: {
          changelog_preview_style: string;
          changelog_twitter_handle: string | null;
          created_at: string;
          custom_domain: string | null;
          custom_domain_verified: boolean | null;
          id: string;
          integration_discord_role_id: string | null;
          integration_discord_status: boolean;
          integration_discord_webhook: string | null;
          project_id: string;
        };
        Insert: {
          changelog_preview_style?: string;
          changelog_twitter_handle?: string | null;
          created_at?: string;
          custom_domain?: string | null;
          custom_domain_verified?: boolean | null;
          id?: string;
          integration_discord_role_id?: string | null;
          integration_discord_status?: boolean;
          integration_discord_webhook?: string | null;
          project_id: string;
        };
        Update: {
          changelog_preview_style?: string;
          changelog_twitter_handle?: string | null;
          created_at?: string;
          custom_domain?: string | null;
          custom_domain_verified?: boolean | null;
          id?: string;
          integration_discord_role_id?: string | null;
          integration_discord_status?: boolean;
          integration_discord_webhook?: string | null;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'project_configs_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      project_invites: {
        Row: {
          accepted: boolean;
          created_at: string;
          creator_id: string;
          email: string;
          id: string;
          project_id: string;
        };
        Insert: {
          accepted?: boolean;
          created_at?: string;
          creator_id: string;
          email: string;
          id?: string;
          project_id: string;
        };
        Update: {
          accepted?: boolean;
          created_at?: string;
          creator_id?: string;
          email?: string;
          id?: string;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'project_invites_creator_id_fkey';
            columns: ['creator_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'project_invites_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      project_members: {
        Row: {
          created_at: string | null;
          id: string;
          member_id: string;
          project_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          member_id: string;
          project_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          member_id?: string;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'project_members_member_id_fkey';
            columns: ['member_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'project_members_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      projects: {
        Row: {
          created_at: string | null;
          icon: string | null;
          icon_radius: string | null;
          id: string;
          name: string;
          og_image: string | null;
          slug: string;
        };
        Insert: {
          created_at?: string | null;
          icon?: string | null;
          icon_radius?: string | null;
          id?: string;
          name: string;
          og_image?: string | null;
          slug: string;
        };
        Update: {
          created_at?: string | null;
          icon?: string | null;
          icon_radius?: string | null;
          id?: string;
          name?: string;
          og_image?: string | null;
          slug?: string;
        };
        Relationships: [];
      };
      waitlist: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
