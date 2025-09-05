import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validation pour la création de clinique
const createClinicSchema = z.object({
  name: z.string().min(1, 'Nom de clinique requis'),
  email: z.string().email('Email invalide').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  subscription_plan: z.enum(['starter', 'professional', 'clinic']).default('starter'),
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
    const clinicData = createClinicSchema.parse(body)

    // Vérifier que l'utilisateur a un profil
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vous devez d\'abord créer votre profil' 
        },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur a déjà une clinique
    if (profile.clinicId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vous avez déjà une clinique associée' 
        },
        { status: 400 }
      )
    }

    // Créer la clinique avec période d'essai de 14 jours
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 14) // Ajouter 14 jours
    
    console.log('🏥 Création clinique avec période d\'essai jusqu\'au:', trialEndDate.toISOString())

    const clinic = await prisma.clinic.create({
      data: {
        name: clinicData.name,
        email: clinicData.email,
        phone: clinicData.phone,
        address: clinicData.address,
        city: clinicData.city,
        postalCode: clinicData.postalCode,
        country: clinicData.country,
        subscriptionPlan: clinicData.subscription_plan,
        subscriptionStatus: 'trial',
        trialEndDate: trialEndDate, // Initialiser la fin d'essai à 14 jours
      },
    })

    // Associer la clinique au profil de l'utilisateur et lui donner le rôle admin
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        clinicId: clinic.id,
        role: profile.role ? `${profile.role},admin` : 'admin',
      },
    })

    // Marquer le user comme profil complété (profil + clinique OK)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileCompleted: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Clinique créée avec succès',
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
      },
    })

  } catch (error) {
    console.error('Erreur création clinique:', error)
    
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
        error: 'Erreur lors de la création de la clinique' 
      },
      { status: 500 }
    )
  }
}