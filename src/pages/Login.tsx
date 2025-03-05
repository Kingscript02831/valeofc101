
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../components/ui/use-toast";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { getAuthErrorMessage } from "../utils/auth-errors";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: config, isLoading: configLoading } = useSiteConfig();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      navigate("/perfil");
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: getAuthErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (configLoading || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{ 
        background: `linear-gradient(to right, ${config.navbar_color}, ${config.primary_color})`
      }}
    >
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-xl border border-white/10">
        <div className="text-center space-y-3">
          <h1 
            className="text-3xl font-bold"
            style={{ color: config.login_text_color }}
          >
            Conecte-se
          </h1>
          <p style={{ color: config.login_text_color }}>
            Entre com suas credenciais para acessar
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 mt-6">
          <div>
            <label 
              htmlFor="email" 
              className="text-sm font-medium block mb-1"
              style={{ color: config.login_text_color }}
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/50 border-gray-200"
              style={{ color: config.login_text_color }}
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="text-sm font-medium block mb-1"
              style={{ color: config.login_text_color }}
            >
              Senha
            </label>
            <Input
              id="password"
              type="password"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/50 border-gray-200"
              style={{ color: config.login_text_color }}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 font-medium rounded-lg transition duration-300 shadow-md text-white"
            style={{ 
              background: config.primary_color,
              borderColor: config.primary_color
            }}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <Button
            type="button"
            variant="link"
            onClick={() => navigate("/reset-password")}
            className="w-full mt-2 font-medium"
            style={{ color: config.login_text_color }}
          >
            Esqueceu sua senha?
          </Button>

          <p className="text-center text-sm" style={{ color: config.login_text_color }}>
            Não possui uma conta?{" "}
            <Button
              variant="link"
              className="p-0 transition"
              onClick={() => navigate("/signup")}
              style={{ color: config.primary_color }}
            >
              Criar conta
            </Button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
