export type UserRole = 'admin' | 'vet' | 'assistant' | 'stock_manager'

export interface Permission {
  resource: string
  actions: string[]
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'animals', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'owners', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'appointments', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'collaborators', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'services', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'stock', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'invoices', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'medical_records', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'profile', actions: ['read', 'update'] },
    { resource: 'clinic_settings', actions: ['read', 'update'] },
  ],
  vet: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'animals', actions: ['read', 'create', 'update'] },
    { resource: 'owners', actions: ['read', 'create', 'update'] },
    { resource: 'appointments', actions: ['read', 'create', 'update'] },
    { resource: 'services', actions: ['read'] },
    { resource: 'products', actions: ['read'] },
    { resource: 'stock', actions: ['read'] },
    { resource: 'invoices', actions: ['read', 'create'] },
    { resource: 'medical_records', actions: ['read', 'create', 'update'] },
    { resource: 'profile', actions: ['read', 'update'] },
  ],
  assistant: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'animals', actions: ['read', 'create', 'update'] },
    { resource: 'owners', actions: ['read', 'create', 'update'] },
    { resource: 'appointments', actions: ['read', 'create', 'update'] },
    { resource: 'services', actions: ['read'] },
    { resource: 'products', actions: ['read'] },
    { resource: 'stock', actions: ['read'] },
    { resource: 'invoices', actions: ['read'] },
    { resource: 'profile', actions: ['read', 'update'] },
  ],
  stock_manager: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'animals', actions: ['read'] },
    { resource: 'owners', actions: ['read'] },
    { resource: 'appointments', actions: ['read'] },
    { resource: 'services', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'stock', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'invoices', actions: ['read', 'create'] },
    { resource: 'profile', actions: ['read', 'update'] },
  ],
}

export function hasPermission(userRole: UserRole, resource: string, action: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || []
  const resourcePermission = permissions.find(p => p.resource === resource)
  return resourcePermission?.actions.includes(action) || false
}

export function getMenuItems(userRole: UserRole) {
  const baseItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
      alwaysVisible: true
    }
  ]

  const roleItems = {
    admin: [
      { label: 'Animaux', href: '/animals', icon: '🐾' },
      { label: 'Propriétaires', href: '/owners', icon: '👥' },
      { label: 'Rendez-vous', href: '/appointments', icon: '📅' },
      { label: 'Équipe', href: '/collaborators', icon: '🤝' },
      { label: 'Prestations', href: '/services', icon: '💼' },
      { label: 'Stock', href: '/inventory', icon: '📦' },
    ],
    vet: [
      { label: 'Animaux', href: '/animals', icon: '🐾' },
      { label: 'Propriétaires', href: '/owners', icon: '👥' },
      { label: 'Rendez-vous', href: '/appointments', icon: '📅' },
      { label: 'Prestations', href: '/services', icon: '💼' },
      { label: 'Stock', href: '/inventory', icon: '📦' },
    ],
    assistant: [
      { label: 'Animaux', href: '/animals', icon: '🐾' },
      { label: 'Propriétaires', href: '/owners', icon: '👥' },
      { label: 'Rendez-vous', href: '/appointments', icon: '📅' },
      { label: 'Prestations', href: '/services', icon: '💼' },
      { label: 'Stock', href: '/inventory', icon: '📦' },
    ],
    stock_manager: [
      { label: 'Animaux', href: '/animals', icon: '🐾' },
      { label: 'Propriétaires', href: '/owners', icon: '👥' },
      { label: 'Rendez-vous', href: '/appointments', icon: '📅' },
      { label: 'Prestations', href: '/services', icon: '💼' },
      { label: 'Stock', href: '/inventory', icon: '📦' },
    ]
  }

  return [...baseItems, ...(roleItems[userRole] || [])]
}

export function getShortcutItems(userRole: UserRole) {
  const baseShortcuts = [
    {
      label: 'Ajouter un animal',
      icon: '➕',
      href: '/animals',
      description: 'Créer un nouveau dossier animal'
    },
    {
      label: 'Nouveau propriétaire',
      icon: '👤',
      href: '/owners',
      description: 'Enregistrer un nouveau propriétaire'
    },
    {
      label: 'Nouveau rendez-vous',
      icon: '📅',
      href: '/appointments',
      description: 'Planifier une consultation'
    }
  ]

  const roleShortcuts = {
    admin: [
      {
        label: 'Inviter collaborateur',
        icon: '🤝',
        href: '/collaborators',
        description: 'Ajouter un membre à l\'équipe'
      },
      {
        label: 'Nouvelle prestation',
        icon: '💼',
        href: '/services',
        description: 'Créer un nouveau service'
      },
      {
        label: 'Ajouter produit',
        icon: '📦',
        href: '/inventory',
        description: 'Ajouter un produit au stock'
      }
    ],
    vet: [
      {
        label: 'Nouvelle prestation',
        icon: '💼',
        href: '/services',
        description: 'Consulter les prestations'
      },
      {
        label: 'Consulter stock',
        icon: '📦',
        href: '/inventory',
        description: 'Vérifier les stocks'
      }
    ],
    assistant: [
      {
        label: 'Consulter prestations',
        icon: '💼',
        href: '/services',
        description: 'Voir les prestations disponibles'
      },
      {
        label: 'Consulter stock',
        icon: '📦',
        href: '/inventory',
        description: 'Vérifier les stocks'
      }
    ],
    stock_manager: [
      {
        label: 'Nouvelle prestation',
        icon: '💼',
        href: '/services',
        description: 'Créer un nouveau service'
      },
      {
        label: 'Ajouter produit',
        icon: '📦',
        href: '/inventory',
        description: 'Ajouter un produit au stock'
      }
    ]
  }

  return [...baseShortcuts, ...(roleShortcuts[userRole] || [])]
}
