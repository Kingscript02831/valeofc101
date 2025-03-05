
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { data: config, isLoading: configLoading } = useSiteConfig();
  const [useBackgroundImage, setUseBackgroundImage] = useState(true);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) {
        throw error;
      }
      
      setEmailSent(true);
      toast.success('Email enviado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao enviar email de redefinição de senha');
    } finally {
      setLoading(false);
    }
  };
  
  if (configLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  // Variable for the link color that matches the button color
  const linkColorStyle = { color: config?.login_button_color || '#CB5EEE' };
  
  // Background style based on user preference
  const backgroundStyle = useBackgroundImage && config?.login_background_image
    ? { 
        backgroundImage: `url(${config.login_background_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : { backgroundColor: '#000000' };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left side - Background image or color with quote */}
      <div 
        className="hidden md:flex md:w-1/2 flex-col justify-center items-center p-10 text-white relative"
        style={backgroundStyle}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="z-10 max-w-md text-center">
          <blockquote className="mb-6 italic text-lg">
            "{config?.login_quote_text || "No futuro, a tecnologia nos permitirá criar realidades alternativas tão convincentes que será difícil distinguir o que é real do que é simulado."}"
          </blockquote>
          <cite className="block text-sm font-medium">
            {config?.login_quote_author || "Jaron Lanier"}
            <span className="block mt-1 text-sm opacity-75 font-normal">
              {config?.login_quote_author_title || "Cientista da computação e especialista em realidade virtual."}
            </span>
          </cite>
        </div>
        <div className="absolute bottom-4 text-sm opacity-70 z-10">
          {config?.login_developer_text || "2025 | Desenvolvido por Vinícius Dev"}
        </div>
      </div>
      
      {/* Right side - Reset Password Form */}
      <div 
        className="w-full md:w-1/2 flex items-center justify-center p-6"
        style={{ backgroundColor: config?.login_card_background_color || '#0F0F10' }}
      >
        <div className="w-full max-w-md">
          {!emailSent ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Esqueceu sua senha?</h1>
                <p className="text-gray-400">Enviaremos um link para redefinir sua senha</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Digite seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    disabled={loading}
                    className="w-full font-medium"
                    style={{
                      backgroundColor: config?.login_button_color || '#CB5EEE',
                      color: config?.login_button_text_color || '#FFFFFF'
                    }}
                  >
                    {loading ? "Enviando..." : "Enviar link de redefinição"}
                  </Button>
                  
                  <div className="text-center">
                    <Link to="/login" className="hover:underline text-sm" style={linkColorStyle}>
                      Voltar para o Login
                    </Link>
                  </div>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Email Enviado!</h1>
              <p className="text-gray-400 mb-6">
                Verifique sua caixa de entrada para o link de redefinição de senha.
              </p>
              <Button 
                onClick={() => setEmailSent(false)}
                className="w-full font-medium"
                style={{
                  backgroundColor: config?.login_button_color || '#CB5EEE',
                  color: config?.login_button_text_color || '#FFFFFF'
                }}
              >
                Tentar novamente
              </Button>
              
              <div className="mt-4">
                <Link to="/login" className="hover:underline text-sm" style={linkColorStyle}>
                  Voltar para o Login
                </Link>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <div className="flex items-center justify-center space-x-2">
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={useBackgroundImage}
                  onChange={() => setUseBackgroundImage(!useBackgroundImage)}
                />
                <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-300">Usar Imagem de Fundo</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
