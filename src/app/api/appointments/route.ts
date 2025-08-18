import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const profile = await prisma.profile.findFirst({ where: { userId: session.user.id } })
    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Aucune clinique associée' }, { status: 404 })
    }

    const appointments = await prisma.appointment.findMany({
      where: { clinic_id: profile.clinicId },
      include: {
        animal: {
          include: {
            owner: true
          }
        },
        veterinarian: true
      },
      orderBy: [{ appointment_date: 'asc' }],
    })

    const formatted = appointments.map((a) => ({
      id: a.id,
      clinic_id: a.clinic_id,
      animal_id: a.animal_id,
      veterinarian_id: a.veterinarian_id,
      title: a.title,
      description: a.description || undefined,
      appointment_date: a.appointment_date.toISOString(),
      duration_minutes: a.duration_minutes || undefined,
      appointment_type: a.appointment_type as any,
      priority: a.priority as any,
      status: a.status as any,
      notes: a.notes || undefined,
      internal_notes: a.internal_notes || undefined,
      reminder_sent: a.reminder_sent || undefined,
      reminder_sent_at: a.reminder_sent_at?.toISOString(),
      created_at: a.created_at?.toISOString() || new Date().toISOString(),
      updated_at: a.updated_at?.toISOString() || new Date().toISOString(),
      // Données enrichies
      animal: a.animal ? {
        id: a.animal.id,
        name: a.animal.name,
        species: a.animal.species,
        breed: a.animal.breed,
        owner: a.animal.owner ? {
          id: a.animal.owner.id,
          first_name: a.animal.owner.first_name,
          last_name: a.animal.owner.last_name,
          email: a.animal.owner.email,
          phone: a.animal.owner.phone
        } : null
      } : null,
      veterinarian: a.veterinarian ? {
        id: a.veterinarian.id,
        first_name: a.veterinarian.first_name,
        last_name: a.veterinarian.last_name,
        role: a.veterinarian.role
      } : null
    }))

    return NextResponse.json({ appointments: formatted })
  } catch (error) {
    console.error('Erreur GET /api/appointments:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
