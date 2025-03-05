export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      site_configuration: {
        Row: {
          id: string
          theme_name: string
          primary_color: string
          secondary_color: string
          background_color: string
          text_color: string
          navbar_color: string
          created_at: string
          updated_at: string
          navbar_logo_type: string
          navbar_logo_text: string | null
          navbar_logo_image: string | null
          navbar_social_facebook: string | null
          navbar_social_instagram: string | null
          language: string
          enable_dark_mode: boolean
          enable_weather: boolean
          header_alerts: Json[]
          navigation_links: Json[]
          font_size: string
          footer_primary_color: string
          footer_secondary_color: string
          footer_text_color: string
          footer_contact_email: string | null
          footer_contact_phone: string | null
          footer_address: string | null
          footer_address_cep: string | null
          footer_social_facebook: string | null
          footer_social_instagram: string | null
          footer_schedule: string | null
          footer_copyright_text: string
          meta_title: string
          meta_description: string
          meta_author: string
          meta_image: string
          button_primary_color: string
          button_secondary_color: string
          bottom_nav_primary_color: string
          bottom_nav_secondary_color: string
          bottom_nav_text_color: string
          bottom_nav_icon_color: string
          high_contrast: boolean
          location_lat: number | null
          location_lng: number | null
          location_city: string | null
          location_state: string | null
          location_country: string | null
          weather_api_key: string | null
          version: number
          login_text_color: string
          signup_text_color: string
          pwa_name: string
          pwa_short_name: string
          pwa_description: string
          pwa_theme_color: string
          pwa_background_color: string
          pwa_install_message: string
          pwa_app_icon: string | null
          admin_accent_color: string
          admin_background_color: string
          admin_card_color: string
          admin_header_color: string
          admin_hover_color: string
          admin_sidebar_color: string
          admin_text_color: string
          favorite_heart_color: string
          buy_button_color: string
          buy_button_text: string
          whatsapp_message?: string | null
          basic_info_update_interval?: number | null
          login_background_image?: string | null
          login_card_background_color?: string | null
          login_button_color?: string | null
          login_button_text_color?: string | null
          login_developer_text?: string | null
          login_quote_text?: string | null
          login_quote_author?: string | null
          login_quote_author_title?: string | null
        }
        Insert: {
          id?: string
          theme_name: string
          primary_color: string
          secondary_color: string
          background_color: string
          text_color: string
          navbar_color: string
          created_at?: string
          updated_at?: string
          navbar_logo_type: string
          navbar_logo_text?: string | null
          navbar_logo_image?: string | null
          navbar_social_facebook?: string | null
          navbar_social_instagram?: string | null
          language: string
          enable_dark_mode: boolean
          enable_weather: boolean
          header_alerts: Json[]
          navigation_links: Json[]
          font_size: string
          footer_primary_color: string
          footer_secondary_color: string
          footer_text_color: string
          footer_contact_email?: string | null
          footer_contact_phone?: string | null
          footer_address?: string | null
          footer_address_cep?: string | null
          footer_social_facebook?: string | null
          footer_social_instagram?: string | null
          footer_schedule?: string | null
          footer_copyright_text: string
          meta_title: string
          meta_description: string
          meta_author: string
          meta_image: string
          button_primary_color: string
          button_secondary_color: string
          bottom_nav_primary_color: string
          bottom_nav_secondary_color: string
          bottom_nav_text_color: string
          bottom_nav_icon_color: string
          high_contrast: boolean
          location_lat?: number | null
          location_lng?: number | null
          location_city?: string | null
          location_state?: string | null
          location_country?: string | null
          weather_api_key?: string | null
          version: number
          login_text_color: string
          signup_text_color: string
          pwa_name: string
          pwa_short_name: string
          pwa_description: string
          pwa_theme_color: string
          pwa_background_color: string
          pwa_install_message: string
          pwa_app_icon?: string | null
          admin_accent_color: string
          admin_background_color: string
          admin_card_color: string
          admin_header_color: string
          admin_hover_color: string
          admin_sidebar_color: string
          admin_text_color: string
          favorite_heart_color: string
          buy_button_color: string
          buy_button_text: string
          whatsapp_message?: string | null
          basic_info_update_interval?: number | null
          login_background_image?: string | null
          login_card_background_color?: string | null
          login_button_color?: string | null
          login_button_text_color?: string | null
          login_developer_text?: string | null
          login_quote_text?: string | null
          login_quote_author?: string | null
          login_quote_author_title?: string | null
        }
        Update: {
          id?: string
          theme_name?: string
          primary_color?: string
          secondary_color?: string
          background_color?: string
          text_color?: string
          navbar_color?: string
          created_at?: string
          updated_at?: string
          navbar_logo_type?: string
          navbar_logo_text?: string | null
          navbar_logo_image?: string | null
          navbar_social_facebook?: string | null
          navbar_social_instagram?: string | null
          language?: string
          enable_dark_mode?: boolean
          enable_weather?: boolean
          header_alerts?: Json[]
          navigation_links?: Json[]
          font_size?: string
          footer_primary_color?: string
          footer_secondary_color?: string
          footer_text_color?: string
          footer_contact_email?: string | null
          footer_contact_phone?: string | null
          footer_address?: string | null
          footer_address_cep?: string | null
          footer_social_facebook?: string | null
          footer_social_instagram?: string | null
          footer_schedule?: string | null
          footer_copyright_text?: string
          meta_title?: string
          meta_description?: string
          meta_author?: string
          meta_image?: string
          button_primary_color?: string
          button_secondary_color?: string
          bottom_nav_primary_color?: string
          bottom_nav_secondary_color?: string
          bottom_nav_text_color?: string
          bottom_nav_icon_color?: string
          high_contrast?: boolean
          location_lat?: number | null
          location_lng?: number | null
          location_city?: string | null
          location_state?: string | null
          location_country?: string | null
          weather_api_key?: string | null
          version?: number
          login_text_color?: string
          signup_text_color?: string
          pwa_name?: string
          pwa_short_name?: string
          pwa_description?: string
          pwa_theme_color?: string
          pwa_background_color?: string
          pwa_install_message?: string
          pwa_app_icon?: string | null
          admin_accent_color?: string
          admin_background_color?: string
          admin_card_color?: string
          admin_header_color?: string
          admin_hover_color?: string
          admin_sidebar_color?: string
          admin_text_color?: string
          favorite_heart_color?: string
          buy_button_color?: string
          buy_button_text?: string
          whatsapp_message?: string | null
          basic_info_update_interval?: number | null
          login_background_image?: string | null
          login_card_background_color?: string | null
          login_button_color?: string | null
          login_button_text_color?: string | null
          login_developer_text?: string | null
          login_quote_text?: string | null
          login_quote_author?: string | null
          login_quote_author_title?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          email: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          email?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          email?: string | null
        }
      }
      stories: {
        Row: {
          id: string
          created_at: string
          user_id: string
          media_url: string
          duration: number
          viewers: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          media_url: string
          duration: number
          viewers?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          media_url?: string
          duration?: number
          viewers?: string[] | null
        }
      }
      story_comments: {
        Row: {
          id: string
          story_id: string
          user_id: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          story_id: string
          user_id: string
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          user_id?: string
          text?: string
          created_at?: string
        }
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

export type SiteConfiguration = Database['public']['Tables']['site_configuration']['Row'];
