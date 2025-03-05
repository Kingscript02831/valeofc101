
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { getAuthErrorMessage } from "@/utils/auth-errors";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { data: config, isLoading: configLoading } = useSiteConfig();
  const [useBackgroundImage, setUseBackgroundImage] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(getAuthErrorMessage(error.message));
      } else {
        toast.success('Login efetuado com sucesso!');
        navigate('/');
      }
    } catch (error: any) {
      toast.error('Erro ao efetuar login');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
      
      {/* Right side - Login Form */}
      <div 
        className="w-full md:w-1/2 flex items-center justify-center p-6"
        style={{ backgroundColor: config?.login_card_background_color || '#0F0F10' }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta</h1>
            <p className="text-gray-400">Faça login para continuar</p>
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
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password" className="text-white">Senha</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? "🔒" : "👁️"}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <Link to="/reset-password" className="text-sm hover:underline" style={linkColorStyle}>
                  Esqueceu a senha?
                </Link>
              </div>
              
              <div>
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full font-medium"
                  style={{
                    backgroundColor: config?.login_button_color || '#CB5EEE',
                    color: config?.login_button_text_color || '#FFFFFF'
                  }}
                >
                  {loading ? "Carregando..." : "Entrar"}
                </Button>
              </div>
            </div>
          </form>
          
          <p className="mt-6 text-center text-sm text-gray-400">
            Não possui uma conta? <Link to="/signup" className="hover:underline" style={linkColorStyle}>Criar conta</Link>
          </p>
          
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

export default Login;
