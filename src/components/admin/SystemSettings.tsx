
import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { SiteConfig } from "@/hooks/useSiteConfig";

const SystemSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updateInterval, setUpdateInterval] = useState(30);

  // Fetch current configuration
  const { data: config } = useQuery({
    queryKey: ['site-configuration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_configuration')
        .select('*')
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('No site configuration found');
      
      return data as SiteConfig;
    },
  });

  // Update state when config is loaded
  useEffect(() => {
    if (config?.basic_info_update_interval) {
      setUpdateInterval(config.basic_info_update_interval);
    }
  }, [config]);

  const updateIntervalMutation = useMutation({
    mutationFn: async (days: number) => {
      const { data: configData, error: fetchError } = await supabase
        .from('site_configuration')
        .select('id')
        .limit(1)
        .single();
      
      if (fetchError) throw fetchError;
      if (!configData?.id) throw new Error('No configuration found');

      const { data, error } = await supabase
        .from('site_configuration')
        .update({ basic_info_update_interval: days })
        .eq('id', configData.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-configuration'] });
      toast({
        title: "Configuração atualizada",
        description: "O intervalo de atualização foi modificado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar configuração",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return (
    <div className="mt-10 bg-card rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">Configurações do Sistema</h2>
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Intervalo para atualização de informações básicas (dias)
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              value={updateInterval}
              onChange={(e) => setUpdateInterval(parseInt(e.target.value))}
              className="max-w-[200px]"
            />
            <Button
              onClick={() => updateIntervalMutation.mutate(updateInterval)}
            >
              Salvar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Define o período mínimo que usuários devem esperar para atualizar username e email
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
