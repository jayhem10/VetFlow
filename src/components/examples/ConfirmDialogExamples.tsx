'use client'

/**
 * Exemples d'utilisation du ConfirmDialog
 * Ce fichier sert de documentation et peut être supprimé en production
 */

import { useConfirm } from '@/hooks/useConfirm'
import Button from '@/components/atoms/Button'

export function ConfirmDialogExamples() {
  const { confirm, ConfirmDialog } = useConfirm()

  const handleDeleteOwner = async () => {
    const confirmed = await confirm({
      title: 'Supprimer le propriétaire',
      description: 'Êtes-vous sûr de vouloir supprimer Marie Dubois ? Cette action est irréversible et supprimera également tous les animaux associés.',
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      variant: 'danger'
    })

    if (confirmed) {
      console.log('Propriétaire supprimé')
    }
  }

  const handleWarningAction = async () => {
    const confirmed = await confirm({
      title: 'Action importante',
      description: 'Cette action modifiera les données de manière importante. Voulez-vous continuer ?',
      confirmLabel: 'Continuer',
      cancelLabel: 'Annuler',
      variant: 'warning'
    })

    if (confirmed) {
      console.log('Action confirmée')
    }
  }

  const handleInfoAction = async () => {
    const confirmed = await confirm({
      title: 'Confirmer l\'action',
      description: 'Cette action va synchroniser les données avec le serveur. Cela peut prendre quelques minutes.',
      confirmLabel: 'Synchroniser',
      cancelLabel: 'Plus tard',
      variant: 'info'
    })

    if (confirmed) {
      console.log('Synchronisation lancée')
    }
  }

  const handleCustomIcon = async () => {
    const confirmed = await confirm({
      title: 'Archiver le dossier',
      description: 'Le dossier sera déplacé vers les archives et ne sera plus visible dans la liste principale.',
      confirmLabel: 'Archiver',
      cancelLabel: 'Annuler',
      variant: 'info',
      icon: (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
          <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
      )
    })

    if (confirmed) {
      console.log('Dossier archivé')
    }
  }

  return (
    <div className="p-8 space-y-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Exemples ConfirmDialog</h2>
      
      <Button 
        variant="destructive" 
        onClick={handleDeleteOwner}
        className="w-full"
      >
        🗑️ Supprimer (Danger)
      </Button>
      
      <Button 
        variant="outline" 
        onClick={handleWarningAction}
        className="w-full"
      >
        ⚠️ Action importante (Warning)
      </Button>
      
      <Button 
        variant="primary" 
        onClick={handleInfoAction}
        className="w-full"
      >
        ℹ️ Information (Info)
      </Button>
      
      <Button 
        variant="secondary" 
        onClick={handleCustomIcon}
        className="w-full"
      >
        📦 Icône personnalisée
      </Button>

      <ConfirmDialog />
    </div>
  )
}

export default ConfirmDialogExamples
