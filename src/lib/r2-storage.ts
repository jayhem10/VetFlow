import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Configuration Cloudflare R2
const R2_ENDPOINT = 'https://ba0c66b2b00dbf267dda6b9a67f0a764.r2.cloudflarestorage.com'
const R2_BUCKET = 'vetflow-files' // À créer dans votre compte R2
const R2_LOGO_BUCKET = 'vetflow-logos' // Bucket séparé pour les logos
const R2_REGION = 'auto'

// Client S3 pour R2
const s3Client = new S3Client({
  region: R2_REGION,
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
})

export interface UploadResult {
  url: string
  key: string
  size: number
  mimeType: string
}

export interface FileMetadata {
  originalName: string
  size: number
  mimeType: string
  clinicId: string
  appointmentId?: string
  animalId?: string
  ownerId?: string
}

export class R2StorageService {
  /**
   * Upload un fichier vers R2
   */
  static async uploadFile(
    file: Buffer,
    metadata: FileMetadata
  ): Promise<UploadResult> {
    try {
      // Générer une clé unique pour le fichier
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const extension = metadata.originalName.split('.').pop()
      const key = `files/${metadata.clinicId}/${timestamp}-${randomId}.${extension}`

      // Préparer les métadonnées
      const uploadParams = {
        Bucket: R2_BUCKET,
        Key: key,
        Body: file,
        ContentType: metadata.mimeType,
        Metadata: {
          originalName: metadata.originalName,
          clinicId: metadata.clinicId,
          appointmentId: metadata.appointmentId || '',
          animalId: metadata.animalId || '',
          ownerId: metadata.ownerId || '',
          uploadedAt: new Date().toISOString(),
        },
      }

      // Upload vers R2
      await s3Client.send(new PutObjectCommand(uploadParams))

      // Construire l'URL publique
      const url = `${R2_ENDPOINT}/${R2_BUCKET}/${key}`

      return {
        url,
        key,
        size: metadata.size,
        mimeType: metadata.mimeType,
      }
    } catch (error) {
      console.error('Erreur upload R2:', error)
      throw new Error('Erreur lors de l\'upload du fichier')
    }
  }

  /**
   * Supprimer un fichier de R2
   */
  static async deleteFile(key: string): Promise<void> {
    try {
      const deleteParams = {
        Bucket: R2_BUCKET,
        Key: key,
      }

      await s3Client.send(new DeleteObjectCommand(deleteParams))
    } catch (error) {
      console.error('Erreur suppression R2:', error)
      throw new Error('Erreur lors de la suppression du fichier')
    }
  }

  /**
   * Générer une URL signée pour télécharger un fichier privé
   */
  static async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      })

      return await getSignedUrl(s3Client, command, { expiresIn })
    } catch (error) {
      console.error('Erreur génération URL signée:', error)
      throw new Error('Erreur lors de la génération de l\'URL de téléchargement')
    }
  }

  /**
   * Valider un fichier
   */
  static validateFile(file: any): { valid: boolean; error?: string } {
    const maxSize = 50 * 1024 * 1024 // 50MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]

    if (file.size > maxSize) {
      return { valid: false, error: 'Fichier trop volumineux (max 50MB)' }
    }

    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Type de fichier non autorisé' }
    }

    return { valid: true }
  }

  /**
   * Extraire la clé R2 d'une URL
   */
  static extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const bucketIndex = pathParts.findIndex(part => part === R2_BUCKET)
      
      if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
        return pathParts.slice(bucketIndex + 1).join('/')
      }
      
      return null
    } catch (error) {
      console.error('Erreur extraction clé:', error)
      return null
    }
  }

  /**
   * Upload un logo de clinique vers R2
   */
  static async uploadLogo(
    file: Buffer,
    clinicId: string,
    originalName: string,
    mimeType: string
  ): Promise<UploadResult> {
    try {
      // Générer une clé unique pour le logo
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const extension = originalName.split('.').pop()
      const key = `logos/${clinicId}/${timestamp}-${randomId}.${extension}`

      // Préparer les métadonnées
      const uploadParams = {
        Bucket: R2_LOGO_BUCKET,
        Key: key,
        Body: file,
        ContentType: mimeType,
        Metadata: {
          originalName,
          clinicId,
          uploadedAt: new Date().toISOString(),
        },
      }

      // Upload vers R2
      await s3Client.send(new PutObjectCommand(uploadParams))

      // Construire l'URL publique
      const url = `${R2_ENDPOINT}/${R2_LOGO_BUCKET}/${key}`

      return {
        url,
        key,
        size: file.length,
        mimeType,
      }
    } catch (error) {
      console.error('Erreur upload logo R2:', error)
      throw new Error('Erreur lors de l\'upload du logo')
    }
  }

  /**
   * Supprimer un logo de R2
   */
  static async deleteLogo(key: string): Promise<void> {
    try {
      const deleteParams = {
        Bucket: R2_LOGO_BUCKET,
        Key: key,
      }

      await s3Client.send(new DeleteObjectCommand(deleteParams))
    } catch (error) {
      console.error('Erreur suppression logo R2:', error)
      throw new Error('Erreur lors de la suppression du logo')
    }
  }

  /**
   * Valider un logo
   */
  static validateLogo(file: any): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ]

    if (file.size > maxSize) {
      return { valid: false, error: 'Logo trop volumineux (max 5MB)' }
    }

    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Type de fichier non autorisé (JPG, PNG, GIF, WebP uniquement)' }
    }

    return { valid: true }
  }

  /**
   * Extraire la clé R2 d'une URL de logo
   */
  static extractLogoKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const bucketIndex = pathParts.findIndex(part => part === R2_LOGO_BUCKET)
      
      if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
        return pathParts.slice(bucketIndex + 1).join('/')
      }
      
      return null
    } catch (error) {
      console.error('Erreur extraction clé logo:', error)
      return null
    }
  }

  /**
   * Obtenir une URL signée pour un logo (bucket logos)
   */
  static async getSignedLogoDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: R2_LOGO_BUCKET,
        Key: key,
      })
      return await getSignedUrl(s3Client, command, { expiresIn })
    } catch (error) {
      console.error('Erreur génération URL signée (logo):', error)
      throw new Error("Erreur lors de la génération de l'URL de téléchargement du logo")
    }
  }
}
