
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/supabase";

export type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

export const useSiteConfig = () => {
  return useQuery({
    queryKey: ['site-configuration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_configuration')
        .select('*')
        .single();
      
      if (error) {
        console.error("Error fetching site configuration:", error);
        throw error;
      }
      
      return data as SiteConfig;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
