'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from '@/lib/toast'
import Button from '@/components/atoms/Button'
import { Upload, File, Download, Trash2, Eye, FileText, Image, BarChart3, Paperclip } from 'lucide-react'

interface FileData {
  id: string
  filename: string
  originalName: string
  url: string
  size: number
  mimeType: string
  uploadedAt: string
  appointment?: {
    id: string
    appointment_date: string
    title: string
    description?: string
  }
}

interface FileUploadProps {
  appointmentId?: string
  animalId?: string
  ownerId?: string
  onFileUploaded?: (file: FileData) => void
  onFileDeleted?: (fileId: string) => void
  className?: string
}

export default function FileUpload({ 
  appointmentId, 
  animalId, 
  ownerId, 
  onFileUploaded, 
  onFileDeleted,
  className 
}: FileUploadProps) {
  const [files, setFiles] = useState<FileData[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Charger les fichiers existants si un appointmentId ou animalId est fourni
  useEffect(() => {
    if (appointmentId || animalId) {
      fetchFiles()
    }
  }, [appointmentId, animalId])

  const fetchFiles = async () => {
    if (!appointmentId && !animalId) return

    setLoading(true)
    try {
      let response
      if (appointmentId) {
        response = await fetch(`/api/appointments/${appointmentId}/files`)
      } else if (animalId) {
        response = await fetch(`/api/animals/${animalId}/files`)
      }
      
      if (response && response.ok) {
        const data = await response.json()
        // Mapper les données de l'API vers le format attendu par le composant
        const mappedFiles = data.files.map((file: any) => ({
          id: file.id,
          filename: file.filename,
          originalName: file.original_name,
          url: file.file_url,
          size: file.file_size,
          mimeType: file.mime_type,
          uploadedAt: file.uploaded_at,
          appointment: file.appointment
        }))
        setFiles(mappedFiles)
      }
    } catch (error) {
      console.error('Erreur chargement fichiers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    Array.from(selectedFiles).forEach(uploadFile)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Si on a un appointmentId, on l'envoie et l'API récupérera automatiquement animal et owner
      if (appointmentId) {
        formData.append('appointmentId', appointmentId)
      } else {
        // Sinon, on envoie explicitement animalId et ownerId
        if (animalId) formData.append('animalId', animalId)
        if (ownerId) formData.append('ownerId', ownerId)
      }

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const newFile = data.file
        
        setFiles(prev => [newFile, ...prev])
        onFileUploaded?.(newFile)
        toast.success('Fichier uploadé avec succès')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'upload')
      }
    } catch (error) {
      console.error('Erreur upload:', error)
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const deleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFiles(prev => prev.filter(f => f.id !== fileId))
        onFileDeleted?.(fileId)
        toast.success('Fichier supprimé avec succès')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const downloadFile = (file: FileData) => {
    const link = document.createElement('a')
    link.href = `/api/files/${file.id}/download`
    link.download = file.originalName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openFile = (file: FileData) => {
    // Ouvrir en inline (navigateur) avec disposition=inline
    window.open(`/api/files/${file.id}/download?disposition=inline`, '_blank')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />
    if (mimeType === 'application/pdf') return <FileText className="w-4 h-4" />
    if (mimeType.includes('word')) return <FileText className="w-4 h-4" />
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <BarChart3 className="w-4 h-4" />
    if (mimeType === 'text/plain') return <FileText className="w-4 h-4" />
          return <Paperclip className="w-4 h-4" />
  }

  const isImage = (mimeType: string) => mimeType.startsWith('image/')

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zone d'upload */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
        />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          variant="outline"
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
              Ajouter des fichiers
            </div>
          )}
        </Button>
        
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Formats acceptés : Images, PDF, Word, Excel, TXT - Max 50MB par fichier
        </p>
      </div>

      {/* Liste des fichiers */}
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Chargement des fichiers...</p>
        </div>
      ) : files.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Fichiers ({files.length})
          </h4>
          
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-lg">{getFileIcon(file.mimeType)}</span>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {file.originalName}
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>{formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString('fr-FR')}</p>
                      {file.appointment && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          📅 {file.appointment.title} - {new Date(file.appointment.appointment_date).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {isImage(file.mimeType) && (
                    <Button
                      onClick={() => openFile(file)}
                      variant="ghost"
                      size="sm"
                      title="Voir l'image"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => downloadFile(file)}
                    variant="ghost"
                    size="sm"
                    title="Télécharger"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    onClick={() => deleteFile(file.id)}
                    variant="ghost"
                    size="sm"
                    title="Supprimer"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Aucun fichier</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Cliquez sur "Ajouter des fichiers" pour commencer
          </p>
        </div>
      )}
    </div>
  )
}
