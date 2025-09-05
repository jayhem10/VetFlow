import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer l'utilisateur avec profil et clinique
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: {
          include: {
            clinic: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      profileCompleted: user.profileCompleted,
      hasProfile: !!user.profile,
      hasClinic: !!(user.profile?.clinic),
      profileId: user.profile?.id,
      clinicId: user.profile?.clinic?.id,
      sessionData: {
        profileCompleted: (session.user as any)?.profileCompleted,
        hasProfile: session.user?.hasProfile,
        hasClinic: session.user?.hasClinic,
      },
    })
  } catch (error) {
    console.error('Erreur debug profile status:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
