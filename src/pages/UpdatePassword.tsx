
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

  // URL de fundo padrão caso não haja configuração
  const backgroundImage = config.login_background_image || 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb';

  return (
    <div 
      className="min-h-screen flex"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full md:w-1/2 lg:w-2/5 xl:w-1/3 flex flex-col p-8 justify-center">
        <div className="space-y-6">
          <h1 
            className="text-3xl font-bold"
            style={{ color: config.login_text_color || '#FFFFFF' }}
          >
            Atualizar Senha
          </h1>

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="space-y-1.5">
              <label 
                htmlFor="password" 
                className="text-sm font-medium block"
                style={{ color: config.login_text_color || '#FFFFFF' }}
              >
                Nova Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-black/20 border-gray-600 text-white backdrop-blur-sm"
                style={{ color: config.login_text_color || '#FFFFFF' }}
              />
            </div>

            <div className="space-y-1.5">
              <label 
                htmlFor="confirmPassword" 
                className="text-sm font-medium block"
                style={{ color: config.login_text_color || '#FFFFFF' }}
              >
                Confirmar Nova Senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-black/20 border-gray-600 text-white backdrop-blur-sm"
                style={{ color: config.login_text_color || '#FFFFFF' }}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-medium rounded-lg transition duration-300"
              style={{ 
                background: config.login_button_color || 'linear-gradient(90deg, #9b87f5, #7C3AED)',
                color: config.login_button_text_color || 'white',
                border: 'none'
              }}
              disabled={loading}
            >
              {loading ? "Atualizando..." : "Atualizar Senha"}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                className="text-sm transition hover:underline"
                onClick={() => navigate("/login")}
                style={{ color: config.login_text_color || '#FFFFFF' }}
              >
                Voltar para o login
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-auto text-center">
          <p className="text-xs" style={{ color: config.login_text_color || '#FFFFFF' }}>
            {config.login_footer_text || `${new Date().getFullYear()} | Desenvolvido por Leonardo Diman`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;
