import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const updateClinicSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
})

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
    const validatedData = updateClinicSchema.parse(body)

    // Vérifier que l'utilisateur a accès à cette clinique
    const profile = await prisma.profile.findFirst({
      where: {
        userId: session.user.id,
        clinicId: id,
        role: {
          in: ['admin', 'vet', 'owner'] // Propriétaires, vétérinaires et admins peuvent modifier la clinique
        }
      },
    })
    
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette clinique' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.email !== undefined) updateData.email = validatedData.email
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone
    if (validatedData.address !== undefined) updateData.address = validatedData.address
    if (validatedData.city !== undefined) updateData.city = validatedData.city
    if (validatedData.postalCode !== undefined) updateData.postalCode = validatedData.postalCode
    if (validatedData.country !== undefined) updateData.country = validatedData.country

    const clinic = await prisma.clinic.update({
      where: { id: id },
      data: updateData,
    })

    return NextResponse.json({
      clinic: {
        id: clinic.id,
        name: clinic.name,
        email: clinic.email,
        phone: clinic.phone,
        address: clinic.address,
        city: clinic.city,
        postalCode: clinic.postalCode,
        country: clinic.country,
        subscriptionPlan: clinic.subscriptionPlan,
        subscriptionStatus: clinic.subscriptionStatus,
        created_at: clinic.createdAt.toISOString(),
        updated_at: clinic.updatedAt.toISOString(),
      }
    })

  } catch (error) {
    console.error('Erreur mise à jour clinique:', error)
    
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