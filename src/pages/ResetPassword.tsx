
import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { AuthLayout, AuthLabel, AuthLink, AuthText, AuthButton, AuthInput } from "../components/AuthLayout";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { data: config } = useSiteConfig();

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Link para redefinição de senha enviado para seu e-mail!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao solicitar redefinição de senha.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Redefinir Senha">
      {isSubmitted ? (
        <div className="text-center space-y-4">
          <div className="mb-6 text-white">
            <p>Verifique seu e-mail para o link de redefinição de senha.</p>
            <p className="mt-2">Não recebeu? Verifique sua pasta de spam ou tente novamente.</p>
          </div>
          
          <AuthButton onClick={() => setIsSubmitted(false)}>
            Tentar novamente
          </AuthButton>
          
          <div className="mt-4">
            <AuthLink to="/login">
              Voltar para o login
            </AuthLink>
          </div>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <AuthLabel>E-mail</AuthLabel>
            <div className="mt-1">
              <AuthInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail cadastrado"
                required
              />
            </div>
          </div>

          <div>
            <AuthButton type="submit">
              {isLoading ? "Enviando..." : "Enviar link de redefinição"}
            </AuthButton>
          </div>

          <div className="text-center">
            <AuthLink to="/login">
              Voltar para o login
            </AuthLink>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
