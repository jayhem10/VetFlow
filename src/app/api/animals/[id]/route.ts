import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const updateAnimalSchema = z.object({
  name: z.string().min(1).optional(),
  species: z.string().min(1).optional(),
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
  status: z.enum(['active', 'deceased', 'inactive']).optional(),
  deceased_date: z.string().optional(),
  notes: z.string().optional(),
  owner_id: z.string().uuid().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params

    const animal = await prisma.animal.findFirst({
      where: {
        id: id,
        clinic: {
          profiles: {
            some: {
              userId: session.user.id
            }
          }
        }
      },
      include: {
        owner: {
          select: {
            first_name: true,
            last_name: true,
          }
        }
      }
    })

    if (!animal) {
      return NextResponse.json(
        { error: 'Animal non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      animal: {
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
      }
    })

  } catch (error) {
    console.error('Erreur récupération animal:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateAnimalSchema.parse(body)

    // Vérifier que l'animal existe et que l'utilisateur y a accès
    const existingAnimal = await prisma.animal.findFirst({
      where: {
        id: id,
        clinic: {
          profiles: {
            some: {
              userId: session.user.id
            }
          }
        }
      },
    })

    if (!existingAnimal) {
      return NextResponse.json(
        { error: 'Animal non trouvé' },
        { status: 404 }
      )
    }

    // Si owner_id est fourni, vérifier qu'il existe et appartient à la même clinique
    if (validatedData.owner_id) {
      const owner = await prisma.owner.findFirst({
        where: {
          id: validatedData.owner_id,
          clinic_id: existingAnimal.clinic_id,
        },
      })

      if (!owner) {
        return NextResponse.json(
          { error: 'Propriétaire non trouvé ou non autorisé' },
          { status: 404 }
        )
      }
    }

    // Construction des updates avec champs snake_case
    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.species !== undefined) updateData.species = validatedData.species
    if (validatedData.breed !== undefined) updateData.breed = validatedData.breed
    if (validatedData.gender !== undefined) updateData.gender = validatedData.gender
    if (validatedData.birth_date !== undefined) {
      updateData.birth_date = validatedData.birth_date ? new Date(validatedData.birth_date) : null
    }
    if (validatedData.weight !== undefined) updateData.weight = validatedData.weight
    if (validatedData.color !== undefined) updateData.color = validatedData.color
    if (validatedData.microchip !== undefined) updateData.microchip = validatedData.microchip
    if (validatedData.tattoo !== undefined) updateData.tattoo = validatedData.tattoo
    if (validatedData.sterilized !== undefined) updateData.sterilized = validatedData.sterilized
    if (validatedData.sterilized_date !== undefined) {
      updateData.sterilized_date = validatedData.sterilized_date ? new Date(validatedData.sterilized_date) : null
    }
    if (validatedData.allergies !== undefined) updateData.allergies = validatedData.allergies
    if (validatedData.deceased_date !== undefined) {
      updateData.deceased_date = validatedData.deceased_date ? new Date(validatedData.deceased_date) : null
      // Règle métier: si une date de décès est fournie et aucun statut explicite, passer en inactif
      if (validatedData.status === undefined) {
        updateData.status = 'inactive'
      }
    }
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes
    if (validatedData.owner_id !== undefined) updateData.owner_id = validatedData.owner_id

    const animal = await prisma.animal.update({
      where: { id: id },
      data: updateData,
      include: {
        owner: {
          select: {
            first_name: true,
            last_name: true,
          }
        }
      }
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
      }
    })

  } catch (error) {
    console.error('Erreur mise à jour animal:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Vérifier que l'animal existe et que l'utilisateur y a accès
    const existingAnimal = await prisma.animal.findFirst({
      where: {
        id: id,
        clinic: {
          profiles: {
            some: {
              userId: session.user.id
            }
          }
        }
      },
    })

    if (!existingAnimal) {
      return NextResponse.json(
        { error: 'Animal non trouvé' },
        { status: 404 }
      )
    }

    await prisma.animal.delete({
      where: { id: id }
    })

    return NextResponse.json({
      message: 'Animal supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur suppression animal:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}