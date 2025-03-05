
/**
 * Validates a username based on the following rules:
 * 1. Only letters, numbers, periods, and underscores
 * 2. No spaces
 * 3. Length between 1-30 characters
 * 4. No leading or trailing periods/underscores
 * 5. No consecutive periods/underscores
 */
export function validateUsername(username: string): { valid: boolean; message: string } {
  // Check if username is provided
  if (!username) {
    return { valid: false, message: "Nome de usuário é obrigatório." };
  }
  
  // Check length
  if (username.length > 30) {
    return { valid: false, message: "Nome de usuário deve ter no máximo 30 caracteres." };
  }
  
  // Check for invalid characters
  if (!/^[a-zA-Z0-9._]+$/.test(username)) {
    return { 
      valid: false, 
      message: "Use apenas letras, números, pontos (.) e underscores (_)." 
    };
  }
  
  // Check for spaces
  if (/\s/.test(username)) {
    return { valid: false, message: "Nome de usuário não pode conter espaços." };
  }
  
  // Check for leading/trailing periods or underscores
  if (/^[._]|[._]$/.test(username)) {
    return { 
      valid: false, 
      message: "Pontos e underscores não podem estar no início ou no fim." 
    };
  }
  
  // Check for consecutive periods or underscores
  if (/[.]{2,}|[_]{2,}/.test(username)) {
    return { 
      valid: false, 
      message: "Pontos e underscores não podem estar repetidos em sequência." 
    };
  }
  
  return { valid: true, message: "" };
}
