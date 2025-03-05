
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: config, isLoading: configLoading } = useSiteConfig();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha",
      });

      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
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
            Recuperar Senha
          </h1>
          <p style={{ color: config.login_text_color }}>
            Digite seu email para receber instruções de recuperação
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6 mt-6">
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

          <Button
            type="submit"
            className="w-full h-12 font-medium rounded-lg transition duration-300 shadow-md text-white"
            style={{ 
              background: config.primary_color,
              borderColor: config.primary_color
            }}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar email de recuperação"}
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

export default ResetPassword;
