import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/hash'
import { authOptions } from '@/lib/auth'
import { canManageCollaborators } from '@/lib/auth-utils'
import { EmailService } from '@/lib/email'
import { generateTempPassword } from '@/lib/password'

const inviteSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role: z.enum(['vet', 'assistant']),
  is_admin: z.boolean().optional().default(false),
  calendar_color: z.enum(['emerald','blue','purple','rose','amber','lime','cyan','fuchsia','indigo','teal']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = inviteSchema.parse(body)

    // Déterminer la clinique depuis le profil du user couracnt
    const currentProfile = await prisma.profile.findFirst({ where: { userId: session.user.id } })
    if (!currentProfile?.clinicId) {
      return NextResponse.json({ error: 'Aucune clinique associée' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est autorisé (admin, owner ou vet)
    if (!canManageCollaborators(currentProfile.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({ where: { email: validatedData.email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Un utilisateur avec cet email existe déjà' }, { status: 400 })
    }

    // Récupérer les informations de la clinique et de l'inviteur
    const clinic = await prisma.clinic.findUnique({
      where: { id: currentProfile.clinicId },
      select: { name: true }
    })

    if (!clinic) {
      return NextResponse.json({ error: 'Clinique introuvable' }, { status: 404 })
    }

    // Générer un mot de passe temporaire sécurisé
    const tempPassword = generateTempPassword()
    const hashedPassword = await hashPassword(tempPassword)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: `${validatedData.first_name} ${validatedData.last_name}`,
        mustChangePassword: true, // Forcer le changement de mot de passe
      }
    })

    // Construire le rôle final (rôle de base + admin si demandé)
    const finalRole = validatedData.is_admin ? `${validatedData.role},admin` : validatedData.role

    // Créer le profil
    const newProfile = await prisma.profile.create({
      data: {
        userId: user.id,
        firstName: validatedData.first_name,
        lastName: validatedData.last_name,
        role: finalRole,
        clinicId: currentProfile.clinicId,
        calendarColor: validatedData.calendar_color || null,
      }
    })

    // Envoyer l'email d'invitation
    try {
      const loginUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login`
      const inviterName = `${currentProfile.firstName} ${currentProfile.lastName}`

      await EmailService.sendCollaboratorInvitation({
        email: validatedData.email,
        firstName: validatedData.first_name,
        lastName: validatedData.last_name,
        tempPassword,
        clinicName: clinic.name,
        inviterName,
        loginUrl
      })

      console.log(`Email d'invitation envoyé à ${validatedData.email}`)
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError)
      // Supprimer l'utilisateur créé si l'email échoue
      await prisma.user.delete({ where: { id: user.id } })
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email d\'invitation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Invitation envoyée avec succès',
      collaborator: {
        id: newProfile.id,
        email: user.email,
        first_name: newProfile.firstName,
        last_name: newProfile.lastName,
        role: newProfile.role,
        calendar_color: newProfile.calendarColor || null,
        is_active: true,
        created_at: newProfile.createdAt.toISOString(),
      }
    })

  } catch (error) {
    console.error('Erreur invitation collaborateur:', error)
    
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