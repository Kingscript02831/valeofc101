
import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { getAuthErrorMessage } from "../utils/auth-errors";
import { Eye, EyeOff } from "lucide-react";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { AuthLayout, AuthLabel, AuthLink, AuthText, AuthButton, AuthInput } from "../components/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { data: config } = useSiteConfig();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Login realizado com sucesso!");
      navigate("/");
    } catch (error: any) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Vamos começar">
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <AuthLabel>E-mail</AuthLabel>
          <div className="mt-1">
            <AuthInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu melhor e-mail"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center">
            <AuthLabel>Senha</AuthLabel>
          </div>
          <div className="mt-1 relative">
            <AuthInput
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
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
          <div className="mt-2 text-right">
            <AuthLink to="/reset-password">
              Esqueceu a senha?
            </AuthLink>
          </div>
        </div>

        <div>
          <AuthButton type="submit">
            {isLoading ? "Carregando..." : "Entrar"}
          </AuthButton>
        </div>

        <div className="text-center">
          <AuthText muted>
            Não possui uma conta?{" "}
          </AuthText>
          <AuthLink to="/signup">
            Criar conta
          </AuthLink>
        </div>
      </form>
    </AuthLayout>
  );
}
