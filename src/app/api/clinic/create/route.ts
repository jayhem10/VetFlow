import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validation pour la création de clinique
const createClinicSchema = z.object({
  name: z.string().min(1, 'Nom de clinique requis'),
  email: z.string().email('Email invalide').optional(),
  phone: z.string()
    .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,'Format de téléphone français invalide')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().regex(/^[0-9]{5}$/,'Code postal français invalide (5 chiffres)').optional().or(z.literal('')),
  country: z.string().optional(),
  legalForm: z.enum(['EI','EURL','SARL','SASU','SAS','SELARL','SCM','Association']).optional().or(z.literal('')),
  siret: z.string().regex(/^\d{14}$/,'SIRET invalide (14 chiffres)').optional().or(z.literal('')),
  tvaNumber: z.string().regex(/^FR[0-9A-Z]{2}\d{9}$/,'Numéro TVA FR invalide').optional().or(z.literal('')),
  nafCode: z.string().regex(/^[A-Z]{1}\d{2}\.\d[A-Z]?$/,'Code NAF/APE invalide (ex: 75.00Z)').optional().or(z.literal('')),
  iban: z.string().regex(/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/,'IBAN invalide').optional().or(z.literal('')),
  bic: z.string().regex(/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/,'BIC/SWIFT invalide').optional().or(z.literal('')),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
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
        legalForm: clinicData.legalForm || undefined,
        siret: clinicData.siret || undefined,
        tvaNumber: clinicData.tvaNumber || undefined,
        nafCode: clinicData.nafCode || undefined,
        iban: clinicData.iban || undefined,
        bic: clinicData.bic || undefined,
        website: clinicData.website || undefined,
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