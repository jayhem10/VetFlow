import { useAuth } from '@/modules/auth/hooks/use-auth'
import { hasPermission, getMenuItems, type UserRole } from '@/lib/permissions'

// Mapping des rôles pour assurer la compatibilité
function mapRole(role: string | null | undefined): UserRole {
  if (!role) return 'assistant'
  
  // Parse les rôles multiples (ex: "admin,owner" ou "vet,assistant")
  const roles = role.split(',').map(r => r.trim())
  
  // Mapping des anciens rôles vers les nouveaux
  const roleMap: Record<string, UserRole> = {
    'veterinarian': 'vet',
    'owner': 'owner',
    'vet': 'vet',
    'assistant': 'assistant',
    'stock_manager': 'stock_manager',
    'admin': 'admin'
  }
  
  // Priorité des rôles (du plus privilégié au moins privilégié)
  const rolePriority: UserRole[] = ['owner', 'admin', 'vet', 'stock_manager', 'assistant']
  
  // Trouver le rôle avec la plus haute priorité
  for (const priorityRole of rolePriority) {
    if (roles.some(r => roleMap[r] === priorityRole)) {
      return priorityRole
    }
  }
  
  return 'assistant'
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
  
  return {
    userRole,
    can,
    menuItems,
    isOwner: userRole === 'owner',
    isAdmin: userRole === 'admin',
    isVeterinarian: userRole === 'vet',
    isAssistant: userRole === 'assistant',
    isStockManager: userRole === 'stock_manager',
  }
}
