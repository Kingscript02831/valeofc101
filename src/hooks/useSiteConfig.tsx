
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SiteConfiguration } from "@/types/supabase";

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
        navbar_title: data.navbar_logo_text || 'Vale Notícias'
      } as SiteConfiguration;
    },
  });
}
