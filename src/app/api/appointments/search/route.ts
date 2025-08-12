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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const veterinarianId = searchParams.get('veterinarian_id') || undefined
    const animalId = searchParams.get('animal_id') || undefined

    const where: any = { clinicId: profile.clinicId }
    if (status) where.status = status
    if (veterinarianId) where.veterinarianId = veterinarianId
    if (animalId) where.animalId = animalId

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: [{ appointmentDate: 'asc' }],
    })

    const formatted = appointments.map((a) => ({
      id: a.id,
      clinic_id: a.clinicId,
      animal_id: a.animalId,
      veterinarian_id: a.veterinarianId,
      title: a.title,
      description: a.description || undefined,
      appointment_date: a.appointmentDate.toISOString(),
      duration_minutes: a.durationMinutes || undefined,
      appointment_type: a.appointmentType as any,
      priority: a.priority as any,
      status: a.status as any,
      notes: a.notes || undefined,
      internal_notes: a.internalNotes || undefined,
      reminder_sent: a.reminderSent || undefined,
      reminder_sent_at: a.reminderSentAt?.toISOString(),
      created_at: a.createdAt.toISOString(),
      updated_at: a.updatedAt.toISOString(),
    }))

    return NextResponse.json({ appointments: formatted })
  } catch (error) {
    console.error('Erreur GET /api/appointments/search:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
