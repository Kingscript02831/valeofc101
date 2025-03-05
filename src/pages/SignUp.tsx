
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { translateAuthError } from "../utils/auth-errors";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { validateUsername } from "../utils/username-validation";

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { data: config, isLoading: configLoading } = useSiteConfig();
  
  // Field validation states
  const [fieldErrors, setFieldErrors] = useState({
    email: false,
    password: false,
    username: false,
    name: false,
  });
  
  // Username validation
  const [usernameError, setUsernameError] = useState("");
  
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        navigate("/");
      }
    };
    getSession();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error state when user types
    setFieldErrors({
      ...fieldErrors,
      [name]: false,
    });
    
    // Validate username as user types
    if (name === "username") {
      const validationResult = validateUsername(value);
      if (!validationResult.valid) {
        setUsernameError(validationResult.message);
      } else {
        setUsernameError("");
      }
    }
  };

  const validateForm = () => {
    const errors = {
      email: !formData.email,
      password: !formData.password,
      username: !formData.username || !!usernameError,
      name: !formData.name,
    };
    
    setFieldErrors(errors);
    
    // Show toast for empty fields
    if (Object.values(errors).some(error => error)) {
      toast.error("Preencha todos os campos corretamente", {
        duration: 3000,
      });
      return false;
    }
    
    return true;
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username.toLowerCase(),
            name: formData.name,
          },
        },
      });

      if (error) throw error;

      toast.success("Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.");
      navigate("/login");
    } catch (error: any) {
      const errorMessage = translateAuthError(error.message);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  if (configLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  // Variable for the link color that matches the button color
  const linkColorStyle = { color: config?.login_button_color || '#CB5EEE' };
  
  // Input error style
  const getInputClassName = (fieldName: keyof typeof fieldErrors) => {
    return `bg-black border-b-[1px] border-t-0 border-l-0 border-r-0 ${
      fieldErrors[fieldName] 
        ? 'border-red-500 border-l-[1px] border-r-[1px] px-3 animate-pulse' 
        : 'border-gray-700'
    } text-white placeholder:text-gray-500 rounded-none focus:ring-0`;
  };

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sign up form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-black text-white">
        <div className="w-full max-w-md bg-[#0F0F10] rounded-2xl p-8" style={{ backgroundColor: config?.login_card_background_color || '#0F0F10' }}>
          {/* Round logo image */}
          <div className="mb-10 -mt-4">
            <div className="flex justify-center">
              <img 
                src="/logologin.png" 
                alt="Logo" 
                className="h-24 w-24 object-cover rounded-full border-2 border-white/20"
              />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-8 text-center">Criar sua conta</h1>
          
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm">Nome completo</label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Digite seu nome completo"
                value={formData.name}
                onChange={handleChange}
                className={getInputClassName("name")}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm">Nome de usuário</label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Escolha um nome de usuário único"
                value={formData.username}
                onChange={handleChange}
                className={getInputClassName("username")}
              />
              {usernameError && (
                <p className="text-red-500 text-xs mt-1">{usernameError}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm">E-mail</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Digite seu melhor e-mail"
                value={formData.email}
                onChange={handleChange}
                className={getInputClassName("email")}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm">Senha</label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Crie uma senha segura"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pr-10 ${getInputClassName("password")}`}
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
              {loading ? "Processando..." : "Criar Conta"}
            </Button>
          </form>
          
          <p className="mt-6 text-center text-sm text-gray-400">
            Já possui uma conta? <Link to="/login" className="hover:underline" style={linkColorStyle}>Entrar</Link>
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
