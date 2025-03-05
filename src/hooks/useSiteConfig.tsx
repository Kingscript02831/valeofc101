
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import type { SiteConfiguration } from "../types/supabase";

export function useSiteConfig() {
  return useQuery({
    queryKey: ["site-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_configuration")
        .select("*")
        .limit(1)
        .single();

      if (error) throw error;

      return {
        ...data,
        navbar_title: data.navbar_logo_text || 'Vale Notícias',
        login_card_background_color: data.login_card_background_color || '#0F0F10',
        login_button_color: data.login_button_color || '#CB5EEE',
        login_button_text_color: data.login_button_text_color || '#FFFFFF',
        login_developer_text: data.login_developer_text || '2025 | Desenvolvido por Vinícius Dev'
      } as SiteConfiguration;
    },
  });
}

// Exportando também o tipo SiteConfig para uso nos outros arquivos
export type SiteConfig = SiteConfiguration;
