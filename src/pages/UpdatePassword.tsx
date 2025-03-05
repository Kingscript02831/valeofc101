
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useSiteConfig } from "../hooks/useSiteConfig";

const UpdatePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { data: config, isLoading: configLoading } = useSiteConfig();

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      
      toast.success("Senha atualizada com sucesso!");
      navigate("/");
    } catch (error: any) {
      toast.error(`Erro ao atualizar a senha: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  if (configLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

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

      {/* Right side with update password form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-black text-white">
        <div className="w-full max-w-md bg-[#0F0F10] rounded-2xl p-8" style={{ backgroundColor: config?.login_card_background_color || '#0F0F10' }}>
          <h1 className="text-2xl font-bold mb-8 text-center">Atualizar Senha</h1>
          
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm">Nova Senha</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black border-gray-700 text-white placeholder:text-gray-500 pr-10"
                />
                <button 
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm">Confirmar Senha</label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-black border-gray-700 text-white placeholder:text-gray-500 pr-10"
                />
              </div>
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
              {loading ? "Atualizando..." : "Atualizar Senha"}
            </Button>
          </form>
        </div>
        
        <p className="mt-8 text-sm text-gray-500">
          {config?.login_developer_text || '2025 | Desenvolvido por Vinícius Dev'}
        </p>
      </div>
    </div>
  );
};

export default UpdatePassword;
