import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { canManageCollaborators } from '@/lib/auth-utils'

const updateColorSchema = z.object({
  calendar_color: z.enum(['emerald','blue','purple','rose','amber','lime','cyan','fuchsia','indigo','teal']),
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
    const validatedData = updateColorSchema.parse(body)

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
        { error: 'Accès non autorisé - Seuls les propriétaires, vétérinaires et admins peuvent modifier les couleurs' },
        { status: 403 }
      )
    }

    // Mettre à jour la couleur
    const updatedProfile = await prisma.profile.update({
      where: { id: profileId },
      data: { calendarColor: validatedData.calendar_color },
      include: {
        user: {
          select: {
            email: true,
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Couleur mise à jour avec succès',
      collaborator: {
        id: updatedProfile.id,
        email: updatedProfile.user.email,
        first_name: updatedProfile.firstName,
        last_name: updatedProfile.lastName,
        role: updatedProfile.role,
        calendar_color: updatedProfile.calendarColor,
        is_active: true,
        updated_at: updatedProfile.updatedAt.toISOString(),
      }
    })

  } catch (error) {
    console.error('Erreur mise à jour couleur collaborateur:', error)
    
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
