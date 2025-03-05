
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { translateAuthError } from "@/utils/auth-errors";
import { AuthBackground, useAuthStyles } from "@/components/auth/AuthStyles";

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

  const { linkColorStyle, labelColorStyle, mutedColorStyle, buttonStyle, cardStyle } = useAuthStyles(config);

  return (
    <AuthBackground config={config}>
      <div className="w-full max-w-md rounded-2xl p-8 relative z-10" style={cardStyle}>
        <h1 className="text-2xl font-bold mb-8 text-center">Vamos começar</h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm" style={labelColorStyle}>E-mail</label>
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
            <label htmlFor="password" className="block text-sm" style={labelColorStyle}>Senha</label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
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
              <Link to="/reset-password" className="text-sm hover:underline" style={linkColorStyle}>
                Esqueceu a senha?
              </Link>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full py-6 text-center rounded-lg font-medium"
            style={buttonStyle}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        
        <p className="mt-6 text-center text-sm" style={mutedColorStyle}>
          Não possui uma conta? <Link to="/signup" className="hover:underline" style={linkColorStyle}>Criar conta</Link>
        </p>
      </div>
    </AuthBackground>
  );
};

export default Login;
