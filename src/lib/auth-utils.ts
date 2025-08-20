/**
 * Utilitaires pour la gestion des rôles utilisateur
 */

export interface UserRoles {
  hasOwnerRole: boolean;
  hasAdminRole: boolean;
  hasVetRole: boolean;
  hasAssistantRole: boolean;
}

/**
 * Parse les rôles d'un utilisateur à partir d'une chaîne de caractères
 * @param roleString - La chaîne de rôles (ex: "owner,admin" ou "vet,assistant")
 * @returns Un objet avec les rôles booléens
 */
export function parseUserRoles(roleString: string | null | undefined): UserRoles {
  const roles = roleString ? roleString.split(',').map(r => r.trim()) : [];
  
  return {
    hasOwnerRole: roles.includes('owner'),
    hasAdminRole: roles.includes('admin'),
    hasVetRole: roles.includes('vet'),
    hasAssistantRole: roles.includes('assistant'),
  };
}

/**
 * Vérifie si l'utilisateur a au moins un des rôles requis
 * @param roleString - La chaîne de rôles de l'utilisateur
 * @param requiredRoles - Les rôles requis (au moins un)
 * @returns true si l'utilisateur a au moins un des rôles requis
 */
export function hasAnyRole(roleString: string | null | undefined, requiredRoles: string[]): boolean {
  const userRoles = parseUserRoles(roleString);
  
  return requiredRoles.some(role => {
    switch (role) {
      case 'owner': return userRoles.hasOwnerRole;
      case 'admin': return userRoles.hasAdminRole;
      case 'vet': return userRoles.hasVetRole;
      case 'assistant': return userRoles.hasAssistantRole;
      default: return false;
    }
  });
}

/**
 * Vérifie si l'utilisateur a tous les rôles requis
 * @param roleString - La chaîne de rôles de l'utilisateur
 * @param requiredRoles - Les rôles requis (tous)
 * @returns true si l'utilisateur a tous les rôles requis
 */
export function hasAllRoles(roleString: string | null | undefined, requiredRoles: string[]): boolean {
  const userRoles = parseUserRoles(roleString);
  
  return requiredRoles.every(role => {
    switch (role) {
      case 'owner': return userRoles.hasOwnerRole;
      case 'admin': return userRoles.hasAdminRole;
      case 'vet': return userRoles.hasVetRole;
      case 'assistant': return userRoles.hasAssistantRole;
      default: return false;
    }
  });
}

/**
 * Vérifie si l'utilisateur peut gérer les collaborateurs (owner, admin)
 * @param roleString - La chaîne de rôles de l'utilisateur
 * @returns true si l'utilisateur peut gérer les collaborateurs
 */
export function canManageCollaborators(roleString: string | null | undefined): boolean {
  return hasAnyRole(roleString, ['owner', 'admin']);
}

/**
 * Vérifie si l'utilisateur peut créer des rendez-vous
 * @param roleString - La chaîne de rôles de l'utilisateur
 * @returns true si l'utilisateur peut créer des rendez-vous
 */
export function canCreateAppointments(roleString: string | null | undefined): boolean {
  return hasAnyRole(roleString, ['owner', 'admin', 'vet']);
}

/**
 * Vérifie si l'utilisateur peut modifier des rendez-vous
 * @param roleString - La chaîne de rôles de l'utilisateur
 * @returns true si l'utilisateur peut modifier des rendez-vous
 */
export function canEditAppointments(roleString: string | null | undefined): boolean {
  return hasAnyRole(roleString, ['owner', 'admin', 'vet']);
}

/**
 * Vérifie si l'utilisateur peut voir tous les rendez-vous
 * @param roleString - La chaîne de rôles de l'utilisateur
 * @returns true si l'utilisateur peut voir tous les rendez-vous
 */
export function canViewAllAppointments(roleString: string | null | undefined): boolean {
  return hasAnyRole(roleString, ['owner', 'admin', 'vet', 'assistant']);
}

/**
 * Vérifie si l'utilisateur peut modifier son propre rôle
 * @param roleString - La chaîne de rôles de l'utilisateur
 * @param isClinicCreator - Si l'utilisateur est le créateur de la clinique
 * @returns true si l'utilisateur peut modifier son rôle
 */
export function canModifyOwnRole(roleString: string | null | undefined, isClinicCreator: boolean = false): boolean {
  // Le créateur de la clinique ne peut pas retirer son rôle admin
  if (isClinicCreator) {
    const userRoles = parseUserRoles(roleString);
    return userRoles.hasAdminRole; // Peut modifier mais pas retirer admin
  }
  
  return hasAnyRole(roleString, ['owner', 'admin']);
}

/**
 * Valide une chaîne de rôles
 * @param roleString - La chaîne de rôles à valider
 * @returns true si la chaîne de rôles est valide
 */
export function validateRoles(roleString: string | null | undefined): boolean {
  if (!roleString) return true; // Rôles optionnels
  
  const roles = roleString.split(',').map(r => r.trim());
  const validRoles = ['owner', 'vet', 'assistant', 'admin', 'stock_manager'];
  
  return roles.every(role => validRoles.includes(role));
}

/**
 * Nettoie et normalise une chaîne de rôles
 * @param roleString - La chaîne de rôles à nettoyer
 * @returns La chaîne de rôles nettoyée
 */
export function normalizeRoles(roleString: string | null | undefined): string {
  if (!roleString) return '';
  
  const roles = roleString
    .split(',')
    .map(r => r.trim())
    .filter(r => r && ['owner', 'vet', 'assistant', 'admin'].includes(r));
  
  return roles.join(', ');
}

/**
 * Définition claire des rôles :
 * 
 * OWNER : Propriétaire de la clinique
 * - Peut tout faire (gestion complète)
 * - Créer/modifier/supprimer des rendez-vous
 * - Gérer les collaborateurs
 * - Accès à toutes les données
 * 
 * ADMIN : Administrateur de la clinique
 * - Mêmes droits que OWNER
 * - Peut être nommé par le propriétaire
 * - Gestion quotidienne de la clinique
 * 
 * VET : Vétérinaire
 * - Peut créer/modifier des rendez-vous (pour lui-même et autres)
 * - Peut voir tous les rendez-vous
 * - Accès aux dossiers médicaux
 * - Pas de gestion des collaborateurs
 * 
 * ASSISTANT : Assistant vétérinaire
 * - Peut voir les rendez-vous
 * - Peut modifier le statut des rendez-vous
 * - Pas de création de rendez-vous
 * - Accès limité aux données
 */
