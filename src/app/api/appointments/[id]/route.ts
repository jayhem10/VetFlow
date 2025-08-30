import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const profile = await prisma.profile.findFirst({ where: { userId: session.user.id } })
    if (!profile?.clinicId) return NextResponse.json({ error: 'Aucune clinique associée' }, { status: 404 })

    const id = context?.params?.id as string
    const body = await request.json()

    const apt = await prisma.appointment.findFirst({ where: { id, clinic_id: profile.clinicId } })
    if (!apt) return NextResponse.json({ error: 'Rendez-vous introuvable' }, { status: 404 })

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        title: body.title ?? apt.title,
        description: body.description ?? apt.description,
        appointment_date: body.appointment_date ? new Date(body.appointment_date) : apt.appointment_date,
        duration_minutes: body.duration_minutes ?? apt.duration_minutes,
        appointment_type: body.appointment_type ?? apt.appointment_type,
        priority: body.priority ?? apt.priority,
        status: body.status ?? apt.status,
        notes: body.notes ?? apt.notes,
        internal_notes: body.internal_notes ?? apt.internal_notes,
        animal_id: body.animal_id ?? apt.animal_id,
        veterinarian_id: body.veterinarian_id ?? apt.veterinarian_id,
      }
    })

    return NextResponse.json({ appointment: {
      id: updated.id,
      clinic_id: updated.clinic_id,
      animal_id: updated.animal_id,
      veterinarian_id: updated.veterinarian_id,
      title: updated.title,
      description: updated.description || undefined,
      appointment_date: updated.appointment_date.toISOString(),
      duration_minutes: updated.duration_minutes || undefined,
      appointment_type: updated.appointment_type as any,
      priority: updated.priority as any,
      status: updated.status as any,
      notes: updated.notes || undefined,
      internal_notes: updated.internal_notes || undefined,
      created_at: updated.created_at?.toISOString() || new Date().toISOString(),
      updated_at: updated.updated_at?.toISOString() || new Date().toISOString(),
    }})
  } catch (error) {
    console.error('Erreur PATCH /api/appointments/[id]:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const profile = await prisma.profile.findFirst({ where: { userId: session.user.id } })
    if (!profile?.clinicId) return NextResponse.json({ error: 'Aucune clinique associée' }, { status: 404 })

    const id = context?.params?.id as string
    const apt = await prisma.appointment.findFirst({ where: { id, clinic_id: profile.clinicId } })
    if (!apt) return NextResponse.json({ error: 'Rendez-vous introuvable' }, { status: 404 })

    await prisma.appointment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur DELETE /api/appointments/[id]:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}


