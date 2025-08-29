import { Search, Package, Calendar, Users, FileText } from 'lucide-react'

interface EmptyStateProps {
  type?: 'search' | 'products' | 'services' | 'appointments' | 'collaborators' | 'invoices' | 'general'
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}

const emptyStateConfig = {
  search: {
    icon: Search,
    defaultTitle: 'Aucun résultat trouvé',
    defaultDescription: 'Essayez de modifier vos critères de recherche'
  },
  products: {
    icon: Package,
    defaultTitle: 'Aucun produit en stock',
    defaultDescription: 'Commencez par ajouter votre premier produit à l\'inventaire'
  },
  services: {
    icon: FileText,
    defaultTitle: 'Aucune prestation disponible',
    defaultDescription: 'Créez votre première prestation de service'
  },
  appointments: {
    icon: Calendar,
    defaultTitle: 'Aucun rendez-vous programmé',
    defaultDescription: 'Aucun rendez-vous n\'est prévu pour le moment'
  },
  collaborators: {
    icon: Users,
    defaultTitle: 'Aucun collaborateur',
    defaultDescription: 'Invitez votre premier collaborateur à rejoindre l\'équipe'
  },
  invoices: {
    icon: FileText,
    defaultTitle: 'Aucune facture générée',
    defaultDescription: 'Commencez par générer votre première facture depuis un rendez-vous'
  },
  general: {
    icon: FileText,
    defaultTitle: 'Aucune donnée disponible',
    defaultDescription: 'Aucune information à afficher pour le moment'
  }
}

export function EmptyState({ 
  type = 'general',
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  const config = emptyStateConfig[type]
  const Icon = config.icon

  return (
    <div className={`text-center py-12 ${className}`}>
      <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        {description || config.defaultDescription}
      </p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  )
}
