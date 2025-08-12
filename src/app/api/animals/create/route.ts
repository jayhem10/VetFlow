import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const createAnimalSchema = z.object({
  owner_id: z.string().uuid(),
  name: z.string().min(1),
  species: z.string().min(1),
  breed: z.string().optional(),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
  birth_date: z.string().optional(),
  weight: z.number().positive().optional(),
  color: z.string().optional(),
  microchip: z.string().optional(),
  tattoo: z.string().optional(),
  sterilized: z.boolean().optional(),
  sterilized_date: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createAnimalSchema.parse(body)

    // 1) Récupérer le propriétaire et sa clinique
    const owner = await prisma.owner.findUnique({
      where: { id: validatedData.owner_id },
      select: { id: true, clinic_id: true }
    })

    if (!owner) {
      return NextResponse.json(
        { error: 'Propriétaire non trouvé' },
        { status: 404 }
      )
    }

    // 2) Vérifier que l'utilisateur a un profil pour cette clinique
    const authorizedProfile = await prisma.profile.findFirst({
      where: {
        userId: session.user.id,
        clinicId: owner.clinic_id,
      }
    })

    if (!authorizedProfile) {
      return NextResponse.json(
        { error: 'Accès non autorisé à la clinique du propriétaire' },
        { status: 403 }
      )
    }

    // 3) Créer l'animal en forçant la clinique du propriétaire
    const animal = await prisma.animal.create({
      data: {
        clinic_id: owner.clinic_id,
        owner_id: validatedData.owner_id,
        name: validatedData.name,
        species: validatedData.species,
        breed: validatedData.breed,
        gender: validatedData.gender,
        birth_date: validatedData.birth_date ? new Date(validatedData.birth_date) : null,
        weight: validatedData.weight,
        color: validatedData.color,
        microchip: validatedData.microchip,
        tattoo: validatedData.tattoo,
        sterilized: validatedData.sterilized || false,
        sterilized_date: validatedData.sterilized_date ? new Date(validatedData.sterilized_date) : null,
        allergies: validatedData.allergies,
        status: 'active',
        notes: validatedData.notes,
      },
    })

    return NextResponse.json({
      animal: {
        id: animal.id,
        clinic_id: animal.clinic_id,
        owner_id: animal.owner_id,
        name: animal.name,
        species: animal.species,
        breed: animal.breed,
        gender: animal.gender,
        birth_date: animal.birth_date?.toISOString(),
        weight: animal.weight,
        color: animal.color,
        microchip: animal.microchip,
        tattoo: animal.tattoo,
        sterilized: animal.sterilized,
        sterilized_date: animal.sterilized_date?.toISOString(),
        allergies: animal.allergies,
        status: animal.status,
        notes: animal.notes,
        created_at: animal.created_at?.toISOString(),
        updated_at: animal.updated_at?.toISOString(),
      }
    })

  } catch (error) {
    console.error('Erreur création animal:', error)
    
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