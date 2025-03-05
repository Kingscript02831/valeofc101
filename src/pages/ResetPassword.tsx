
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useSiteConfig } from "../hooks/useSiteConfig";

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

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left side with image and quote */}
      <div className="relative flex-1 hidden md:flex flex-col justify-between bg-gradient-to-r from-purple-800 to-purple-900 overflow-hidden">
        {config?.login_background_image ? (
          <div className="absolute inset-0 z-0">
            <img
              src={config.login_background_image}
              alt="Reset Password"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800/40 to-purple-900/40"></div>
          </div>
        ) : (
          <div className="absolute inset-0 z-0">
            <img
              src="/lovable-uploads/587a2669-ca00-4bd7-a223-008d7d9ace86.png"
              alt="Reset Password"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800/40 to-purple-900/40"></div>
          </div>
        )}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <div></div>
          <div className="bg-black/30 p-6 rounded-2xl backdrop-blur-sm">
            <p className="text-white text-lg font-medium mb-4">{config?.login_quote_text || '"No futuro, a tecnologia nos permitirá criar realidades alternativas tão convincentes que será difícil distinguir o que é real do que é simulado."'}</p>
            <p className="text-white font-bold">{config?.login_quote_author || 'Jaron Lanier'}</p>
            <p className="text-white/70 text-sm">{config?.login_quote_author_title || 'Cientista da computação e especialista em realidade virtual.'}</p>
          </div>
        </div>
      </div>

      {/* Right side with reset password form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-black text-white">
        <div className="w-full max-w-md bg-[#0F0F10] rounded-2xl p-8" style={{ backgroundColor: config?.login_card_background_color || '#0F0F10' }}>
          {/* Site logo or title added here */}
          {config?.navbar_logo_type === 'image' && config?.navbar_logo_image ? (
            <div className="flex justify-center mb-6">
              <img 
                src={config.navbar_logo_image} 
                alt="Logo" 
                className="h-12 w-auto object-contain"
              />
            </div>
          ) : (
            <h2 className="text-xl font-bold text-center mb-6" style={{ color: config?.login_button_color || '#CB5EEE' }}>
              {config?.navbar_logo_text || 'Vale Notícias'}
            </h2>
          )}
          
          <h1 className="text-2xl font-bold mb-8 text-center">Recuperar Senha</h1>
          
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
                  backgroundColor: config?.login_button_color || '#CB5EEE', 
                  color: config?.login_button_text_color || '#FFFFFF'
                }}
              >
                <Link to="/login">Voltar para o Login</Link>
              </Button>
            </div>
          ) : (
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
                  className="bg-black border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full py-6 text-center rounded-lg font-medium"
                style={{ 
                  backgroundColor: config?.login_button_color || '#CB5EEE', 
                  color: config?.login_button_text_color || '#FFFFFF'
                }}
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar Link de Recuperação"}
              </Button>
              
              <div className="text-center">
                <Link to="/login" className="hover:underline text-sm" style={linkColorStyle}>
                  Voltar para o Login
                </Link>
              </div>
            </form>
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
