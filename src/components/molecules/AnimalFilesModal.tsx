'use client'

import Dialog from '@/components/atoms/Dialog'
import Button from '@/components/atoms/Button'
import FileUpload from '@/components/molecules/FileUpload'
import type { Animal } from '@/types/animal.types'

interface AnimalFilesModalProps {
  isOpen: boolean
  onClose: () => void
  animal: Animal | null
}

export function AnimalFilesModal({ isOpen, onClose, animal }: AnimalFilesModalProps) {
  const handleFileUploaded = () => {
    // Le composant FileUpload gère automatiquement le rafraîchissement
  }



  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="w-[96vw] max-w-4xl max-h-[85vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Documents de {animal?.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gérez les documents liés à cet animal
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>

        {/* Zone d'upload et gestion des fichiers */}
        <FileUpload
          animalId={animal?.id}
          onFileUploaded={handleFileUploaded}
        />
      </div>
    </Dialog>
  )
}
