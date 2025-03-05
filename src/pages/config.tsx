import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "../types/supabase";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { updateMetaTags } from "../utils/updateMetaTags";
import Navbar2 from "../components/Navbar2";
import SubNav2 from "../components/SubNav2";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

const Admin = () => {
  const [config, setConfig] = useState<SiteConfig>({
    id: "",
    theme_name: "light",
    primary_color: "#1A1F2C",
    secondary_color: "#D6BCFA",
    background_color: "#FFFFFF",
    text_color: "#1A1F2C",
    navbar_color: "#D6BCFA",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    navbar_logo_type: "text",
    navbar_logo_text: "VALEOFC",
    navbar_logo_image: null,
    navbar_social_facebook: null,
    navbar_social_instagram: null,
    language: "pt-BR",
    enable_dark_mode: false,
    enable_weather: false,
    header_alerts: [],
    navigation_links: [],
    font_size: "medium",
    footer_primary_color: "#1A1F2C",
    footer_secondary_color: "#D6BCFA",
    footer_text_color: "#FFFFFF",
    footer_contact_email: null,
    footer_contact_phone: null,
    footer_address: null,
    footer_address_cep: null,
    footer_social_facebook: null,
    footer_social_instagram: null,
    footer_schedule: null,
    footer_copyright_text: "© 2025 VALEOFC. Todos os direitos reservados.",
    meta_title: 'vale-news-hub',
    meta_description: 'Lovable Generated Project',
    meta_author: 'Lovable',
    meta_image: '/og-image.png',
    button_primary_color: "#9b87f5",
    button_secondary_color: "#7E69AB",
    bottom_nav_primary_color: "#1A1F2C",
    bottom_nav_secondary_color: "#D6BCFA",
    bottom_nav_text_color: "#FFFFFF",
    bottom_nav_icon_color: "#FFFFFF",
    high_contrast: false,
    location_lat: null,
    location_lng: null,
    location_city: null,
    location_state: null,
    location_country: null,
    weather_api_key: null,
    version: 1,
    login_text_color: "#1A1F2C",
    signup_text_color: "#1A1F2C",
    pwa_name: "ValeOfc",
    pwa_short_name: "ValeOfc",
    pwa_description: "Seu app de notícias local",
    pwa_theme_color: "#000000",
    pwa_background_color: "#000000",
    pwa_install_message: "Instale nosso aplicativo para uma experiência melhor!",
    pwa_app_icon: null,
    admin_accent_color: "#9b87f5",
    admin_background_color: "#F8F9FA",
    admin_card_color: "#FFFFFF",
    admin_header_color: "#D6BCFA",
    admin_hover_color: "#E2E8F0",
    admin_sidebar_color: "#1A1F2C",
    admin_text_color: "#FFFFFF",
    favorite_heart_color: "#ea384c",
    buy_button_color: "#9b87f5",
    buy_button_text: "Comprar agora"
  });

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    const { data, error } = await supabase
      .from("site_configuration")
      .select("*")
      .single();

    if (error) {
      toast.error("Erro ao carregar configurações");
      return;
    }

    if (data) {
      setConfig(data);
    }
  };

  const handleConfigUpdate = async () => {
    try {
      const { error } = await supabase
        .from("site_configuration")
        .update(config)
        .eq("id", config.id);

      if (error) throw error;

      updateMetaTags(
        config.meta_title,
        config.meta_description,
        config.meta_author,
        config.meta_image
      );

      toast.success("Configurações atualizadas com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao atualizar configurações");
    }
  };

  const handleChange = (key: string, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  useEffect(() => {
    if (config) {
      updateMetaTags(
        config.meta_title,
        config.meta_description,
        config.meta_author,
        config.meta_image
      );
    }
  }, [config]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />
      <SubNav2 />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Painel De Configurações</h1>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="config">Navbar</TabsTrigger>
            <TabsTrigger value="footer">Rodapé</TabsTrigger>
            <TabsTrigger value="bottom-nav">Barra</TabsTrigger>
            <TabsTrigger value="login">Login/Registro</TabsTrigger>
            <TabsTrigger value="pwa">PWA</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Cores dos Botões</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="button_primary_color">Cor Primária do Botão</Label>
                  <div className="flex gap-2">
                    <Input
                      id="button_primary_color"
                      type="color"
                      value={config.button_primary_color}
                      onChange={(e) => setConfig({ ...config, button_primary_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.button_primary_color}
                      onChange={(e) => setConfig({ ...config, button_primary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="button_secondary_color">Cor Secundária do Botão</Label>
                  <div className="flex gap-2">
                    <Input
                      id="button_secondary_color"
                      type="color"
                      value={config.button_secondary_color}
                      onChange={(e) => setConfig({ ...config, button_secondary_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.button_secondary_color}
                      onChange={(e) => setConfig({ ...config, button_secondary_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Logo da Navbar</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="navbar_logo_type">Tipo de Logo</Label>
                  <div className="flex gap-4">
                    <Button
                      variant={config.navbar_logo_type === "text" ? "default" : "outline"}
                      onClick={() => setConfig({ ...config, navbar_logo_type: "text" })}
                    >
                      Texto
                    </Button>
                    <Button
                      variant={config.navbar_logo_type === "image" ? "default" : "outline"}
                      onClick={() => setConfig({ ...config, navbar_logo_type: "image" })}
                    >
                      Imagem
                    </Button>
                  </div>
                </div>

                {config.navbar_logo_type === "text" ? (
                  <div>
                    <Label htmlFor="logo_text">Texto da Logo</Label>
                    <Input
                      id="logo_text"
                      value={config.navbar_logo_text || ""}
                      onChange={(e) => setConfig({ ...config, navbar_logo_text: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="logo_image">Link da Imagem da Logo</Label>
                    <Input
                      id="logo_image"
                      value={config.navbar_logo_image || ""}
                      onChange={(e) => setConfig({ ...config, navbar_logo_image: e.target.value })}
                      placeholder="Cole o link compartilhado do Dropbox aqui"
                    />
                    <p className="text-sm text-gray-500">
                      Para usar uma imagem do Dropbox:
                      1. Faça upload da imagem no Dropbox
                      2. Clique em "Compartilhar"
                      3. Copie o link compartilhado
                      4. Substitua "?dl=0" por "?raw=1" no final do link
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Redes Sociais da Navbar</h2>
              <div>
                <Label htmlFor="navbar_social_facebook">Link do Facebook</Label>
                <Input
                  id="navbar_social_facebook"
                  type="url"
                  value={config.navbar_social_facebook || ""}
                  onChange={(e) => setConfig({ ...config, navbar_social_facebook: e.target.value })}
                  placeholder="https://facebook.com/sua-pagina"
                />
              </div>
              <div>
                <Label htmlFor="navbar_social_instagram">Link do Instagram</Label>
                <Input
                  id="navbar_social_instagram"
                  type="url"
                  value={config.navbar_social_instagram || ""}
                  onChange={(e) => setConfig({ ...config, navbar_social_instagram: e.target.value })}
                  placeholder="https://instagram.com/seu-perfil"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="primary_color">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={config.primary_color}
                    onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                  />
                  <Input
                    type="text"
                    value={config.primary_color}
                    onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondary_color">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={config.secondary_color}
                    onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })}
                  />
                  <Input
                    type="text"
                    value={config.secondary_color}
                    onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="background_color">Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    id="background_color"
                    type="color"
                    value={config.background_color}
                    onChange={(e) => setConfig({ ...config, background_color: e.target.value })}
                  />
                  <Input
                    type="text"
                    value={config.background_color}
                    onChange={(e) => setConfig({ ...config, background_color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="text_color">Cor do Texto</Label>
                <div className="flex gap-2">
                  <Input
                    id="text_color"
                    type="color"
                    value={config.text_color}
                    onChange={(e) => setConfig({ ...config, text_color: e.target.value })}
                  />
                  <Input
                    type="text"
                    value={config.text_color}
                    onChange={(e) => setConfig({ ...config, text_color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="navbar_color">Cor da Navbar</Label>
                <div className="flex gap-2">
                  <Input
                    id="navbar_color"
                    type="color"
                    value={config.navbar_color}
                    onChange={(e) => setConfig({ ...config, navbar_color: e.target.value })}
                  />
                  <Input
                    type="text"
                    value={config.navbar_color}
                    onChange={(e) => setConfig({ ...config, navbar_color: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleConfigUpdate}>
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="footer" className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Cores do Rodapé</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="footer_primary_color">Cor Primária do Rodapé</Label>
                  <div className="flex gap-2">
                    <Input
                      id="footer_primary_color"
                      type="color"
                      value={config.footer_primary_color}
                      onChange={(e) => setConfig({ ...config, footer_primary_color: e.target.value })}
                    />
                    <Input
                      type="text"
                      value={config.footer_primary_color}
                      onChange={(e) => setConfig({ ...config, footer_primary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="footer_secondary_color">Cor Secundária do Rodapé</Label>
                  <div className="flex gap-2">
                    <Input
                      id="footer_secondary_color"
                      type="color"
                      value={config.footer_secondary_color}
                      onChange={(e) => setConfig({ ...config, footer_secondary_color: e.target.value })}
                    />
                    <Input
                      type="text"
                      value={config.footer_secondary_color}
                      onChange={(e) => setConfig({ ...config, footer_secondary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="footer_text_color">Cor do Texto do Rodapé</Label>
                  <div className="flex gap-2">
                    <Input
                      id="footer_text_color"
                      type="color"
                      value={config.footer_text_color}
                      onChange={(e) => setConfig({ ...config, footer_text_color: e.target.value })}
                    />
                    <Input
                      type="text"
                      value={config.footer_text_color}
                      onChange={(e) => setConfig({ ...config, footer_text_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Informações de Contato</h2>
              
              <div>
                <Label htmlFor="footer_contact_email">Email de Contato</Label>
                <Input
                  id="footer_contact_email"
                  type="email"
                  value={config.footer_contact_email || ""}
                  onChange={(e) => setConfig({ ...config, footer_contact_email: e.target.value })}
                  placeholder="contato@exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="footer_contact_phone">Telefone de Contato</Label>
                <Input
                  id="footer_contact_phone"
                  type="tel"
                  value={config.footer_contact_phone || ""}
                  onChange={(e) => setConfig({ ...config, footer_contact_phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <Label htmlFor="footer_address">Endereço</Label>
                <Input
                  id="footer_address"
                  value={config.footer_address || ""}
                  onChange={(e) => setConfig({ ...config, footer_address: e.target.value })}
                  placeholder="Rua Exemplo, 123 - Bairro"
                />
              </div>

              <div>
                <Label htmlFor="footer_address_cep">CEP</Label>
                <Input
                  id="footer_address_cep"
                  value={config.footer_address_cep || ""}
                  onChange={(e) => setConfig({ ...config, footer_address_cep: e.target.value })}
                  placeholder="00000-000"
                />
              </div>

              <div>
                <Label htmlFor="footer_schedule">Horário de Funcionamento</Label>
                <Input
                  id="footer_schedule"
                  value={config.footer_schedule || ""}
                  onChange={(e) => setConfig({ ...config, footer_schedule: e.target.value })}
                  placeholder="Segunda a Sexta, 9h às 18h"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Redes Sociais</h2>
              
              <div>
                <Label htmlFor="nav_social_facebook">Link do Facebook</Label>
                <Input
                  id="nav_social_facebook"
                  type="url"
                  value={config.footer_social_facebook || ""}
                  onChange={(e) => setConfig({ ...config, footer_social_facebook: e.target.value })}
                  placeholder="https://facebook.com/sua-pagina"
                />
              </div>

              <div>
                <Label htmlFor="nav_social_instagram">Link do Instagram</Label>
                <Input
                  id="nav_social_instagram"
                  type="url"
                  value={config.footer_social_instagram || ""}
                  onChange={(e) => setConfig({ ...config, footer_social_instagram: e.target.value })}
                  placeholder="https://instagram.com/seu-perfil"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Texto de Copyright</h2>
              <div>
                <Label htmlFor="footer_copyright_text">Texto de Copyright</Label>
                <Input
                  id="footer_copyright_text"
                  value={config.footer_copyright_text || ""}
                  onChange={(e) =>
                    setConfig({ ...config, footer_copyright_text: e.target.value })
                  }
                  placeholder="© 2025 VALEOFC. Todos os direitos reservados."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleConfigUpdate}>
                Salvar Configurações 
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="bottom-nav" className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Configurações da Barra Inferior</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="bottom_nav_primary_color">Cor Primária do Fundo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bottom_nav_primary_color"
                      type="color"
                      value={config.bottom_nav_primary_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_primary_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.bottom_nav_primary_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_primary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bottom_nav_secondary_color">Cor Secundária do Fundo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bottom_nav_secondary_color"
                      type="color"
                      value={config.bottom_nav_secondary_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_secondary_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.bottom_nav_secondary_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_secondary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bottom_nav_text_color">Cor do Texto</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bottom_nav_text_color"
                      type="color"
                      value={config.bottom_nav_text_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_text_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.bottom_nav_text_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_text_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bottom_nav_icon_color">Cor dos Ícones</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bottom_nav_icon_color"
                      type="color"
                      value={config.bottom_nav_icon_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_icon_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.bottom_nav_icon_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_icon_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleConfigUpdate}>
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="login" className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Aparência do Login/Registro</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="login_background_image">Imagem de Fundo</Label>
                  <Input
                    id="login_background_image"
                    type="url"
                    value={config.login_background_image || ""}
                    onChange={(e) => setConfig({ ...config, login_background_image: e.target.value })}
                    placeholder="URL da imagem de fundo"
                    className="mb-2"
                  />
                  <p className="text-sm text-gray-500">
                    {config.login_background_image && (
                      <img 
                        src={config.login_background_image} 
                        alt="Login background preview" 
                        className="mt-2 h-28 object-cover rounded-lg" 
                      />
                    )}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="login_card_background_color">Cor de Fundo do Card</Label>
                  <div className="flex gap-2">
                    <Input
                      id="login_card_background_color"
                      type="color"
                      value={config.login_card_background_color || "#0F0F10"}
                      onChange={(e) => setConfig({ ...config, login_card_background_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.login_card_background_color || "#0F0F10"}
                      onChange={(e) => setConfig({ ...config, login_card_background_color: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="login_button_color">Cor do Botão</Label>
                  <div className="flex gap-2">
                    <Input
                      id="login_button_color"
                      type="color"
                      value={config.login_button_color || "#CB5EEE"}
                      onChange={(e) => setConfig({ ...config, login_button_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.login_button_color || "#CB5EEE"}
                      onChange={(e) => setConfig({ ...config, login_button_color: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="login_button_text_color">Cor do Texto do Botão</Label>
                  <div className="flex gap-2">
                    <Input
                      id="login_button_text_color"
                      type="color"
                      value={config.login_button_text_color || "#FFFFFF"}
                      onChange={(e) => setConfig({ ...config, login_button_text_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.login_button_text_color || "#FFFFFF"}
                      onChange={(e) => setConfig({ ...config, login_button_text_color: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="login_label_color">Cor dos Rótulos</Label>
                  <div className="flex gap-2">
                    <Input
                      id="login_label_color"
                      type="color"
                      value={config.login_label_color || "#CB5EEE"}
                      onChange={(e) => setConfig({ ...config, login_label_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.login_label_color || "#CB5EEE"}
                      onChange={(e) => setConfig({ ...config, login_label_color: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="login_label_muted_color">Cor dos Textos Secundários</Label>
                  <div className="flex gap-2">
                    <Input
                      id="login_label_muted_color"
                      type="text"
                      value={config.login_label_muted_color || "rgba(255, 255, 255, 0.6)"}
                      onChange={(e) => setConfig({ ...config, login_label_muted_color: e.target.value })}
                    />
                    <span className="w-8 h-8 rounded" style={{ backgroundColor: config.login_label_muted_color || "rgba(255, 255, 255, 0.6)" }}></span>
                  </div>
                  <p className="text-xs text-gray-500">Use formato rgba(255,255,255,0.6) para cores semi-transparentes</p>
                </div>
                
                <div>
                  <Label htmlFor="login_developer_text">Texto do Desenvolvedor</Label>
                  <Input
                    id="login_developer_text"
                    type="text"
                    value={config.login_developer_text || "2025 | Desenvolvido por Vinícius Dev"}
                    onChange={(e) => setConfig({ ...config, login_developer_text: e.target.value })}
                    placeholder="Texto que aparece no rodapé da página de login"
                  />
                </div>
              </div>
              
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-medium">Citação</h3>
                <div>
                  <Label htmlFor="login_quote_text">Texto da Citação</Label>
                  <Textarea
                    id="login_quote_text"
                    value={config.login_quote_text || "No futuro, a tecnologia nos permitirá criar realidades alternativas tão convincentes que será difícil distinguir o que é real do que é simulado."}
                    onChange={(e) => setConfig({ ...config, login_quote_text: e.target.value })}
                    placeholder="Texto da citação que aparece na imagem de fundo"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="login_quote_author">Autor da Citação</Label>
                  <Input
                    id="login_quote_author"
                    type="text"
                    value={config.login_quote_author || "Jaron Lanier"}
                    onChange={(e) => setConfig({ ...config, login_quote_author: e.target.value })}
                    placeholder="Nome do autor da citação"
                  />
                </div>
                
                <div>
                  <Label htmlFor="login_quote_author_title">Descrição do Autor</Label>
                  <Input
                    id="login_quote_author_title"
                    type="text"
                    value={config.login_quote_author_title || "Cientista da computa��ão e especialista em realidade virtual."}
                    onChange={(e) => setConfig({ ...config, login_quote_author_title: e.target.value })}
                    placeholder="Descrição ou título do autor"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleConfigUpdate}>
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="pwa" className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Configurações do PWA</h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="pwa_install_message">Mensagem de Instalação</Label>
                  <Input
                    id="pwa_install_message"
                    value={config.pwa_install_message || ""}
                    onChange={(e) => setConfig({ ...config, pwa_install_message: e.target.value })}
                    placeholder="Mensagem que será exibida no prompt de instalação"
                  />
                </div>

                <div>
                  <Label htmlFor="pwa_app_icon">Ícone do Aplicativo</Label>
                  <div className="flex gap-4 items-center">
                    {config.pwa_app_icon && (
                      <img 
                        src={config.pwa_app_icon} 
                        alt="App Icon" 
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    )}
                    <Input
                      id="pwa_app_icon"
                      value={config.pwa_app_icon || ""}
                      onChange={(e) => setConfig({ ...config, pwa_app_icon: e.target.value })}
                      placeholder="Link para o ícone (512x512px, formato PNG)"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Recomendado: Imagem PNG 512x512px. Para usar uma imagem do Dropbox:
                    1. Faça upload da imagem
                    2. Clique em "Compartilhar"
                    3. Copie o link
                    4. Substitua "?dl=0" por "?raw=1" no final do link
                  </p>
                </div>

                <div>
                  <Label htmlFor="pwa_name">Nome do Aplicativo</Label>
                  <Input
                    id="pwa_name"
                    value={config.pwa_name || ""}
                    onChange={(e) => setConfig({ ...config, pwa_name: e.target.value })}
                    placeholder="Nome completo do aplicativo"
                  />
                </div>

                <div>
                  <Label htmlFor="pwa_short_name">Nome Curto</Label>
                  <Input
                    id="pwa_short_name"
                    value={config.pwa_short_name || ""}
                    onChange={(e) => setConfig({ ...config, pwa_short_name: e.target.value })}
                    placeholder="Nome curto (para ícone)"
                  />
                </div>

                <div>
                  <Label htmlFor="pwa_description">Descrição</Label>
                  <Textarea
                    id="pwa_description"
                    value={config.pwa_description || ""}
                    onChange={(e) => setConfig({ ...config, pwa_description: e.target.value })}
                    placeholder="Descrição do aplicativo"
                  />
                </div>

                <div>
                  <Label htmlFor="pwa_theme_color">Cor do Tema</Label>
                  <div className="flex gap-2">
                    <Input
                      id="pwa_theme_color"
                      type="color"
                      value={config.pwa_theme_color || "#ffffff"}
                      onChange={(e) => setConfig({ ...config, pwa_theme_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.pwa_theme_color || "#ffffff"}
                      onChange={(e) => setConfig({ ...config, pwa_theme_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="pwa_background_color">Cor de Fundo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="pwa_background_color"
                      type="color"
                      value={config.pwa_background_color || "#ffffff"}
                      onChange={(e) => setConfig({ ...config, pwa_background_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.pwa_background_color || "#ffffff"}
                      onChange={(e) => setConfig({ ...config, pwa_background_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleConfigUpdate}>
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="products" className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Configurações de Produtos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="favorite_heart_color">Cor do Coração (Favoritos)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="favorite_heart_color"
                      type="color"
                      value={config.favorite_heart_color || "#FF0000"}
                      onChange={(e) => handleChange("favorite_heart_color", e.target.value)}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.favorite_heart_color || "#FF0000"}
                      onChange={(e) => handleChange("favorite_heart_color", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="buy_button_color">Cor do Botão "Comprar Agora"</Label>
                  <div className="flex gap-2">
                    <Input
                      id="buy_button_color"
                      type="color"
                      value={config.buy_button_color || "#000000"}
                      onChange={(e) => handleChange("buy_button_color", e.target.value)}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.buy_button_color || "#000000"}
                      onChange={(e) => handleChange("buy_button_color", e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="buy_button_text">Texto do Botão "Comprar Agora"</Label>
                  <Input
                    id="buy_button_text"
                    value={config.buy_button_text || "Comprar agora"}
                    onChange={(e) => handleChange("buy_button_text", e.target.value)}
                    placeholder="Ex: Comprar agora"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="whatsapp_message">Mensagem do WhatsApp</Label>
                  <Textarea
                    id="whatsapp_message"
                    value={config.whatsapp_message || 'Olá! Vi seu anúncio "{title}" por R$ {price} no Vale OFC e gostaria de mais informações.'}
                    onChange={(e) => handleChange("whatsapp_message", e.target.value)}
                    placeholder="Mensagem que será enviada no WhatsApp"
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Você pode usar:
                    <br />
                    {'{title}'} - para incluir o título do produto
                    <br />
                    {'{price}'} - para incluir o preço do produto
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleConfigUpdate}>
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

<style jsx global>{`
  .tabs-content {
    transition: all 0.3s ease-in-out;
  }
  
  [data-state='inactive'] {
    display: none;
    opacity: 0;
    transform: translateX(-10px);
  }
  
  [data-state='active'] {
    display: block;
    opacity: 1;
    transform: translateX(0);
    animation: slideIn 0.3s ease-in-out;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`}</style>
