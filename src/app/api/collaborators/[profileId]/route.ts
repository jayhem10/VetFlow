import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { profileId } = await params

    // Récupérer le profil à supprimer
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
        role: {
          in: ['admin', 'vet'] // Seuls les vétérinaires et admins peuvent supprimer
        }
      },
    })

    if (!currentUserProfile) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Ne pas permettre de se supprimer soi-même
    if (targetProfile.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous supprimer vous-même' },
        { status: 400 }
      )
    }

    // Supprimer le profil et l'utilisateur
    await prisma.$transaction([
      prisma.profile.delete({
        where: { id: profileId }
      }),
      prisma.user.delete({
        where: { id: targetProfile.userId }
      })
    ])

    return NextResponse.json({
      message: 'Collaborateur supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur suppression collaborateur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}