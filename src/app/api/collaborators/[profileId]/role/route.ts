import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { canManageCollaborators } from '@/lib/auth-utils'

const updateRoleSchema = z.object({
  role: z.string().min(1, 'Le rôle est requis'),
})

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
    const body = await request.json()
    const validatedData = updateRoleSchema.parse(body)

    // Récupérer le profil à modifier
    const targetProfile = await prisma.profile.findUnique({
      where: { id: profileId }
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
        { error: 'Accès non autorisé - Seuls les propriétaires, vétérinaires et admins peuvent modifier les rôles' },
        { status: 403 }
      )
    }

    // Ne pas permettre de modifier son propre rôle
    if (targetProfile.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier votre propre rôle' },
        { status: 400 }
      )
    }

    // Mettre à jour le rôle
    const updatedProfile = await prisma.profile.update({
      where: { id: profileId },
      data: { role: validatedData.role },
      include: {
        user: {
          select: {
            email: true,
          }
        }
      }
    })

    return NextResponse.json({
      collaborator: {
        id: updatedProfile.id,
        clinic_id: updatedProfile.clinicId,
        email: updatedProfile.user.email,
        first_name: updatedProfile.firstName,
        last_name: updatedProfile.lastName,
        phone: updatedProfile.phone,
        role: updatedProfile.role,
        license_number: updatedProfile.licenseNumber,
        specialties: updatedProfile.specialties,
        is_active: true,
        created_at: updatedProfile.createdAt.toISOString(),
        updated_at: updatedProfile.updatedAt.toISOString(),
      }
    })

  } catch (error) {
    console.error('Erreur mise à jour rôle collaborateur:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}