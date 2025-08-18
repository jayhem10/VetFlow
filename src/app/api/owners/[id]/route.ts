import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const updateOwnerSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional().or(z.literal('').transform(() => undefined)),
  phone: z.string().max(20).optional().or(z.literal('').transform(() => undefined)),
  mobile: z.string().max(20).optional().or(z.literal('').transform(() => undefined)),
  address: z.string().optional().or(z.literal('').transform(() => undefined)),
  city: z.string().max(100).optional().or(z.literal('').transform(() => undefined)),
  postal_code: z.string().max(10).optional().or(z.literal('').transform(() => undefined)),
  country: z.string().length(2).optional().or(z.literal('').transform(() => undefined)),
  preferred_contact: z.enum(['email', 'phone', 'mobile']).optional().or(z.literal('').transform(() => undefined)),
  marketing_consent: z.boolean().optional(),
  notes: z.string().optional().or(z.literal('').transform(() => undefined)),
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

    const owner = await prisma.owner.findFirst({
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

    if (!owner) {
      return NextResponse.json(
        { error: 'Propriétaire non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      owner: {
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
      }
    })

  } catch (error) {
    console.error('Erreur récupération propriétaire:', error)
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
    console.log('🔍 Update owner body received:', body)
    const validatedData = updateOwnerSchema.parse(body)
    console.log('✅ Validated data:', validatedData)

    // Vérifier que le propriétaire existe et que l'utilisateur y a accès
    const existingOwner = await prisma.owner.findFirst({
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

    if (!existingOwner) {
      return NextResponse.json(
        { error: 'Propriétaire non trouvé' },
        { status: 404 }
      )
    }

    // Ne mettre à jour que les champs définis
    const updateData: any = {}
    if (validatedData.first_name !== undefined) updateData.first_name = validatedData.first_name
    if (validatedData.last_name !== undefined) updateData.last_name = validatedData.last_name
    if (validatedData.email !== undefined) updateData.email = validatedData.email
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone
    if (validatedData.mobile !== undefined) updateData.mobile = validatedData.mobile
    if (validatedData.address !== undefined) updateData.address = validatedData.address
    if (validatedData.city !== undefined) updateData.city = validatedData.city
    if (validatedData.postal_code !== undefined) updateData.postal_code = validatedData.postal_code
    if (validatedData.country !== undefined) updateData.country = validatedData.country
    if (validatedData.preferred_contact !== undefined) updateData.preferred_contact = validatedData.preferred_contact
    if (validatedData.marketing_consent !== undefined) updateData.marketing_consent = validatedData.marketing_consent
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes

    const owner = await prisma.owner.update({
      where: { id: id },
      data: updateData,
    })

    return NextResponse.json({
      owner: {
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
      }
    })

  } catch (error) {
    console.error('Erreur mise à jour propriétaire:', error)
    
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

    // Vérifier que le propriétaire existe et que l'utilisateur y a accès
    const existingOwner = await prisma.owner.findFirst({
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

    if (!existingOwner) {
      return NextResponse.json(
        { error: 'Propriétaire non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer tous les animaux du propriétaire
    const animals = await prisma.animal.findMany({
      where: { owner_id: id },
      select: { id: true }
    })

    const animalIds = animals.map(animal => animal.id)

    // Supprimer en cascade toutes les données associées
    await prisma.$transaction(async (tx) => {
      // Supprimer les rappels liés aux animaux
      if (animalIds.length > 0) {
        await tx.reminder.deleteMany({
          where: { animal_id: { in: animalIds } }
        })

        // Supprimer les vaccinations liées aux animaux
        await tx.vaccination.deleteMany({
          where: { animal_id: { in: animalIds } }
        })

        // Supprimer les prescriptions liées aux animaux
        await tx.prescription.deleteMany({
          where: { animal_id: { in: animalIds } }
        })

        // Supprimer les dossiers médicaux liés aux animaux
        await tx.medicalRecord.deleteMany({
          where: { animal_id: { in: animalIds } }
        })

        // Supprimer les rendez-vous liés aux animaux
        await tx.appointment.deleteMany({
          where: { animal_id: { in: animalIds } }
        })

        // Supprimer les factures liées au propriétaire
        await tx.invoice.deleteMany({
          where: { owner_id: id }
        })

        // Supprimer les animaux
        await tx.animal.deleteMany({
          where: { owner_id: id }
        })
      }

      // Supprimer le propriétaire
      await tx.owner.delete({
        where: { id: id }
      })
    })

    return NextResponse.json({
      message: 'Propriétaire supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur suppression propriétaire:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}