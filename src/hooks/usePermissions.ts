import { useAuth } from '@/modules/auth/hooks/use-auth'
import { hasPermission, getMenuItems, getShortcutItems, type UserRole } from '@/lib/permissions'

// Mapping des rôles pour assurer la compatibilité
function mapRole(role: string | null | undefined): UserRole {
  if (!role) return 'assistant'
  
  // Mapping des anciens rôles vers les nouveaux
  const roleMap: Record<string, UserRole> = {
    'veterinarian': 'vet',
    'owner': 'admin', // Le propriétaire de clinique devient admin
    'vet': 'vet',
    'assistant': 'assistant',
    'stock_manager': 'stock_manager',
    'admin': 'admin'
  }
  
  // Si le rôle contient 'admin', c'est un admin
  if (role.includes('admin')) return 'admin'
  
  return roleMap[role] || 'assistant'
}

export function usePermissions() {
  const { user } = useAuth()
  
  // Récupérer le rôle de l'utilisateur avec mapping
  const userRole = mapRole(user?.profile?.role)
  
  // Fonction pour vérifier les permissions
  const can = (resource: string, action: string) => {
    return hasPermission(userRole, resource, action)
  }
  
  // Récupérer les éléments de menu selon le rôle
  const menuItems = getMenuItems(userRole)
  const shortcutItems = getShortcutItems(userRole)
  
  return {
    userRole,
    can,
    menuItems,
    shortcutItems,
    isAdmin: userRole === 'admin',
    isVeterinarian: userRole === 'vet',
    isAssistant: userRole === 'assistant',
    isStockManager: userRole === 'stock_manager',
  }
}
