
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

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [locationId, setLocationId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const navigate = useNavigate();
  const { data: config } = useSiteConfig();

  // Fetch locations
  useState(() => {
    const fetchLocations = async () => {
      const { data } = await supabase.from("locations").select("*");
      if (data) setLocations(data);
    };
    fetchLocations();
  });

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
            phone,
            location_id: locationId,
          },
        },
      });

      if (error) throw error;

      toast.success("Cadastro realizado com sucesso! Verifique seu e-mail para confirmar sua conta.");
      navigate("/login");
    } catch (error: any) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Criar Conta">
      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <AuthLabel>Nome de Usuário</AuthLabel>
          <div className="mt-1">
            <AuthInput
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Como você deseja ser chamado"
              required
            />
          </div>
        </div>

        <div>
          <AuthLabel>Nome Completo</AuthLabel>
          <div className="mt-1">
            <AuthInput
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome completo"
              required
            />
          </div>
        </div>

        <div>
          <AuthLabel>E-mail</AuthLabel>
          <div className="mt-1">
            <AuthInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              required
            />
          </div>
        </div>

        <div>
          <AuthLabel>Telefone</AuthLabel>
          <div className="mt-1">
            <AuthInput
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        <div>
          <AuthLabel>Localização</AuthLabel>
          <div className="mt-1">
            <select
              value={locationId || ""}
              onChange={(e) => setLocationId(e.target.value)}
              className="auth-input"
              required
            >
              <option value="">Selecione sua localização</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <AuthLabel>Senha</AuthLabel>
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
          <AuthLabel>Confirmar Senha</AuthLabel>
          <div className="mt-1 relative">
            <AuthInput
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
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
            {isLoading ? "Processando..." : "Criar Conta"}
          </AuthButton>
        </div>

        <div className="text-center">
          <AuthText muted>
            Já possui uma conta?{" "}
          </AuthText>
          <AuthLink to="/login">
            Fazer login
          </AuthLink>
        </div>
      </form>
    </AuthLayout>
  );
}
