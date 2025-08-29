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
        veterinarian: true,
        invoices: {
          include: {
            items: true,
            owner: true
          }
        },
        files: true
      },
      orderBy: [{ appointment_date: 'asc' }],
    })

    const formatted = appointments.map((a) => {
      return {
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
          first_name: a.veterinarian.firstName,
          last_name: a.veterinarian.lastName,
          role: a.veterinarian.role
        } : null,
        // Facture incluse (prendre la première facture s'il y en a)
        invoice: a.invoices && a.invoices.length > 0 ? {
          id: a.invoices[0].id,
          invoice_number: a.invoices[0].invoice_number,
          total_amount: a.invoices[0].total_amount,
          payment_status: a.invoices[0].payment_status,
          payment_method: a.invoices[0].payment_method,
          paid_at: a.invoices[0].paid_at?.toISOString(),
          created_at: a.invoices[0].created_at?.toISOString() || new Date().toISOString(),
          updated_at: a.invoices[0].updated_at?.toISOString() || new Date().toISOString(),
          items: a.invoices[0].items.map(item => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            type: item.item_type || 'service'
          })),
          owner: a.invoices[0].owner ? {
            id: a.invoices[0].owner.id,
            first_name: a.invoices[0].owner.first_name,
            last_name: a.invoices[0].owner.last_name,
            email: a.invoices[0].owner.email
          } : null
        } : null,
        // Fichiers liés
        files: a.files ? a.files.map(file => ({
          id: file.id,
          filename: file.filename,
          original_name: file.original_name,
          size: file.file_size,
          mime_type: file.mime_type,
          uploaded_at: file.uploaded_at?.toISOString()
        })) : []
      }
    })

    return NextResponse.json({ appointments: formatted })
  } catch (error) {
    console.error('Erreur GET /api/appointments:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
