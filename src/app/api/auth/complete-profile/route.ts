import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validation pour la complétion de profil
const completeProfileSchema = z.object({
  phone: z.string().optional(),
  country: z.string().optional(),
  clinicEmail: z.string().email().optional(),
  clinicPhone: z.string().optional(),
  clinicAddress: z.string().optional(),
  clinicCity: z.string().optional(),
  clinicPostalCode: z.string().optional(),
  subscriptionPlan: z.string().optional(),
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
    const profileData = completeProfileSchema.parse(body)

    // Mettre à jour le profil
    await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        phone: profileData.phone,
      },
    })

    // Mettre à jour ou créer la clinique
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { clinic: true },
    })

    if (existingProfile?.clinic) {
      await prisma.clinic.update({
        where: { id: existingProfile.clinic.id },
        data: {
          email: profileData.clinicEmail,
          phone: profileData.clinicPhone,
          address: profileData.clinicAddress,
          city: profileData.clinicCity,
          postalCode: profileData.clinicPostalCode,
          subscriptionPlan: profileData.subscriptionPlan || 'starter',
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Profil complété avec succès',
      redirectTo: '/dashboard',
    })

  } catch (error) {
    console.error('Erreur complétion profil:', error)
    
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
        error: 'Erreur lors de la complétion du profil' 
      },
      { status: 500 }
    )
  }
}