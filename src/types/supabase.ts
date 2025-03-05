export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface SiteConfiguration {
  id: string;
  theme_name: string;
  navbar_logo_type: string;
  navbar_logo_text: string | null;
  navbar_logo_image: string | null;
  navbar_color: string;
  primary_color: string;
  secondary_color: string;
  text_color: string;
  button_primary_color: string;
  button_secondary_color: string;
}

export interface Profile {
  id: string;
  updated_at?: string | null;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  website?: string | null;
  email?: string | null;
  bio?: string | null;
  status?: string | null;
  city?: string | null;
  instagram_url?: string | null;
  relationship_status?: string | null;
  birth_date?: string | null;
  created_at?: string | null;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
          city?: string | null;
          cover_url?: string | null;
          status?: string | null;
          birth_date?: string | null;
          relationship_status?: string | null;
          instagram_url?: string | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
          city?: string | null;
          cover_url?: string | null;
          status?: string | null;
          birth_date?: string | null;
          relationship_status?: string | null;
          instagram_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey";
            columns: ["follower_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follows_following_id_fkey";
            columns: ["following_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      locations: {
        Row: {
          id: string;
          name: string;
          state: string;
          created_at: string;
        }
        Insert: {
          id?: string;
          name: string;
          state: string;
          created_at?: string;
        }
        Update: {
          id?: string;
          name?: string;
          state?: string;
          created_at?: string;
        }
      };
      site_configuration: {
        Row: {
          id: string;
          background_color: string
          bottom_nav_icon_color: string
          bottom_nav_primary_color: string
          bottom_nav_secondary_color: string
          bottom_nav_text_color: string
          button_primary_color: string
          button_secondary_color: string
          created_at: string
          enable_dark_mode: boolean | null
          enable_weather: boolean | null
          font_size: string | null
          footer_address: string | null
          footer_address_cep: string | null
          footer_contact_email: string | null
          footer_contact_phone: string | null
          footer_copyright_text: string | null
          footer_primary_color: string
          footer_schedule: string | null
          footer_secondary_color: string
          footer_social_facebook: string | null
          footer_social_instagram: string | null
          footer_text_color: string
          header_alerts: Json | null
          high_contrast: boolean | null
          language: string | null
          location_city: string | null
          location_country: string | null
          location_lat: number | null
          location_lng: number | null
          location_state: string | null
          meta_author: string | null
          meta_description: string | null
          meta_image: string | null
          meta_title: string | null
          navbar_color: string
          navbar_logo_image: string | null
          navbar_logo_text: string | null
          navbar_logo_type: string
          navbar_social_facebook: string | null
          navbar_social_instagram: string | null
          navigation_links: Json | null
          primary_color: string
          secondary_color: string
          text_color: string
          theme_name: string
          updated_at: string
          version: number | null
          weather_api_key: string | null
          login_text_color: string
          signup_text_color: string
          pwa_name: string | null
          pwa_short_name: string | null
          pwa_description: string | null
          pwa_theme_color: string | null
          pwa_background_color: string | null
          pwa_install_message: string | null
          pwa_app_icon: string | null
        }
      }
      events: {
        Row: {
          id: string;
          name: string;
          start_date: string;
          end_date: string;
          location_id: string;
          created_at: string;
        }
        Insert: {
          id?: string;
          name: string;
          start_date: string;
          end_date: string;
          location_id: string;
          created_at?: string;
        }
        Update: {
          id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          location_id?: string;
          created_at?: string;
        }
        Relationships: [
          {
            foreignKeyName: "events_location_id_fkey";
            columns: ["location_id"];
            referencedRelation: "locations";
            referencedColumns: ["id"];
          }
        ]
      }
      categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        }
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        }
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        }
      }
      stories: {
        Row: {
          id: string;
          user_id: string;
          media_url: string;
          media_type: string;
          created_at: string;
          expires_at: string;
          link_url?: string;
          comments_enabled?: boolean;
        }
        Insert: {
          id?: string;
          user_id: string;
          media_url: string;
          media_type: string;
          created_at?: string;
          expires_at?: string;
          link_url?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          media_url?: string;
          media_type?: string;
          created_at?: string;
          expires_at?: string;
          link_url?: string;
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ]
      };
      story_comments: {
        Row: {
          id: string;
          story_id: string;
          user_id: string;
          text: string;
          parent_comment_id?: string;
          created_at: string;
        }
      }
      story_likes: {
        Row: {
          id: string;
          story_id: string;
          user_id: string;
          created_at: string;
        }
      }
      story_views: {
        Row: {
          id: string;
          story_id: string;
          viewer_id: string;
          viewed_at: string;
        }
      }
    }
  }
}

export interface InstagramMedia {
  url: string;
  type: 'post' | 'video';
}
