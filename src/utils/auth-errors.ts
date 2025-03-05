
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

export const validateUsername = (username: string): { isValid: boolean; message: string } => {
  // 1. Verificar caracteres permitidos (letras, números, pontos, underscores)
  const allowedPattern = /^[a-zA-Z0-9._]+$/;
  if (!allowedPattern.test(username)) {
    return {
      isValid: false,
      message: "Apenas letras, números, pontos (.) e underscores (_) são permitidos."
    };
  }

  // 2. Verificar comprimento (entre 1 e 30 caracteres)
  if (username.length < 1 || username.length > 30) {
    return {
      isValid: false,
      message: "O nome de usuário deve ter entre 1 e 30 caracteres."
    };
  }

  // 3. Verificar pontos e underscores no início ou final
  if (username.startsWith('.') || username.startsWith('_') || 
      username.endsWith('.') || username.endsWith('_')) {
    return {
      isValid: false,
      message: "Pontos e underscores não podem estar no início ou no final do nome de usuário."
    };
  }

  // 4. Verificar pontos e underscores repetidos em sequência
  if (username.includes('..') || username.includes('__')) {
    return {
      isValid: false,
      message: "Pontos e underscores não podem estar repetidos em sequência."
    };
  }

  return { isValid: true, message: "" };
};
