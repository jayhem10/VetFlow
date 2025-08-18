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

    const { veterinarianId, appointmentDate, duration = 30, excludeAppointmentId } = await request.json()
    if (!veterinarianId || !appointmentDate || !duration) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const start = new Date(appointmentDate)
    const end = new Date(start.getTime() + duration * 60000)

    // Récupérer les RDV du vétérinaire le même jour
    const dayStart = new Date(start)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(start)
    dayEnd.setHours(23, 59, 59, 999)

    const sameDayAppointments = await prisma.appointment.findMany({
      where: {
        clinic_id: profile.clinicId,
        veterinarian_id: veterinarianId,
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        appointment_date: { gte: dayStart, lte: dayEnd }
      },
      select: { appointment_date: true, duration_minutes: true }
    })

    // Si aucun rendez-vous, c'est disponible
    if (sameDayAppointments.length === 0) {
      return NextResponse.json({ available: true })
    }

    const hasOverlap = sameDayAppointments.some((a) => {
      const aStart = new Date(a.appointment_date as unknown as Date)
      const aEnd = new Date(aStart.getTime() + ((a.duration_minutes as unknown as number) ?? 30) * 60000)
      return aStart < end && aEnd > start
    })

    return NextResponse.json({ available: !hasOverlap })
  } catch (error) {
    console.error('Erreur POST /api/appointments/availability:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}


