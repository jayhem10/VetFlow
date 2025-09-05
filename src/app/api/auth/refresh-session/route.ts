import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer les données fraîches de l'utilisateur avec profil et clinique
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

    // Retourner les données fraîches pour mettre à jour la session côté client
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: !!user.emailVerified,
        profileCompleted: !!user.profileCompleted,
        hasProfile: !!user.profile,
        hasClinic: !!(user.profile?.clinic),
        mustChangePassword: user.mustChangePassword,
        profile: user.profile,
      },
    })
  } catch (error) {
    console.error('Erreur refresh session:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
