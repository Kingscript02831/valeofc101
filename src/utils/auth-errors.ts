
export const translateAuthError = (error: string): string => {
  if (error.includes("Email not confirmed")) {
    return "Email não confirmado. Por favor, verifique sua caixa de entrada.";
  }
  
  if (error.includes("Invalid login credentials")) {
    return "Credenciais inválidas. Verifique seu email e senha.";
  }
  
  if (error.includes("Email already registered")) {
    return "Este email já está registrado.";
  }
  
  if (error.includes("Password should be at least 6 characters")) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  
  if (error.includes("User already registered")) {
    return "Usuário já registrado.";
  }
  
  if (error.includes("Rate limit")) {
    return "Muitas tentativas. Tente novamente mais tarde.";
  }
  
  return `Erro: ${error}`;
};
