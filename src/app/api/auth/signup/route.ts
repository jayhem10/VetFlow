import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validation pour l'inscription complète
const signUpCompleteSchema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  clinicName: z.string().min(1, 'Nom de clinique requis'),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données
    const data = signUpCompleteSchema.parse(body)

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Un compte avec cet email existe déjà' 
        },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(data.password, 12)

    // Utiliser une transaction pour garantir la cohérence
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer l'utilisateur
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: `${data.first_name} ${data.last_name}`,
        },
      })

      // 2. Créer la clinique
      const clinic = await tx.clinic.create({
        data: {
          name: data.clinicName,
          subscriptionPlan: 'starter',
          subscriptionStatus: 'trial',
        },
      })

      // 3. Créer le profil et l'associer à la clinique
      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          firstName: data.first_name,
          lastName: data.last_name,
          phone: data.phone,
          clinicId: clinic.id,
        },
      })

      return { user, clinic, profile }
    })

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      redirectTo: '/dashboard',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,

      },
    })

  } catch (error) {
    console.error('Erreur inscription complète:', error)
    
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
        error: 'Erreur lors de la création du compte' 
      },
      { status: 500 }
    )
  }
}