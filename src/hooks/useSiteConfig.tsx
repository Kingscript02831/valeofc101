
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const useSiteConfig = () => {
  return useQuery({
    queryKey: ["site-configuration"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_configuration").select("*").single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Database["public"]["Tables"]["site_configuration"]["Row"];
    },
  });
};
