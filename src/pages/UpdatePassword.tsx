
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const UpdatePassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: config, isLoading: configLoading } = useSiteConfig();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso",
      });

      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (configLoading || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
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
            Atualizar Senha
          </h1>
          <p style={{ color: config.login_text_color }}>
            Digite sua nova senha
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6 mt-6">
          <div>
            <label 
              htmlFor="password" 
              className="text-sm font-medium block mb-1"
              style={{ color: config.login_text_color }}
            >
              Nova Senha
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

          <div>
            <label 
              htmlFor="confirmPassword" 
              className="text-sm font-medium block mb-1"
              style={{ color: config.login_text_color }}
            >
              Confirmar Nova Senha
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="******"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Atualizando..." : "Atualizar Senha"}
          </Button>

          <p className="text-center text-sm" style={{ color: config.login_text_color }}>
            Lembrou sua senha?{" "}
            <Button
              variant="link"
              className="p-0 transition"
              onClick={() => navigate("/login")}
              style={{ color: config.primary_color }}
            >
              Fazer login
            </Button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
