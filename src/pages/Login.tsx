
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { translateAuthError } from "../utils/auth-errors";
import AvatarLogin from "../components/AvatarLogin";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { data: config, isLoading: configLoading } = useSiteConfig();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        navigate("/");
      }
    };
    getSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success("Login realizado com sucesso!");
      navigate("/");
    } catch (error: any) {
      const errorMessage = translateAuthError(error.message);
      toast.error(errorMessage);
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
      {/* Login form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-black text-white">
        <div className="w-full max-w-md rounded-2xl p-8" style={cardGradient}>
          {/* Site logo or title added here with updated styling */}
          <div className="mb-10 -mt-4">
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
          
          <h1 className="text-2xl font-bold mb-8 text-center">Vamos começar ✨</h1>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm">E-mail</label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black/40 border-0 text-white placeholder:text-gray-500 rounded-lg focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm">Senha</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black/40 border-0 text-white placeholder:text-gray-500 pr-10 rounded-lg focus:ring-1 focus:ring-purple-500"
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
              <div className="text-right">
                <Link to="/reset-password" className="text-sm hover:underline" style={linkColorStyle}>
                  Esqueceu a senha? 🔑
                </Link>
              </div>
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
              {loading ? "Entrando..." : "Entrar 🚀"}
            </Button>
          </form>
          
          <p className="mt-6 text-center text-sm text-gray-400">
            Não possui uma conta? <Link to="/signup" className="hover:underline" style={linkColorStyle}>Criar conta</Link>
          </p>
          
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
        
        <p className="mt-8 text-sm text-gray-500">
          {config?.login_developer_text || '2025 | Desenvolvido por Vinícius Dev'}
        </p>
      </div>
    </div>
  );
};

export default Login;
