import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const createOwnerSchema = z.object({
  first_name: z.string().min(1).max(100, 'Prénom trop long (max 100 caractères)'),
  last_name: z.string().min(1).max(100, 'Nom trop long (max 100 caractères)'),
  email: z.string().email().max(255, 'Email trop long (max 255 caractères)').optional(),
  phone: z.string().max(20, 'Téléphone trop long (max 20 caractères)').optional(),
  mobile: z.string().max(20, 'Mobile trop long (max 20 caractères)').optional(),
  address: z.string().optional(),
  city: z.string().max(100, 'Ville trop longue (max 100 caractères)').optional(),
  postal_code: z.string().max(10, 'Code postal trop long (max 10 caractères)').optional(),
  country: z.string().length(2, 'Code pays doit faire 2 caractères (ex: FR)').optional(),
  preferred_contact: z.enum(['email', 'phone', 'mobile']).optional(),
  marketing_consent: z.boolean().optional(),
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
    const validatedData = createOwnerSchema.parse(body)

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

    const owner = await prisma.owner.create({
      data: {
        clinic_id: profile.clinicId, // Utiliser la clinique de l'utilisateur connecté
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        email: validatedData.email,
        phone: validatedData.phone,
        mobile: validatedData.mobile,
        address: validatedData.address,
        city: validatedData.city,
        postal_code: validatedData.postal_code,
        country: validatedData.country,
        preferred_contact: validatedData.preferred_contact,
        marketing_consent: validatedData.marketing_consent || false,
        notes: validatedData.notes,
      },
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
    console.error('Erreur création propriétaire:', error)
    
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