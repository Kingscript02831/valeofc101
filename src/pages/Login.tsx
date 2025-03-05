
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { translateAuthError } from "../utils/auth-errors";

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

  const handleLoginWithProvider = async (provider: 'facebook' | 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(`Erro ao fazer login com ${provider}: ${error.message}`);
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
              alt="Login"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800/40 to-purple-900/40"></div>
          </div>
        ) : (
          <div className="absolute inset-0 z-0">
            <img
              src="/lovable-uploads/587a2669-ca00-4bd7-a223-008d7d9ace86.png"
              alt="Login"
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

      {/* Right side with login form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-black text-white">
        <div className="w-full max-w-md bg-[#0F0F10] rounded-2xl p-8" style={{ backgroundColor: config?.login_card_background_color || '#0F0F10' }}>
          <h1 className="text-2xl font-bold mb-8 text-center">Vamos começar</h1>
          
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
                className="bg-black border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm">Senha</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Criar sua senha"
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
              <div className="text-right">
                <Link to="/reset-password" className="text-sm text-purple-400 hover:underline">
                  Esqueceu a senha?
                </Link>
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
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          
          <div className="mt-6 space-y-4">
            <Button 
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 py-6 border-gray-700 text-white hover:bg-gray-800"
              onClick={() => handleLoginWithProvider('facebook')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#4267B2"><path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z"></path></svg>
              Entrar com o Facebook
            </Button>
            
            <Button 
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 py-6 border-gray-700 text-white hover:bg-gray-800"
              onClick={() => handleLoginWithProvider('google')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#DB4437"><path d="M6 12C6 15.3137 8.68629 18 12 18C14.6124 18 16.8349 16.3304 17.6586 14H12V10H21.8047V14H21.8C20.8734 18.5645 16.8379 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C15.445 2 18.4831 3.742 20.2815 6.39318L17.0039 8.68815C15.9296 7.06812 14.0895 6 12 6C8.68629 6 6 8.68629 6 12Z"></path></svg>
              Entrar com o Google
            </Button>
          </div>
          
          <p className="mt-6 text-center text-sm text-gray-400">
            Não possui uma conta? <Link to="/signup" className="text-purple-400 hover:underline">Criar conta</Link>
          </p>
        </div>
        
        <p className="mt-8 text-sm text-gray-500">
          {config?.login_developer_text || '2025 | Desenvolvido por Vinícius Dev'}
        </p>
      </div>
    </div>
  );
};

export default Login;
