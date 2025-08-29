import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: appointmentId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer le profil utilisateur
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { clinic: true }
    })

    if (!profile || !profile.clinicId) {
      return NextResponse.json({ error: 'Profil ou clinique non trouvé' }, { status: 404 })
    }

    // Vérifier les permissions
    const userRoles = profile.role ? profile.role.split(',').map(r => r.trim().toLowerCase()) : ['assistant']
    const hasInvoicePermission = userRoles.some(role => hasPermission(role, 'invoices', 'read'))

    if (!hasInvoicePermission) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    // Vérifier si une facture existe déjà pour ce rendez-vous
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        appointment_id: appointmentId,
        clinic_id: profile.clinicId
      },
      include: {
        items: true,
        owner: true,
        appointment: {
          include: {
            animal: { include: { owner: true } },
            veterinarian: true,
          }
        }
      }
    })

    if (existingInvoice) {
      return NextResponse.json(existingInvoice)
    } else {
      return NextResponse.json({ error: 'Aucune facture trouvée' }, { status: 404 })
    }

  } catch (error) {
    console.error('Erreur vérification facture:', error)
    return NextResponse.json({ error: 'Erreur lors de la vérification' }, { status: 500 })
  }
}
