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
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const profile = await prisma.profile.findFirst({
      where: { userId: session.user.id },
      include: { clinic: true }
    })

    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Aucune clinique associée' }, { status: 404 })
    }

    // Vérifier les permissions
    const userRoles = profile.role ? profile.role.split(',').map(r => r.trim().toLowerCase()) : ['assistant']
    const hasClinicPermission = userRoles.some(role => hasPermission(role, 'clinic_settings', 'update'))

    if (!hasClinicPermission) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('logo') as File
    const clinicId = formData.get('clinicId') as string

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    if (clinicId !== profile.clinicId) {
      return NextResponse.json({ error: 'Accès non autorisé à cette clinique' }, { status: 403 })
    }

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Type de fichier non supporté' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      return NextResponse.json({ error: 'Fichier trop volumineux' }, { status: 400 })
    }

    // Convertir le fichier en Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Créer un objet pour la validation
    const fileForValidation = {
      originalname: file.name,
      mimetype: file.type,
      size: file.size,
      buffer
    }

    // Valider le logo
    const validation = R2StorageService.validateLogo(fileForValidation)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Upload vers R2
    const uploadResult = await R2StorageService.uploadLogo(
      buffer,
      clinicId,
      file.name,
      file.type
    )

    // Mettre à jour la clinique avec le nouveau logo
    await prisma.clinic.update({
      where: { id: clinicId },
      data: { logo_url: uploadResult.url }
    })

    return NextResponse.json({
      message: 'Logo mis à jour avec succès',
      logoUrl: uploadResult.url
    })

  } catch (error) {
    console.error('Erreur upload logo:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}
