import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const updateProfileSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.enum(['owner', 'vet', 'assistant', 'admin']).optional(),
  license_number: z.string().optional(),
  specialties: z.array(z.string()).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Vérifier que le profil existe et appartient à l'utilisateur connecté
    const existingProfile = await prisma.profile.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Profil non trouvé ou accès non autorisé' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (validatedData.first_name !== undefined) updateData.firstName = validatedData.first_name
    if (validatedData.last_name !== undefined) updateData.lastName = validatedData.last_name
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone
    if (validatedData.role !== undefined) updateData.role = validatedData.role
    if (validatedData.license_number !== undefined) updateData.licenseNumber = validatedData.license_number
    if (validatedData.specialties !== undefined) updateData.specialties = validatedData.specialties

    const profile = await prisma.profile.update({
      where: { id: id },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
          }
        }
      }
    })

    return NextResponse.json({
      profile: {
        id: profile.id,
        clinic_id: profile.clinicId,
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.user.email,
        phone: profile.phone,
        role: profile.role,
        license_number: profile.licenseNumber,
        specialties: profile.specialties,
        is_active: true,
        created_at: profile.createdAt.toISOString(),
        updated_at: profile.updatedAt.toISOString(),
      }
    })

  } catch (error) {
    console.error('Erreur mise à jour profil:', error)
    
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