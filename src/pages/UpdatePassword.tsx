
import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { AuthLayout, AuthLabel, AuthLink, AuthText, AuthButton, AuthInput } from "../components/AuthLayout";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { data: config } = useSiteConfig();

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      toast.success("Senha atualizada com sucesso!");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar senha");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Definir Nova Senha">
      <form onSubmit={handleUpdatePassword} className="space-y-6">
        <div>
          <AuthLabel>Nova Senha</AuthLabel>
          <div className="mt-1 relative">
            <AuthInput
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha de 6 ou mais caracteres"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div>
          <AuthLabel>Confirmar Nova Senha</AuthLabel>
          <div className="mt-1 relative">
            <AuthInput
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div>
          <AuthButton type="submit">
            {isLoading ? "Atualizando..." : "Atualizar Senha"}
          </AuthButton>
        </div>

        <div className="text-center">
          <AuthLink to="/login">
            Voltar para o login
          </AuthLink>
        </div>
      </form>
    </AuthLayout>
  );
}
