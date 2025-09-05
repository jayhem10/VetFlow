export type UserRole = 'admin' | 'vet' | 'assistant' | 'stock_manager' | 'owner'

export interface Permission {
  resource: string
  actions: string[]
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
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
    { resource: 'files', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'profile', actions: ['read', 'update'] },
    { resource: 'clinic_settings', actions: ['read', 'update'] },
  ],
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
    { resource: 'files', actions: ['read', 'create', 'update', 'delete'] },
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
    { resource: 'files', actions: ['read', 'create', 'update', 'delete'] },
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
    { resource: 'files', actions: ['read', 'create', 'update', 'delete'] },
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
    { resource: 'files', actions: ['read', 'create', 'update', 'delete'] },
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
      icon: 'dashboard',
      alwaysVisible: true
    }
  ]

  const roleItems = {
    owner: [
      { label: 'Animaux', href: '/animals', icon: 'animals' },
      { label: 'Propriétaires', href: '/owners', icon: 'owners' },
      { label: 'Rendez-vous', href: '/appointments', icon: 'appointments' },
      { label: 'Factures', href: '/invoices', icon: 'invoices' },
      { label: 'Équipe', href: '/collaborators', icon: 'collaborators' },
      { label: 'Prestations', href: '/services', icon: 'services' },
      { label: 'Stock', href: '/inventory', icon: 'stock' },
    ],
    admin: [
      { label: 'Animaux', href: '/animals', icon: 'animals' },
      { label: 'Propriétaires', href: '/owners', icon: 'owners' },
      { label: 'Rendez-vous', href: '/appointments', icon: 'appointments' },
      { label: 'Factures', href: '/invoices', icon: 'invoices' },
      { label: 'Équipe', href: '/collaborators', icon: 'collaborators' },
      { label: 'Prestations', href: '/services', icon: 'services' },
      { label: 'Stock', href: '/inventory', icon: 'stock' },
    ],
    vet: [
      { label: 'Animaux', href: '/animals', icon: 'animals' },
      { label: 'Propriétaires', href: '/owners', icon: 'owners' },
      { label: 'Rendez-vous', href: '/appointments', icon: 'appointments' },
      { label: 'Factures', href: '/invoices', icon: 'invoices' },
      { label: 'Prestations', href: '/services', icon: 'services' },
      { label: 'Stock', href: '/inventory', icon: 'stock' },
    ],
    assistant: [
      { label: 'Animaux', href: '/animals', icon: 'animals' },
      { label: 'Propriétaires', href: '/owners', icon: 'owners' },
      { label: 'Rendez-vous', href: '/appointments', icon: 'appointments' },
      { label: 'Factures', href: '/invoices', icon: 'invoices' },
      { label: 'Prestations', href: '/services', icon: 'services' },
      { label: 'Stock', href: '/inventory', icon: 'stock' },
    ],
    stock_manager: [
      { label: 'Animaux', href: '/animals', icon: 'animals' },
      { label: 'Propriétaires', href: '/owners', icon: 'owners' },
      { label: 'Rendez-vous', href: '/appointments', icon: 'appointments' },
      { label: 'Factures', href: '/invoices', icon: 'invoices' },
      { label: 'Prestations', href: '/services', icon: 'services' },
      { label: 'Stock', href: '/inventory', icon: 'stock' },
    ]
  }

  return [...baseItems, ...(roleItems[userRole] || [])]
}

