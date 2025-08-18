import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const profile = await prisma.profile.findFirst({ where: { userId: session.user.id } })
    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Aucune clinique associée' }, { status: 404 })
    }

    const body = await request.json()
    const {
      animal_id,
      veterinarian_id,
      title,
      description,
      appointment_date,
      duration_minutes = 30,
      appointment_type = 'consultation',
      priority = 'normal',
      notes,
      internal_notes,
    } = body

    if (!animal_id || !veterinarian_id || !title || !appointment_date) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const created = await prisma.appointment.create({
      data: {
        clinic_id: profile.clinicId,
        animal_id,
        veterinarian_id,
        title,
        description: description || null,
        appointment_date: new Date(appointment_date),
        duration_minutes: duration_minutes,
        appointment_type: appointment_type,
        priority,
        notes: notes || null,
        internal_notes: internal_notes || null,
      }
    })

    return NextResponse.json({ appointment: {
      id: created.id,
      clinic_id: created.clinic_id,
      animal_id: created.animal_id,
      veterinarian_id: created.veterinarian_id,
      title: created.title,
      description: created.description || undefined,
      appointment_date: created.appointment_date.toISOString(),
      duration_minutes: created.duration_minutes || undefined,
      appointment_type: created.appointment_type as any,
      priority: created.priority as any,
      status: created.status as any,
      notes: created.notes || undefined,
      internal_notes: created.internal_notes || undefined,
      created_at: created.created_at?.toISOString() || new Date().toISOString(),
      updated_at: created.updated_at?.toISOString() || new Date().toISOString(),
    }})
  } catch (error) {
    console.error('Erreur POST /api/appointments/create:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}


