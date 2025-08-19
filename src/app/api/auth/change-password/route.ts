import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/hash'
import { authOptions } from '@/lib/auth'
import { validatePassword } from '@/lib/password'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(1, 'Nouveau mot de passe requis'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = changePasswordSchema.parse(body)

    // Récupérer l'utilisateur avec son mot de passe hashé
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      )
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await verifyPassword(validatedData.currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Mot de passe actuel incorrect' },
        { status: 400 }
      )
    }

    // Valider le nouveau mot de passe
    const passwordValidation = validatePassword(validatedData.newPassword)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Le nouveau mot de passe ne respecte pas les critères de sécurité',
          details: passwordValidation.errors
        },
        { status: 400 }
      )
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    const isNewPasswordSame = await verifyPassword(validatedData.newPassword, user.password)
    if (isNewPasswordSame) {
      return NextResponse.json(
        { error: 'Le nouveau mot de passe doit être différent de l\'actuel' },
        { status: 400 }
      )
    }

    // Hasher et sauvegarder le nouveau mot de passe
    const hashedNewPassword = await hashPassword(validatedData.newPassword)
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        password: hashedNewPassword,
        mustChangePassword: false // L'utilisateur a changé son mot de passe
      }
    })

    console.log(`Mot de passe modifié pour l'utilisateur ${session.user.id}`)

    return NextResponse.json({
      message: 'Mot de passe modifié avec succès'
    })

  } catch (error) {
    console.error('Erreur changement mot de passe:', error)
    
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
