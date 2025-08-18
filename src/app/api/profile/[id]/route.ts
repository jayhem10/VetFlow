import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const updateProfileSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.string().refine((val) => {
    if (!val) return true // Rôle optionnel
    const roles = val.split(',').map(r => r.trim())
    const validRoles = ['owner', 'vet', 'assistant', 'admin']
    return roles.every(role => validRoles.includes(role))
  }, 'Rôles invalides').optional(),
  license_number: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  calendar_color: z.enum(['emerald','blue','purple','rose','amber','lime','cyan','fuchsia','indigo','teal']).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Vérifier que le profil existe et appartient à l'utilisateur connecté
    const existingProfile = await prisma.profile.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        clinic: true
      }
    })

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Profil non trouvé ou accès non autorisé' },
        { status: 404 }
      )
    }

    // Vérifier si l'utilisateur est le créateur de la clinique
    const isClinicCreator = existingProfile.clinic && 
      existingProfile.createdAt <= existingProfile.clinic.createdAt

    // Protection du rôle admin pour le créateur de la clinique
    if (validatedData.role !== undefined && isClinicCreator) {
      const currentRoles = existingProfile.role ? existingProfile.role.split(',').map(r => r.trim()) : []
      const newRoles = validatedData.role ? validatedData.role.split(',').map(r => r.trim()) : []
      
      // S'assurer que le rôle admin est conservé pour le créateur
      if (currentRoles.includes('admin') && !newRoles.includes('admin')) {
        return NextResponse.json(
          { error: 'Le créateur de la clinique ne peut pas retirer son rôle d\'administrateur' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (validatedData.first_name !== undefined) updateData.firstName = validatedData.first_name
    if (validatedData.last_name !== undefined) updateData.lastName = validatedData.last_name
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone
    if (validatedData.role !== undefined) updateData.role = validatedData.role
    if (validatedData.license_number !== undefined) updateData.licenseNumber = validatedData.license_number
    if (validatedData.specialties !== undefined) updateData.specialties = validatedData.specialties
    if (validatedData.calendar_color !== undefined) updateData.calendarColor = validatedData.calendar_color

    // Mettre à jour le profil
    const updatedProfile = await prisma.profile.update({
      where: { id: id },
      data: updateData,
      include: {
        clinic: true,
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedProfile.id,
        first_name: updatedProfile.firstName,
        last_name: updatedProfile.lastName,
        phone: updatedProfile.phone,
        role: updatedProfile.role,
        license_number: updatedProfile.licenseNumber,
        specialties: updatedProfile.specialties,
        calendar_color: updatedProfile.calendarColor,
        clinic_id: updatedProfile.clinicId,
        created_at: updatedProfile.createdAt?.toISOString(),
        updated_at: updatedProfile.updatedAt?.toISOString(),
        user: updatedProfile.user
      }
    })

  } catch (error) {
    console.error('Erreur mise à jour profil:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}