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
      message: 'Êtes-vous sûr de vouloir supprimer Marie Dubois ? Cette action est irréversible et supprimera également tous les animaux associés.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      variant: 'danger'
    })

    if (confirmed) {
      console.log('Propriétaire supprimé')
    }
  }

  const handleWarningAction = async () => {
    const confirmed = await confirm({
      title: 'Action importante',
      message: 'Cette action modifiera les données de manière importante. Voulez-vous continuer ?',
      confirmText: 'Continuer',
      cancelText: 'Annuler',
      variant: 'warning'
    })

    if (confirmed) {
      console.log('Action confirmée')
    }
  }

  const handleInfoAction = async () => {
    const confirmed = await confirm({
      title: 'Confirmer l\'action',
      message: 'Cette action va synchroniser les données avec le serveur. Cela peut prendre quelques minutes.',
      confirmText: 'Synchroniser',
      cancelText: 'Plus tard',
      variant: 'info'
    })

    if (confirmed) {
      console.log('Synchronisation lancée')
    }
  }

  const handleCustomIcon = async () => {
    const confirmed = await confirm({
      title: 'Archiver le dossier',
      message: 'Le dossier sera déplacé vers les archives et ne sera plus visible dans la liste principale.',
      confirmText: 'Archiver',
      cancelText: 'Annuler',
      variant: 'info'
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
