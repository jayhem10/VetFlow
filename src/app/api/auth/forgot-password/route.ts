import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { EmailService } from '@/lib/email'
import { generateTempPassword } from '@/lib/password'
import { hashPassword } from '@/lib/hash'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: {
          include: {
            clinic: true
          }
        }
      }
    })

    if (!user) {
      // Pour des raisons de sécurité, ne pas révéler si l'email existe ou non
      return NextResponse.json(
        { message: 'Si cet email existe dans notre base de données, vous recevrez un email de réinitialisation.' },
        { status: 200 }
      )
    }

    // Générer un mot de passe temporaire
    const tempPassword = generateTempPassword()
    const hashedPassword = await hashPassword(tempPassword)

    // Mettre à jour l'utilisateur avec le nouveau mot de passe temporaire
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
      }
    })

    // Envoyer l'email de réinitialisation
    try {
      console.log('🔍 Données utilisateur pour email:', {
        email: user.email,
        name: user.name,
        profile: user.profile,
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        clinicName: user.profile?.clinic?.name
      })

      // Vérifier que l'utilisateur a un profil
      if (!user.profile) {
        console.error('❌ Utilisateur sans profil:', user.email)
        // En mode développement, afficher le mot de passe temporaire
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 Mode développement - Mot de passe temporaire:', tempPassword)
          console.log('🔗 URL de connexion:', `${process.env.NEXTAUTH_URL}/login`)
        }
        return NextResponse.json(
          { message: 'Si cet email existe dans notre base de données, vous recevrez un email de réinitialisation.' },
          { status: 200 }
        )
      }

      // Utilise la méthode générique sendEmail tant que sendPasswordReset n'existe pas
      await EmailService.sendEmail({
        to: user.email,
        subject: 'Réinitialisation de mot de passe',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; line-height:1.6;">
            <h2>Réinitialisation de votre mot de passe</h2>
            <p>Bonjour ${user.profile.firstName || user.name || 'Utilisateur'} ${user.profile.lastName || ''},</p>
            <p>Un mot de passe temporaire a été généré pour votre compte.</p>
            <p><strong>Mot de passe temporaire:</strong> ${tempPassword}</p>
            <p>Veuillez vous connecter puis changer votre mot de passe immédiatement.</p>
            <p><a href="${process.env.NEXTAUTH_URL}/login">Se connecter</a></p>
            <p>Cordialement,<br>${user.profile.clinic?.name || 'VetFlow'}</p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Erreur envoi email mot de passe oublié:', emailError)
      
      // En mode développement, afficher le mot de passe temporaire
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Mode développement - Mot de passe temporaire:', tempPassword)
        console.log('🔗 URL de connexion:', `${process.env.NEXTAUTH_URL}/login`)
      }
      
      // En production, ne pas révéler l'erreur d'email
      return NextResponse.json(
        { message: 'Si cet email existe dans notre base de données, vous recevrez un email de réinitialisation.' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { message: 'Si cet email existe dans notre base de données, vous recevrez un email de réinitialisation.' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erreur mot de passe oublié:', error)
    
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
