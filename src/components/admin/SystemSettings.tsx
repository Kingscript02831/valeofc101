
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
  
  // Novas configurações para o login
  const [loginBackgroundImage, setLoginBackgroundImage] = useState("");
  const [loginButtonColor, setLoginButtonColor] = useState("#9b87f5");
  const [loginButtonTextColor, setLoginButtonTextColor] = useState("#FFFFFF");
  const [loginFooterText, setLoginFooterText] = useState("");

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
      
      // Inicializar novas configurações
      if (config.login_background_image) {
        setLoginBackgroundImage(config.login_background_image);
      }
      
      if (config.login_button_color) {
        setLoginButtonColor(config.login_button_color);
      }
      
      if (config.login_button_text_color) {
        setLoginButtonTextColor(config.login_button_text_color);
      }
      
      if (config.login_footer_text) {
        setLoginFooterText(config.login_footer_text);
      } else {
        setLoginFooterText(`${new Date().getFullYear()} | Desenvolvido por Leonardo Diman`);
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

  const updateLoginSettingsMutation = useMutation({
    mutationFn: async () => {
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
          login_background_image: loginBackgroundImage,
          login_button_color: loginButtonColor,
          login_button_text_color: loginButtonTextColor,
          login_footer_text: loginFooterText,
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
        description: "As configurações de login foram atualizadas com sucesso",
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
      
      <Tabs defaultValue="general" className="w-full">
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
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="login-bg">URL da imagem de fundo</Label>
              <Input
                id="login-bg"
                value={loginBackgroundImage}
                onChange={(e) => setLoginBackgroundImage(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <p className="text-xs text-muted-foreground">
                URL da imagem de fundo para a página de login
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="button-color">Cor do botão</Label>
                <div className="flex gap-2">
                  <Input
                    id="button-color"
                    type="color"
                    value={loginButtonColor}
                    onChange={(e) => setLoginButtonColor(e.target.value)}
                    className="w-12 p-1 h-10"
                  />
                  <Input 
                    value={loginButtonColor}
                    onChange={(e) => setLoginButtonColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="button-text-color">Cor do texto do botão</Label>
                <div className="flex gap-2">
                  <Input
                    id="button-text-color"
                    type="color"
                    value={loginButtonTextColor}
                    onChange={(e) => setLoginButtonTextColor(e.target.value)}
                    className="w-12 p-1 h-10"
                  />
                  <Input 
                    value={loginButtonTextColor}
                    onChange={(e) => setLoginButtonTextColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="footer-text">Texto do rodapé</Label>
              <Input
                id="footer-text"
                value={loginFooterText}
                onChange={(e) => setLoginFooterText(e.target.value)}
                placeholder="2025 | Desenvolvido por Vinícius Dev"
              />
              <p className="text-xs text-muted-foreground">
                Texto que aparece no rodapé da página de login
              </p>
            </div>
            
            <Button
              onClick={() => updateLoginSettingsMutation.mutate()}
              className="mt-4 w-full md:w-auto"
            >
              Salvar configurações de login
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
