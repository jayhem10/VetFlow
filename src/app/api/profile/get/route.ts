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

    // Récupérer le profil de l'utilisateur
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Aucun profil trouvé' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        clinic_id: profile.clinicId,
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: session.user.email, // Email vient de la session
        phone: profile.phone,
        role: profile.role,
        permissions: null, // TODO: Implement permissions system
        license_number: profile.licenseNumber,
        specialties: profile.specialties,
        is_active: true, // TODO: Add is_active field to profile model
        last_login_at: null, // TODO: Track last login
        registration_step: 'completed', // TODO: Add registration_step field
        created_at: profile.createdAt.toISOString(),
        updated_at: profile.updatedAt.toISOString(),
      },
    })

  } catch (error) {
    console.error('Erreur récupération profil:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération du profil' 
      },
      { status: 500 }
    )
  }
}