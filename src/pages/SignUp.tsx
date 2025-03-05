
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { translateAuthError, validateUsername } from "../utils/auth-errors";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface Location {
  id: string;
  name: string;
}

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [locationId, setLocationId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({
    fullName: false,
    username: false,
    email: false,
    phone: false,
    locationId: false,
    birthDate: false,
    password: false,
    confirmPassword: false
  });
  const navigate = useNavigate();
  const { data: config, isLoading: configLoading } = useSiteConfig();

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name")
        .order("name");
      
      if (error) throw error;
      return data as Location[];
    }
  });

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        navigate("/");
      }
    };
    getSession();
  }, [navigate]);

  // Adicionar validação de username quando o valor mudar
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value.toLowerCase(); // Converter para minúsculas para consistência
    setUsername(newUsername);
    
    if (newUsername) {
      const validation = validateUsername(newUsername);
      setUsernameError(validation.message);
      setFormErrors(prev => ({...prev, username: !validation.isValid}));
    } else {
      setUsernameError("");
      setFormErrors(prev => ({...prev, username: true}));
    }
  };

  const validateForm = () => {
    const errors = {
      fullName: !fullName.trim(),
      username: !username.trim() || !!usernameError,
      email: !email.trim(),
      phone: !phone.trim(),
      locationId: !locationId.trim(),
      birthDate: !birthDate.trim(),
      password: !password.trim(),
      confirmPassword: !confirmPassword.trim() || confirmPassword !== password
    };
    
    setFormErrors(errors);
    
    // Retorna true se não houver erros
    return !Object.values(errors).some(Boolean);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Preencha todos os campos corretamente!", { duration: 3000 });
      return;
    }
    
    // Validar username antes de prosseguir
    if (username) {
      const validation = validateUsername(username);
      if (!validation.isValid) {
        toast.error(validation.message, { duration: 3000 });
        setUsernameError(validation.message);
        return;
      }
    }
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem!", { duration: 3000 });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username.toLowerCase(), // Armazenar sempre em minúsculas
            phone,
            birth_date: birthDate,
            location_id: locationId
          },
        },
      });
      if (error) throw error;
      toast.success("Conta criada com sucesso! Verifique seu e-mail para confirmar.", {
        duration: 5000,
      });
      navigate("/login");
    } catch (error: any) {
      const errorMessage = translateAuthError(error.message);
      toast.error(errorMessage, { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (configLoading || locationsLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  const linkColorStyle = { color: config?.login_button_color || '#CB5EEE' };
  const getInputClassName = (fieldName: keyof typeof formErrors) => {
    return `bg-black border-gray-700 text-white placeholder:text-gray-500 ${formErrors[fieldName] ? 'border-red-500' : ''}`;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="relative flex-1 hidden md:flex flex-col justify-between bg-gradient-to-r from-purple-800 to-purple-900 overflow-hidden">
        {config?.login_background_image ? (
          <div className="absolute inset-0 z-0">
            <img
              src={config.login_background_image}
              alt="Sign Up"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800/40 to-purple-900/40"></div>
          </div>
        ) : (
          <div className="absolute inset-0 z-0">
            <img
              src="/lovable-uploads/587a2669-ca00-4bd7-a223-008d7d9ace86.png"
              alt="Sign Up"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800/40 to-purple-900/40"></div>
          </div>
        )}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <div></div>
          <div className="bg-black/30 p-6 rounded-2xl backdrop-blur-sm">
            <p className="text-white text-lg font-medium mb-4">{config?.login_quote_text || '"No futuro, a tecnologia nos permitirá criar realidades alternativas tão convincentes que será difícil distinguir o que é real do que é simulado."'}</p>
            <p className="text-white font-bold">{config?.login_quote_author || 'Jaron Lanier'}</p>
            <p className="text-white/70 text-sm">{config?.login_quote_author_title || 'Cientista da computação e especialista em realidade virtual.'}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-black text-white">
        <div className="w-full max-w-md bg-[#0F0F10] rounded-2xl p-8" style={{ backgroundColor: config?.login_card_background_color || '#0F0F10' }}>
          <div className="mb-8 flex justify-center">
            <img 
              src="/logologin.png" 
              alt="Logo" 
              className="h-24 w-24 object-cover rounded-full border-2 border-white/20"
            />
          </div>
          
          <h1 className="text-2xl font-bold mb-8 text-center">Criar conta</h1>
          
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm">Nome Completo</label>
              <Input
                id="fullName"
                type="text"
                placeholder="Digite seu nome completo"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setFormErrors(prev => ({...prev, fullName: false}));
                }}
                required
                className={getInputClassName("fullName")}
              />
              {formErrors.fullName && (
                <p className="text-red-500 text-xs mt-1">Nome completo é obrigatório</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm">Nome de Usuário</label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu nome de usuário"
                value={username}
                onChange={handleUsernameChange}
                required
                className={`bg-black border-gray-700 text-white placeholder:text-gray-500 ${(formErrors.username || usernameError) ? 'border-red-500' : ''}`}
              />
              {usernameError && (
                <p className="text-red-500 text-xs mt-1">{usernameError}</p>
              )}
              {formErrors.username && !usernameError && (
                <p className="text-red-500 text-xs mt-1">Nome de usuário é obrigatório</p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                Apenas letras, números, pontos (.) e underscores (_). Entre 1-30 caracteres.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm">E-mail</label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu melhor e-mail"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFormErrors(prev => ({...prev, email: false}));
                }}
                required
                className={getInputClassName("email")}
              />
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-1">E-mail é obrigatório</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm">Telefone</label>
              <Input
                id="phone"
                type="tel"
                placeholder="Digite seu telefone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setFormErrors(prev => ({...prev, phone: false}));
                }}
                required
                className={getInputClassName("phone")}
              />
              {formErrors.phone && (
                <p className="text-red-500 text-xs mt-1">Telefone é obrigatório</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm">Localização</label>
              <Select 
                value={locationId} 
                onValueChange={(value) => {
                  setLocationId(value);
                  setFormErrors(prev => ({...prev, locationId: false}));
                }}
              >
                <SelectTrigger className={`bg-black border-gray-700 text-white ${formErrors.locationId ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Selecione sua cidade" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700 text-white">
                  {locations?.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.locationId && (
                <p className="text-red-500 text-xs mt-1">Localização é obrigatória</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="birthDate" className="block text-sm">Data de Nascimento</label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  setFormErrors(prev => ({...prev, birthDate: false}));
                }}
                required
                className={`bg-black border-gray-700 text-white ${formErrors.birthDate ? 'border-red-500' : ''}`}
              />
              {formErrors.birthDate && (
                <p className="text-red-500 text-xs mt-1">Data de nascimento é obrigatória</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm">Senha</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Criar sua senha"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormErrors(prev => ({...prev, password: false}));
                  }}
                  required
                  className={`bg-black border-gray-700 text-white placeholder:text-gray-500 pr-10 ${formErrors.password ? 'border-red-500' : ''}`}
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
              {formErrors.password && (
                <p className="text-red-500 text-xs mt-1">Senha é obrigatória</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm">Confirmar Senha</label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setFormErrors(prev => ({...prev, confirmPassword: false}));
                  }}
                  required
                  className={`bg-black border-gray-700 text-white placeholder:text-gray-500 pr-10 ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <button 
                  type="button"
                  onClick={toggleShowConfirmPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? (
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
              {formErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {password !== confirmPassword ? "As senhas não coincidem" : "Confirmação de senha é obrigatória"}
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full py-6 text-center rounded-lg font-medium"
              style={{ 
                backgroundColor: config?.login_button_color || '#CB5EEE', 
                color: config?.login_button_text_color || '#FFFFFF'
              }}
              disabled={loading || !!usernameError}
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>
          
          <p className="mt-6 text-center text-sm text-gray-400">
            Já possui uma conta? <Link to="/login" className="hover:underline" style={linkColorStyle}>Faça login</Link>
          </p>
        </div>
        
        <p className="mt-8 text-sm text-gray-500">
          {config?.login_developer_text || '2025 | Desenvolvido por Vinícius Dev'}
        </p>
      </div>
    </div>
  );
};

export default SignUp;
