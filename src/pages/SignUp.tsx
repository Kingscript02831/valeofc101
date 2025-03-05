
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../components/ui/use-toast";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { getAuthErrorMessage } from "../utils/auth-errors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [locationId, setLocationId] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: config, isLoading: configLoading } = useSiteConfig();

  // Fetch locations
  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !name || !username || !phone || !birthDate || !locationId) {
      toast({
        title: "Erro ao criar conta",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (password !== passwordConfirmation) {
      toast({
        title: "Erro ao criar conta",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username);

      if (checkError) throw checkError;

      if (existingUsers && existingUsers.length > 0) {
        toast({
          title: "Erro ao criar conta",
          description: "Este nome de usuário já está em uso",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: name,
            username: username,
            phone: phone,
            birth_date: birthDate,
            location_id: locationId,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Conta criada com sucesso",
        description: "Verifique seu e-mail para confirmar sua conta",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
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
            style={{ color: config.signup_text_color }}
          >
            Inscreva-se
          </h1>
          <p style={{ color: config.signup_text_color }}>
            Preencha todos os campos abaixo para se registrar
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-5 mt-6">
          <InputField 
            label="Nome Completo" 
            id="name" 
            type="text" 
            value={name} 
            setValue={setName} 
            placeholder="Seu nome completo"
            config={config}
          />
          <InputField 
            label="Nome de Usuário" 
            id="username" 
            type="text" 
            value={username} 
            setValue={setUsername} 
            placeholder="@seunome"
            config={config}
          />
          <InputField 
            label="Email" 
            id="email" 
            type="email" 
            value={email} 
            setValue={setEmail} 
            placeholder="seu@email.com"
            config={config}
          />
          <InputField 
            label="Telefone" 
            id="phone" 
            type="tel" 
            value={phone} 
            setValue={setPhone} 
            placeholder="(00) 00000-0000"
            config={config}
          />
          
          <div>
            <label 
              htmlFor="location" 
              className="text-sm font-medium block mb-1"
              style={{ color: config.signup_text_color }}
            >
              Localização
            </label>
            <Select onValueChange={setLocationId} value={locationId}>
              <SelectTrigger className="bg-white/50 border-gray-200">
                <SelectValue placeholder="Selecione sua localização" />
              </SelectTrigger>
              <SelectContent>
                {locations?.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name} - {location.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <InputField 
            label="Data de Nascimento" 
            id="birthDate" 
            type="date" 
            value={birthDate} 
            setValue={setBirthDate}
            config={config}
          />
          <InputField 
            label="Senha" 
            id="password" 
            type="password" 
            value={password} 
            setValue={setPassword} 
            placeholder="******"
            config={config}
          />
          <InputField 
            label="Confirmar Senha" 
            id="passwordConfirmation" 
            type="password" 
            value={passwordConfirmation} 
            setValue={setPasswordConfirmation} 
            placeholder="******"
            config={config}
          />

          <Button
            type="submit"
            className="w-full h-12 font-medium rounded-lg transition duration-300 shadow-md text-white"
            style={{ 
              background: config.primary_color,
              borderColor: config.primary_color
            }}
            disabled={loading}
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>

          <p className="text-center text-sm" style={{ color: config.signup_text_color }}>
            Já possui uma conta?{" "}
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

const InputField = ({ label, id, type, value, setValue, placeholder = "", config }) => (
  <div>
    <label 
      htmlFor={id} 
      className="text-sm font-medium block mb-1"
      style={{ color: config.signup_text_color }}
    >
      {label}
    </label>
    <Input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      required
      className="bg-white/50 border-gray-200"
      style={{ color: config.signup_text_color }}
    />
  </div>
);

export default SignUp;
