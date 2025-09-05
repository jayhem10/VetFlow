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

    // Récupérer TOUS les profils de la clinique (y compris l'utilisateur actuel)
    // et filtrer côté serveur pour ne garder que les vétérinaires
    const allProfiles = await prisma.profile.findMany({
      where: {
        clinicId: profile.clinicId,
        isActive: true,
      },
      include: {
        user: { select: { email: true } },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    })

    // Filtrer pour ne garder que les profils avec les rôles 'vet' ou 'admin'
    const veterinarians = allProfiles.filter(profile => {
      if (!profile.role) return false
      
      const roles = profile.role.split(',').map(r => r.trim())
      return roles.some(role => role === 'vet' || role === 'admin')
    })

    const formatted = veterinarians.map((c) => ({
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
      is_active: true,
      is_current_user: c.userId === session.user.id,
      last_login_at: null,
      created_at: c.createdAt.toISOString(),
      updated_at: c.updatedAt.toISOString(),
    }))

    console.log(`Found ${formatted.length} veterinarians for clinic ${profile.clinicId}`)

    return NextResponse.json({ veterinarians: formatted })
  } catch (error) {
    console.error('Erreur get veterinarians:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
