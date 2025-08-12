import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validation pour la création de profil
const createProfileSchema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  phone: z.string().optional(),
  role: z.enum(['owner', 'vet', 'assistant', 'admin']).optional(),
  license_number: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  clinic_id: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Non authentifié' 
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const profileData = createProfileSchema.parse(body)

    // Vérifier si l'utilisateur a déjà un profil
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (existingProfile) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Un profil existe déjà pour cet utilisateur' 
        },
        { status: 400 }
      )
    }

    // Créer le profil
    const profile = await prisma.profile.create({
      data: {
        userId: session.user.id,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        phone: profileData.phone,
        role: profileData.role,
        licenseNumber: profileData.license_number,
        specialties: profileData.specialties,
        clinicId: profileData.clinic_id,
      },
    })

    // Mettre à jour le nom de l'utilisateur
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: `${profileData.first_name} ${profileData.last_name}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Profil créé avec succès',
      profile: {
        id: profile.id,
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: profile.phone,
        role: profile.role,
        license_number: profile.licenseNumber,
        specialties: profile.specialties,
        clinic_id: profile.clinicId,
      },
    })

  } catch (error) {
    console.error('Erreur création profil:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données invalides',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la création du profil' 
      },
      { status: 500 }
    )
  }
}