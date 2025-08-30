import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const profile = await prisma.profile.findFirst({ 
      where: { userId: session.user.id },
      include: { user: true, clinic: true }
    })
    
    if (!profile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
    }

    // Vérifier les permissions (gestion multi-roles)
    const userRoles = (profile.role as string)?.split(',').map(r => r.trim()) || ['assistant']
    
    // Si pas de rôle défini, utiliser 'assistant' par défaut
    if (!profile.role || userRoles.length === 0) {
      userRoles.push('assistant')
    }
    
    const hasInvoicePermission = userRoles.some(role => 
      hasPermission(role as any, 'invoices', 'read')
    )

    // Vérifier les factures dans la base
    const invoices = profile.clinicId ? await prisma.invoice.findMany({
      where: { clinic_id: profile.clinicId },
      include: {
        appointment: {
          include: {
            animal: {
              include: { owner: true }
            }
          }
        },
        owner: true,
        items: true
      }
    }) : []

    return NextResponse.json({
      debug: {
        session: {
          userId: session.user.id,
          email: session.user.email
        },
        profile: {
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          role: profile.role,
          clinicId: profile.clinicId,
          userRoles: userRoles,
          hasInvoicePermission: hasInvoicePermission
        },
        clinic: profile.clinic ? {
          id: profile.clinic.id,
          name: profile.clinic.name
        } : null,
        permissions: {
          invoices_read: hasInvoicePermission,
          roles_checked: userRoles,
          permission_results: userRoles.map(role => ({
            role,
            has_invoice_read: hasPermission(role as any, 'invoices', 'read')
          }))
        },
        invoices: {
          count: invoices.length,
          data: invoices.map(invoice => ({
            id: invoice.id,
            invoice_number: invoice.invoice_number,
            clinic_id: invoice.clinic_id,
            payment_status: invoice.payment_status
          }))
        }
      }
    })
  } catch (error) {
    console.error('Erreur debug profile:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
