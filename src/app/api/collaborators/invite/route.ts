import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/hash'
import { authOptions } from '@/lib/auth'

const inviteSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role: z.enum(['vet', 'assistant']),
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

    // Déterminer la clinique depuis le profil du user courant
    const currentProfile = await prisma.profile.findFirst({ where: { userId: session.user.id } })
    if (!currentProfile?.clinicId) {
      return NextResponse.json({ error: 'Aucune clinique associée' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est autorisé (admin, owner ou vet)
    if (!['admin', 'owner', 'vet'].includes(currentProfile.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({ where: { email: validatedData.email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Un utilisateur avec cet email existe déjà' }, { status: 400 })
    }

    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await hashPassword(tempPassword)

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: `${validatedData.first_name} ${validatedData.last_name}`,
      }
    })

    const newProfile = await prisma.profile.create({
      data: {
        userId: user.id,
        firstName: validatedData.first_name,
        lastName: validatedData.last_name,
        role: validatedData.role,
        clinicId: currentProfile.clinicId,
      }
    })

    console.log(`Invitation sent to ${validatedData.email} with temp password: ${tempPassword}`)

    return NextResponse.json({
      message: 'Invitation envoyée avec succès',
      collaborator: {
        id: newProfile.id,
        email: user.email,
        first_name: newProfile.firstName,
        last_name: newProfile.lastName,
        role: newProfile.role,
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