import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { z } from 'zod'

const updateClinicSchema = z.object({
  name: z.string().min(1, 'Le nom de la clinique est requis'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal(''))
})

export async function PATCH(request: NextRequest, context: any) {
  try {
    const clinicId = context?.params?.id as string
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer le profil utilisateur
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    })

    if (!profile?.clinicId || profile.clinicId !== clinicId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Vérifier les permissions
    const userRoles = profile.role ? profile.role.split(',').map(r => r.trim().toLowerCase()) : ['assistant']
    const hasClinicPermission = userRoles.some(role => hasPermission(role as any, 'clinic_settings', 'update'))

    if (!hasClinicPermission) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    // Valider les données
    const body = await request.json()
    const validatedData = updateClinicSchema.parse(body)

    // Mettre à jour la clinique
    const updatedClinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: {
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        postalCode: validatedData.postalCode || null,
        country: validatedData.country || null
      }
    })

    return NextResponse.json(updatedClinic)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Données invalides', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Erreur mise à jour clinique:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}