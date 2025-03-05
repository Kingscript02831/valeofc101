
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
        login_background_image: data.login_background_image || null,
        login_card_background_color: data.login_card_background_color || '#0F0F10',
        login_button_color: data.login_button_color || '#CB5EEE',
        login_button_text_color: data.login_button_text_color || '#FFFFFF',
        login_label_color: data.login_label_color || '#CB5EEE',
        login_label_muted_color: data.login_label_muted_color || 'rgba(255, 255, 255, 0.6)',
        login_developer_text: data.login_developer_text || '2025 | Desenvolvido por Vinícius Dev',
        login_quote_text: data.login_quote_text || 'No futuro, a tecnologia nos permitirá criar realidades alternativas tão convincentes que será difícil distinguir o que é real do que é simulado.',
        login_quote_author: data.login_quote_author || 'Jaron Lanier',
        login_quote_author_title: data.login_quote_author_title || 'Cientista da computação e especialista em realidade virtual.'
      } as SiteConfiguration;
    },
  });
}
