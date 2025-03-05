
import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { SiteConfig } from "@/hooks/useSiteConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

const SystemSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updateInterval, setUpdateInterval] = useState(30);
  const [loginLabelColor, setLoginLabelColor] = useState("#CB5EEE");
  const [loginLabelMutedColor, setLoginLabelMutedColor] = useState("rgba(255, 255, 255, 0.5)");

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
    if (config) {
      if (config.basic_info_update_interval) {
        setUpdateInterval(config.basic_info_update_interval);
      }
      if (config.login_label_color) {
        setLoginLabelColor(config.login_label_color);
      }
      if (config.login_label_muted_color) {
        setLoginLabelMutedColor(config.login_label_muted_color);
      }
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

  const updateLoginColorsMutation = useMutation({
    mutationFn: async (colors: { label: string; muted: string }) => {
      const { data: configData, error: fetchError } = await supabase
        .from('site_configuration')
        .select('id')
        .limit(1)
        .single();
      
      if (fetchError) throw fetchError;
      if (!configData?.id) throw new Error('No configuration found');

      const { data, error } = await supabase
        .from('site_configuration')
        .update({
          login_label_color: colors.label,
          login_label_muted_color: colors.muted
        })
        .eq('id', configData.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-configuration'] });
      toast({
        title: "Configuração atualizada",
        description: "As cores dos labels foram atualizadas com sucesso",
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
      
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="login">Login/Registro</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="login" className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configurações de Cores dos Textos</h3>
              
              <div className="space-y-2">
                <Label htmlFor="loginLabelColor">Cor dos Labels (Títulos dos Campos)</Label>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md border border-gray-300" style={{ backgroundColor: loginLabelColor }}></div>
                  <Input
                    id="loginLabelColor"
                    type="text"
                    value={loginLabelColor}
                    onChange={(e) => setLoginLabelColor(e.target.value)}
                    className="max-w-[200px]"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Define a cor dos labels como "E-mail", "Senha", etc.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loginLabelMutedColor">Cor dos Textos Informativos</Label>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md border border-gray-300" style={{ backgroundColor: loginLabelMutedColor }}></div>
                  <Input
                    id="loginLabelMutedColor"
                    type="text"
                    value={loginLabelMutedColor}
                    onChange={(e) => setLoginLabelMutedColor(e.target.value)}
                    className="max-w-[200px]"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Define a cor dos textos informativos (placeholders, textos de ajuda)
                </p>
              </div>

              <Button
                onClick={() => updateLoginColorsMutation.mutate({
                  label: loginLabelColor,
                  muted: loginLabelMutedColor
                })}
                className="mt-2"
              >
                Salvar Configurações de Cores
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
