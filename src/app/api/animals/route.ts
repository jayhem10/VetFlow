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

    console.log('🔍 API /api/animals - User ID:', session.user.id)

    // Récupérer le profil de l'utilisateur pour obtenir sa clinique
    const profile = await prisma.profile.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        clinic: true
      }
    })

    console.log('🔍 API /api/animals - Profile:', profile ? { id: profile.id, clinicId: profile.clinicId } : 'null')

    if (!profile || !profile.clinicId) {
      return NextResponse.json(
        { error: 'Aucune clinique associée à votre profil' },
        { status: 404 }
      )
    }

    // Pagination
    const { searchParams } = new URL(request.url)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const pageSize = Math.max(parseInt(searchParams.get('pageSize') || '25', 10), 1)
    const skip = (page - 1) * pageSize

    // Récupérer les animaux de la clinique de l'utilisateur
    const [animals, total] = await Promise.all([
      prisma.animal.findMany({
      where: {
        clinic_id: profile.clinicId,
      },
      include: {
        owner: {
          select: {
            first_name: true,
            last_name: true,
          }
        }
      },
      orderBy: [
        { name: 'asc' }
        ],
        skip,
        take: pageSize,
      }),
      prisma.animal.count({ where: { clinic_id: profile.clinicId } })
    ])

    console.log('🔍 API /api/animals - Found animals:', animals.length, 'for clinic:', profile.clinicId)

    const formattedAnimals = animals.map(animal => ({
      id: animal.id,
      clinic_id: animal.clinic_id,
      owner_id: animal.owner_id,
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      gender: animal.gender,
      birth_date: animal.birth_date?.toISOString().split('T')[0],
      weight: animal.weight,
      color: animal.color,
      microchip: animal.microchip,
      tattoo: animal.tattoo,
      sterilized: animal.sterilized,
      sterilized_date: animal.sterilized_date?.toISOString().split('T')[0],
      allergies: animal.allergies,
      status: animal.status,
      notes: animal.notes,
      created_at: animal.created_at?.toISOString(),
      updated_at: animal.updated_at?.toISOString(),
      owner_name: `${animal.owner.first_name} ${animal.owner.last_name}`,
    }))

    return NextResponse.json({ animals: formattedAnimals, total, page, pageSize })

  } catch (error) {
    console.error('Erreur récupération animaux:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
