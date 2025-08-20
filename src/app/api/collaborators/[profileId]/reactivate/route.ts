import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { canManageCollaborators } from '@/lib/auth-utils'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { profileId } = await params

    // Récupérer le profil à réactiver
    const targetProfile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { user: true }
    })

    if (!targetProfile) {
      return NextResponse.json(
        { error: 'Collaborateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur actuel a les droits sur cette clinique
    const currentUserProfile = await prisma.profile.findFirst({
      where: {
        userId: session.user.id,
        clinicId: targetProfile.clinicId,
      },
    })

    if (!currentUserProfile) {
      return NextResponse.json(
        { error: 'Profil utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur a les droits (owner, admin ou vet)
    if (!canManageCollaborators(currentUserProfile.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé - Seuls les propriétaires, vétérinaires et admins peuvent réactiver des collaborateurs' },
        { status: 403 }
      )
    }

    // Réactiver le profil
    const reactivatedProfile = await prisma.profile.update({
      where: { id: profileId },
      data: {
        isActive: true,
        deactivatedAt: null
      },
      include: {
        user: { select: { email: true } }
      }
    })

    return NextResponse.json({
      message: 'Collaborateur réactivé avec succès',
      collaborator: {
        id: reactivatedProfile.id,
        clinic_id: reactivatedProfile.clinicId,
        email: reactivatedProfile.user.email,
        first_name: reactivatedProfile.firstName,
        last_name: reactivatedProfile.lastName,
        phone: reactivatedProfile.phone,
        role: reactivatedProfile.role,
        license_number: reactivatedProfile.licenseNumber,
        specialties: reactivatedProfile.specialties,
        calendar_color: reactivatedProfile.calendarColor || null,
        is_active: reactivatedProfile.isActive,
        created_at: reactivatedProfile.createdAt.toISOString(),
        updated_at: reactivatedProfile.updatedAt.toISOString(),
      }
    })

  } catch (error) {
    console.error('Erreur réactivation collaborateur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
