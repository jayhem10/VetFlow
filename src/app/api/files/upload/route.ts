import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { R2StorageService } from '@/lib/r2-storage'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer le profil utilisateur
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { clinic: true }
    })

    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Aucune clinique associée' }, { status: 404 })
    }

    // Vérifier les permissions
    const userRoles = profile.role ? profile.role.split(',').map(r => r.trim().toLowerCase()) : ['assistant']
    const hasFilePermission = userRoles.some(role => hasPermission(role, 'files', 'create'))

    if (!hasFilePermission) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    // Récupérer les données du formulaire
    const formData = await request.formData()
    const file = formData.get('file') as File
    const appointmentId = formData.get('appointmentId') as string
    const animalId = formData.get('animalId') as string
    const ownerId = formData.get('ownerId') as string

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Si un appointmentId est fourni, récupérer automatiquement l'animal et le propriétaire
    let finalAnimalId = animalId
    let finalOwnerId = ownerId

    if (appointmentId && (!animalId || !ownerId)) {
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          clinic_id: profile.clinicId
        },
        include: {
          animal: {
            include: {
              owner: true
            }
          }
        }
      })

      if (appointment) {
        finalAnimalId = appointment.animal_id
        finalOwnerId = appointment.animal.owner_id
      }
    }

    // Convertir le fichier en Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Créer un objet similaire à Express.Multer.File pour la validation
    const fileForValidation = {
      originalname: file.name,
      mimetype: file.type,
      size: file.size,
      buffer
    } as any

    // Valider le fichier
    const validation = R2StorageService.validateFile(fileForValidation)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Préparer les métadonnées
    const metadata = {
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
      clinicId: profile.clinicId,
      appointmentId: appointmentId || undefined,
      animalId: finalAnimalId || undefined,
      ownerId: finalOwnerId || undefined,
    }

    // Upload vers R2
    const uploadResult = await R2StorageService.uploadFile(buffer, metadata)

    // Enregistrer dans la base de données
    const savedFile = await prisma.file.create({
      data: {
        filename: uploadResult.key,
        original_name: file.name,
        file_url: uploadResult.url,
        file_size: uploadResult.size,
        mime_type: uploadResult.mimeType,
        clinic_id: profile.clinicId,
        appointment_id: appointmentId || null,
        animal_id: finalAnimalId || null,
        owner_id: finalOwnerId || null,
      }
    })

    return NextResponse.json({
      message: 'Fichier uploadé avec succès',
      file: {
        id: savedFile.id,
        filename: savedFile.filename,
        originalName: savedFile.original_name,
        url: savedFile.file_url,
        size: savedFile.file_size,
        mimeType: savedFile.mime_type,
        uploadedAt: savedFile.uploaded_at,
      }
    })

  } catch (error) {
    console.error('Erreur upload fichier:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}
