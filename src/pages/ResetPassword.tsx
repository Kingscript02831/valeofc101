
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
    <div className="flex min-h-screen bg-black">
      {/* Reset password form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-black text-white">
        <div className="w-full max-w-md bg-[#0F0F10] rounded-2xl p-8" style={{ backgroundColor: config?.login_card_background_color || '#0F0F10' }}>
          {/* Site logo or title added here */}
          <div className="mb-8">
            {config?.navbar_logo_type === 'image' && config?.navbar_logo_image ? (
              <div className="flex justify-center">
                <img 
                  src={config.navbar_logo_image} 
                  alt="Logo" 
                  className="h-24 w-24 object-cover rounded-full border-2 border-white/20"
                />
              </div>
            ) : (
              <h2 className="text-3xl font-bold text-center" style={{ color: config?.login_button_color || '#CB5EEE' }}>
                {config?.navbar_logo_text || 'Vale Notícias'}
              </h2>
            )}
          </div>
          
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
                    className="bg-black border-b-[1px] border-t-0 border-l-0 border-r-0 border-gray-700 text-white placeholder:text-gray-500 rounded-none focus:ring-0"
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
