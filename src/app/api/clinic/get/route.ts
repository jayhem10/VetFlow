import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer le profil utilisateur avec la clinique
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { clinic: true }
    })

    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Aucune clinique associée' }, { status: 404 })
    }

    if (!profile.clinic) {
      return NextResponse.json({ error: 'Clinique non trouvée' }, { status: 404 })
    }

    // Harmoniser la forme de réponse attendue par le store (result.clinic)
    return NextResponse.json({ clinic: profile.clinic })

  } catch (error) {
    console.error('Erreur récupération clinique:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 })
  }
}