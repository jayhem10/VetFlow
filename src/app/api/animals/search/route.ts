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

    // Récupérer le profil de l'utilisateur pour obtenir sa clinique
    const profile = await prisma.profile.findFirst({
      where: {
        userId: session.user.id,
      },
    })

    if (!profile || !profile.clinicId) {
      return NextResponse.json(
        { error: 'Aucune clinique associée à votre profil' },
        { status: 404 }
      )
    }

    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const species = searchParams.get('species')
    const ownerId = searchParams.get('ownerId')
    const status = searchParams.get('status')

    // Construire les conditions de recherche
    const whereConditions: any = {
      clinic_id: profile.clinicId,
    }

    if (query) {
      const isShort = query.trim().length < 3
      // Restrict search to name only (no breed/color)
      whereConditions.OR = isShort
        ? [{ name: { startsWith: query, mode: 'insensitive' } }]
        : [{ name: { contains: query, mode: 'insensitive' } }]
    }

    if (species) {
      whereConditions.species = species
    }

    if (ownerId) {
      whereConditions.owner_id = ownerId
    }

    if (status) {
      whereConditions.status = status
    }

    // Récupérer les animaux avec filtres
    const animals = await prisma.animal.findMany({
      where: whereConditions,
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
    })

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

    return NextResponse.json({
      animals: formattedAnimals
    })

  } catch (error) {
    console.error('Erreur recherche animaux:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
