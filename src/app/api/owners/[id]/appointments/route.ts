import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
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

    const { id: ownerId } = await params

    // Vérifier que l'utilisateur a accès à cette clinique
    const profile = await prisma.profile.findFirst({
      where: { userId: session.user.id }
    })

    if (!profile?.clinicId) {
      return NextResponse.json(
        { error: 'Aucune clinique associée' },
        { status: 404 }
      )
    }

    // Vérifier que le propriétaire appartient à la clinique
    const owner = await prisma.owner.findFirst({
      where: {
        id: ownerId,
        clinic_id: profile.clinicId
      }
    })

    if (!owner) {
      return NextResponse.json(
        { error: 'Propriétaire non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer tous les rendez-vous des animaux de ce propriétaire
    const appointments = await prisma.appointment.findMany({
      where: {
        animal: {
          owner_id: ownerId,
          clinic_id: profile.clinicId
        }
      },
      include: {
        animal: {
          include: {
            owner: true
          }
        },
        veterinarian: true
      },
      orderBy: [
        { appointment_date: 'desc' } // Du plus récent au plus ancien
      ]
    })

    console.log('Appointments found:', appointments.length)
    console.log('Sample appointment veterinarian:', appointments[0]?.veterinarian)
    
    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      clinic_id: appointment.clinic_id,
      animal_id: appointment.animal_id,
      veterinarian_id: appointment.veterinarian_id,
      title: appointment.title,
      description: appointment.description || undefined,
      appointment_date: appointment.appointment_date.toISOString(),
      duration_minutes: appointment.duration_minutes || undefined,
      appointment_type: appointment.appointment_type as any,
      priority: appointment.priority as any,
      status: appointment.status as any,
      notes: appointment.notes || undefined,
      internal_notes: appointment.internal_notes || undefined,
      reminder_sent: appointment.reminder_sent || undefined,
      reminder_sent_at: appointment.reminder_sent_at?.toISOString(),
      created_at: appointment.created_at?.toISOString() || new Date().toISOString(),
      updated_at: appointment.updated_at?.toISOString() || new Date().toISOString(),
      // Données enrichies
      animal: appointment.animal ? {
        id: appointment.animal.id,
        name: appointment.animal.name,
        species: appointment.animal.species,
        breed: appointment.animal.breed,
        owner: appointment.animal.owner ? {
          id: appointment.animal.owner.id,
          first_name: appointment.animal.owner.first_name,
          last_name: appointment.animal.owner.last_name,
          email: appointment.animal.owner.email,
          phone: appointment.animal.owner.phone
        } : null
      } : null,
      veterinarian: appointment.veterinarian ? {
        id: appointment.veterinarian.id,
        first_name: appointment.veterinarian.firstName,
        last_name: appointment.veterinarian.lastName,
        role: appointment.veterinarian.role
      } : null
    }))

    console.log('Sample formatted veterinarian:', formattedAppointments[0]?.veterinarian)

    return NextResponse.json({ 
      appointments: formattedAppointments,
      total: formattedAppointments.length
    })

  } catch (error) {
    console.error('Erreur récupération rendez-vous propriétaire:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
