
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
      }
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
          login_background_image: string | null
          login_card_background_color: string
          login_button_color: string
          login_button_text_color: string
          login_label_color: string
          login_label_muted_color: string
          login_developer_text: string
          login_quote_text: string
          login_quote_author: string
          login_quote_author_title: string
        }
      }
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          event_date: string;
          event_time: string;
          end_time: string;
          location?: string;
          maps_url?: string;
          entrance_fee?: string;
          created_at: string;
          button_color?: string;
          button_secondary_color?: string;
          video_url?: string;
          image?: string;
          images?: string[];
          category_id?: string;
        }
      }
      categories: {
        Row: {
          id: string;
          name: string;
          background_color?: string;
        }
      }
    }
  }
}

export interface InstagramMedia {
  url: string;
  type: 'post' | 'video';
}
