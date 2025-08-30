'use client'

import { useState, useRef } from 'react'
import { toast } from '@/lib/toast'
import Button from '@/components/atoms/Button'
import { Upload, X, Image } from 'lucide-react'

interface LogoUploadProps {
  currentLogoUrl?: string | null
  onLogoUploaded: (logoUrl: string) => void
  clinicId: string
}

export default function LogoUpload({ currentLogoUrl, onLogoUploaded, clinicId }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast.error('Le fichier est trop volumineux (max 5MB)')
      return
    }

    // Créer un aperçu
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload du fichier
    uploadLogo(file)
  }

  const uploadLogo = async (file: File) => {
    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('logo', file)
      formData.append('clinicId', clinicId)

      const response = await fetch('/api/clinic/upload-logo', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onLogoUploaded(data.logoUrl)
        toast.success('Logo mis à jour avec succès')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'upload')
        setPreviewUrl(currentLogoUrl ?? null)
      }
    } catch (error) {
      console.error('Erreur upload logo:', error)
      toast.error('Erreur lors de l\'upload')
      setPreviewUrl(currentLogoUrl ?? null)
    } finally {
      setUploading(false)
    }
  }

  const removeLogo = async () => {
    try {
      const response = await fetch(`/api/clinic/${clinicId}/logo`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPreviewUrl(null)
        onLogoUploaded('')
        toast.success('Logo supprimé')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur suppression logo:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-4">
      {/* Aperçu du logo actuel */}
      {previewUrl && (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Logo de la clinique"
            className="w-32 h-32 object-contain border border-gray-300 dark:border-gray-600 rounded-lg"
          />
          <button
            onClick={removeLogo}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            title="Supprimer le logo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Zone d'upload */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
              Upload en cours...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {previewUrl ? 'Changer le logo' : 'Ajouter un logo'}
            </div>
          )}
        </Button>
        
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Formats acceptés : JPG, PNG, WebP - Max 5MB
        </p>
      </div>
    </div>
  )
}
