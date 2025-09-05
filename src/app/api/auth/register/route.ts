import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { EmailService } from '@/lib/email'

// Schema de validation pour l'inscription
const signUpSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données
    const { email, password } = signUpSchema.parse(body)
    const normalizedEmail = email.trim().toLowerCase()

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
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
    const hashedPassword = await hash(password, 12)

    // Créer uniquement l'utilisateur (sans Profile ni Clinic)
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: normalizedEmail.split('@')[0], // Nom temporaire basé sur l'email
      },
    })

    // Créer un token de vérification valable 24h
    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await prisma.verificationToken.create({
      data: { identifier: normalizedEmail, token, expires },
    })

    // Envoyer l'email de vérification
    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?email=${encodeURIComponent(normalizedEmail)}&token=${encodeURIComponent(token)}`
    const contentHtml = `
      <p>Bonjour,</p>
      <p>Merci de votre inscription sur VetFlow. Veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous:</p>
      <p><a href="${verifyUrl}">Confirmer mon email</a></p>
      <p>Ce lien est valable 24 heures.</p>
    `
    await EmailService.sendTemplatedEmail({
      to: normalizedEmail,
      subject: 'Confirmez votre email - VetFlow',
      title: 'Confirmer votre adresse email',
      preheader: 'Validez votre email pour activer votre compte VetFlow',
      htmlContent: contentHtml,
    })

    return NextResponse.json({
      success: true,
      message: 'Compte créé. Vérifiez votre email pour confirmer votre compte.',
      redirectTo: '/login?verify=sent',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,

      },
    })

  } catch (error) {
    console.error('Erreur inscription:', error)
    
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