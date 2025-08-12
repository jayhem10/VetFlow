import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    // Récupérer d'abord le profil pour obtenir le clinicId
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile || !profile.clinicId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Aucune clinique associée à ce profil' 
        },
        { status: 404 }
      )
    }

    // Récupérer la clinique
    const clinic = await prisma.clinic.findUnique({
      where: { id: profile.clinicId },
    })

    if (!clinic) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Clinique introuvable' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      clinic: {
        id: clinic.id,
        name: clinic.name,
        email: clinic.email || '',
        phone: clinic.phone || '',
        address: clinic.address || '',
        city: clinic.city || '',
        postalCode: clinic.postalCode || '',
        country: clinic.country || 'France',
        subscriptionPlan: clinic.subscriptionPlan || 'starter',
        subscriptionStatus: clinic.subscriptionStatus || 'trial',
        trial_ends_at: null, // TODO: Add trialEndsAt field to Clinic model
        settings: {
          timezone: 'Europe/Paris',
          language: 'fr',
          notifications: {
            email: true,
            sms: false,
          }
        },
        created_at: clinic.createdAt.toISOString(),
        updated_at: clinic.updatedAt.toISOString(),
      },
    })

  } catch (error) {
    console.error('Erreur récupération clinique:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération de la clinique' 
      },
      { status: 500 }
    )
  }
}