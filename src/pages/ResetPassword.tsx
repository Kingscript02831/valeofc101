
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useSiteConfig } from "../hooks/useSiteConfig";
import AvatarLogin from "../components/AvatarLogin";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { data: config, isLoading: configLoading } = useSiteConfig();

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
      
      setSubmitted(true);
      toast.success("Enviamos um link para redefinir sua senha. Verifique seu e-mail.");
    } catch (error: any) {
      toast.error(`Erro ao solicitar redefinição de senha: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (configLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  // Variable for the link color that matches the button color
  const linkColorStyle = { color: config?.login_button_color || '#CB5EEE' };
  
  // Background gradient for the card
  const cardGradient = {
    background: `linear-gradient(135deg, ${config?.login_card_background_color || '#0F0F10'}, #171719)`,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  };

  return (
    <div className="flex min-h-screen bg-black">
      {/* Reset password form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-black text-white">
        <div className="w-full max-w-md rounded-2xl p-8" style={cardGradient}>
          {/* Site logo or title added here */}
          <div className="mb-8">
            {config?.navbar_logo_type === 'image' && config?.navbar_logo_image ? (
              <div className="flex justify-center">
                <img 
                  src={config.navbar_logo_image} 
                  alt="Logo" 
                  className="h-32 w-32 object-cover rounded-full border-2 border-white/20"
                  style={{ marginTop: '-2rem' }}
                />
              </div>
            ) : (
              <h2 className="text-4xl font-bold text-center" style={{ color: config?.login_button_color || '#CB5EEE' }}>
                {config?.navbar_logo_text || 'Vale Notícias'}
              </h2>
            )}
          </div>
          
          <h1 className="text-2xl font-bold mb-8 text-center">Recuperar Senha 🔐</h1>
          
          {submitted ? (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-500/20 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <p className="text-lg">Enviamos um link para redefinir sua senha para <strong>{email}</strong>.</p>
              <p className="text-gray-400">Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
              <Button
                className="mt-6"
                style={{ 
                  backgroundImage: `linear-gradient(to right, ${config?.login_button_color || '#CB5EEE'}, ${config?.login_button_color ? config.login_button_color + '99' : '#9b5ee6'})`,
                  color: config?.login_button_text_color || '#FFFFFF'
                }}
              >
                <Link to="/login">Voltar para o Login 🏠</Link>
              </Button>
              
              {/* Quote section with avatar */}
              <div className="mt-10 p-4 rounded-xl bg-black/30 backdrop-blur-sm border border-white/5">
                <p className="text-white/90 text-sm italic mb-2">
                  <span className="text-xl mr-1">💭</span> 
                  {config?.login_quote_text || '"No futuro, a tecnologia nos permitirá criar realidades alternativas tão convincentes que será difícil distinguir o que é real do que é simulado."'}
                </p>
                
                <AvatarLogin 
                  author={config?.login_quote_author || 'Jaron Lanier'}
                  title={config?.login_quote_author_title || 'Cientista da computação e especialista em realidade virtual.'}
                />
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm">E-mail</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite seu email cadastrado"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-black/40 border-0 text-white placeholder:text-gray-500 rounded-lg focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full py-6 text-center rounded-lg font-medium"
                  style={{ 
                    backgroundImage: `linear-gradient(to right, ${config?.login_button_color || '#CB5EEE'}, ${config?.login_button_color ? config.login_button_color + '99' : '#9b5ee6'})`,
                    color: config?.login_button_text_color || '#FFFFFF'
                  }}
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar Link de Recuperação ✉️"}
                </Button>
                
                <div className="text-center">
                  <Link to="/login" className="hover:underline text-sm" style={linkColorStyle}>
                    Voltar para o Login
                  </Link>
                </div>
              </form>
              
              {/* Quote section with avatar */}
              <div className="mt-10 p-4 rounded-xl bg-black/30 backdrop-blur-sm border border-white/5">
                <p className="text-white/90 text-sm italic mb-2">
                  <span className="text-xl mr-1">💭</span> 
                  {config?.login_quote_text || '"No futuro, a tecnologia nos permitirá criar realidades alternativas tão convincentes que será difícil distinguir o que é real do que é simulado."'}
                </p>
                
                <AvatarLogin 
                  author={config?.login_quote_author || 'Jaron Lanier'}
                  title={config?.login_quote_author_title || 'Cientista da computação e especialista em realidade virtual.'}
                />
              </div>
            </>
          )}
        </div>
        
        <p className="mt-8 text-sm text-gray-500">
          {config?.login_developer_text || '2025 | Desenvolvido por Vinícius Dev'}
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
