import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer la clinique depuis le profil de l'utilisateur
    const profile = await prisma.profile.findFirst({
      where: { userId: session.user.id },
    })

    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Aucune clinique associée' }, { status: 404 })
    }

    const deactivatedCollaborators = await prisma.profile.findMany({
      where: {
        clinicId: profile.clinicId,
        isActive: false, // Seulement les collaborateurs désactivés
      },
      include: {
        user: { select: { email: true } },
      },
      orderBy: [{ deactivatedAt: 'desc' }],
    })

    const formatted = deactivatedCollaborators.map((c) => ({
      id: c.id,
      clinic_id: c.clinicId,
      email: c.user.email,
      first_name: c.firstName,
      last_name: c.lastName,
      phone: c.phone,
      role: c.role,
      license_number: c.licenseNumber,
      specialties: c.specialties,
      calendar_color: c.calendarColor || null,
      is_active: c.isActive,
      deactivated_at: c.deactivatedAt?.toISOString(),
      created_at: c.createdAt.toISOString(),
      updated_at: c.updatedAt.toISOString(),
    }))

    return NextResponse.json({ collaborators: formatted })
  } catch (error) {
    console.error('Erreur get deactivated collaborators:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
