/**
 * Génère un mot de passe temporaire sécurisé
 * @param length Longueur du mot de passe (défaut: 12)
 * @returns Mot de passe temporaire
 */
export function generateTempPassword(length: number = 12): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  
  // Assurer au moins une majuscule, une minuscule et un chiffre
  password += charset.charAt(Math.floor(Math.random() * 26)) // Majuscule
  password += charset.charAt(26 + Math.floor(Math.random() * 26)) // Minuscule
  password += charset.charAt(52 + Math.floor(Math.random() * 10)) // Chiffre
  
  // Remplir le reste avec des caractères aléatoires
  for (let i = 3; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  // Mélanger les caractères
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Valide un mot de passe selon les critères de sécurité
 * @param password Mot de passe à valider
 * @returns Objet avec isValid et errors
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Vérifie si un mot de passe est temporaire (généré automatiquement)
 * @param password Mot de passe à vérifier
 * @returns true si le mot de passe semble temporaire
 */
export function isTemporaryPassword(password: string): boolean {
  // Un mot de passe temporaire a généralement une longueur fixe et un pattern spécifique
  // Cette fonction peut être améliorée selon vos besoins
  return password.length === 12 && /^[A-Za-z0-9]{12}$/.test(password)
}
