import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    console.log('🔍 API /api/owners - User ID:', session.user.id)

    // Récupérer le profil de l'utilisateur pour obtenir sa clinique
    const profile = await prisma.profile.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        clinic: true
      }
    })

    console.log('🔍 API /api/owners - Profile:', profile ? { id: profile.id, clinicId: profile.clinicId } : 'null')

    if (!profile || !profile.clinicId) {
      return NextResponse.json(
        { error: 'Aucune clinique associée à votre profil' },
        { status: 404 }
      )
    }

    // Récupérer les propriétaires de la clinique de l'utilisateur
    const owners = await prisma.owner.findMany({
      where: {
        clinic_id: profile.clinicId,
      },
      include: {
        _count: {
          select: {
            animals: true
          }
        }
      },
      orderBy: [
        { last_name: 'asc' },
        { first_name: 'asc' }
      ],
    })

    console.log('🔍 API /api/owners - Found owners:', owners.length, 'for clinic:', profile.clinicId)

    const formattedOwners = owners.map(owner => ({
      id: owner.id,
      clinic_id: owner.clinic_id,
      first_name: owner.first_name,
      last_name: owner.last_name,
      email: owner.email,
      phone: owner.phone,
      mobile: owner.mobile,
      address: owner.address,
      city: owner.city,
      postal_code: owner.postal_code,
      country: owner.country,
      preferred_contact: owner.preferred_contact,
      marketing_consent: owner.marketing_consent,
      notes: owner.notes,
      created_at: owner.created_at?.toISOString(),
      updated_at: owner.updated_at?.toISOString(),
      // Ajouter le nombre d'animaux
      animals: owner._count.animals,
    }))

    return NextResponse.json({
      owners: formattedOwners
    })

  } catch (error) {
    console.error('Erreur récupération propriétaires:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
