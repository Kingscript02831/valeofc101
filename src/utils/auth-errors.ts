
export const getAuthErrorMessage = (error: any): string => {
  const message = error?.message?.toLowerCase() || '';
  
  if (message.includes('email not confirmed')) {
    return 'Por favor, confirme seu e-mail antes de fazer login';
  }
  
  if (message.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos';
  }

  if (message.includes('email already registered')) {
    return 'Este e-mail já está registrado';
  }

  if (message.includes('weak password')) {
    return 'A senha deve ter pelo menos 6 caracteres';
  }

  if (message.includes('invalid email')) {
    return 'E-mail inválido';
  }

  return 'Ocorreu um erro. Por favor, tente novamente.';
};
