import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { z } from 'zod'

const updateInvoiceSchema = z.object({
  payment_status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).optional(),
  payment_method: z.enum(['cash', 'card', 'check', 'transfer', 'insurance']).optional().nullable(),
  paid_at: z.string().optional().nullable(),
  notes: z.string().optional(),
  due_date: z.string().optional().nullable(),
  items: z.array(z.object({
    id: z.string().optional(),
    description: z.string(),
    quantity: z.coerce.number(),
    unit_price: z.coerce.number(),
    total_price: z.coerce.number(),
    tax_rate: z.coerce.number().optional().nullable(),
    item_type: z.enum(['product', 'service']).optional().nullable(),
    product_id: z.string().optional().nullable(),
    service_id: z.string().optional().nullable(),
  })).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    const profile = await prisma.profile.findFirst({ 
      where: { userId: session.user.id },
      include: { user: true }
    })
    
    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Aucune clinique associée' }, { status: 404 })
    }

    // Vérifier les permissions
    const userRoles = profile.role ? profile.role.split(',').map(r => r.trim().toLowerCase()) : ['assistant']
    const hasInvoicePermission = userRoles.some(role => 
      hasPermission(role as any, 'invoices', 'read')
    )
    
    if (!hasInvoicePermission) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: id,
        clinic_id: profile.clinicId,
      },
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
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Erreur GET /api/invoices/[id]:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateInvoiceSchema.parse(body)

    const profile = await prisma.profile.findFirst({ 
      where: { userId: session.user.id },
      include: { user: true }
    })
    
    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Aucune clinique associée' }, { status: 404 })
    }

    // Vérifier les permissions
    const userRoles = profile.role ? profile.role.split(',').map(r => r.trim().toLowerCase()) : ['assistant']
    const hasInvoicePermission = userRoles.some(role => 
      hasPermission(role as any, 'invoices', 'update')
    )
    
    if (!hasInvoicePermission) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Vérifier que la facture existe et appartient à la clinique
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: id,
        clinic_id: profile.clinicId,
      },
      include: { items: true }
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }

    // Préparer les données de mise à jour
    const updateData: any = {}
    
    if (validatedData.payment_status !== undefined) {
      updateData.payment_status = validatedData.payment_status
    }
    
    if (validatedData.payment_method !== undefined) {
      updateData.payment_method = validatedData.payment_method
    }
    
    if (validatedData.paid_at !== undefined) {
      // Si on reçoit un paid_at invalide (ex: "+020025-..."), tenter de corriger, sinon mettre null
      const parsed = validatedData.paid_at ? new Date(validatedData.paid_at) : null
      updateData.paid_at = parsed && !isNaN(parsed.getTime()) ? parsed : null
    }

    // Sécurité: si statut = paid et aucune paid_at valide fournie, définir à maintenant
    if (validatedData.payment_status === 'paid' && (updateData.paid_at == null)) {
      updateData.paid_at = new Date()
    }
    
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes
    }
    
    if (validatedData.due_date !== undefined) {
      updateData.due_date = validatedData.due_date ? new Date(validatedData.due_date) : null
    }

    // Mettre à jour la facture
    const updatedInvoice = await prisma.invoice.update({
      where: { id: id },
      data: updateData,
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
    })

    // Mettre à jour les articles si fournis
    if (validatedData.items) {
      // Supprimer les anciens articles
      await prisma.invoiceItem.deleteMany({
        where: { invoice_id: id }
      })

      // Créer les nouveaux articles
      for (const item of validatedData.items) {
        await prisma.invoiceItem.create({
          data: {
            invoice_id: id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            item_type: item.item_type ?? undefined,
            product_id: item.product_id ?? undefined,
            service_id: item.service_id ?? undefined,
            tax_rate: item.tax_rate ?? undefined,
          }
        })
      }

      // Recalculer les totaux
      const newItems = await prisma.invoiceItem.findMany({
        where: { invoice_id: id }
      })

      const subtotal = newItems.reduce((sum, item) => sum + Number(item.total_price), 0)
      const taxAmount = subtotal * 0.20 // 20% TVA
      const totalAmount = subtotal + taxAmount

      await prisma.invoice.update({
        where: { id: id },
        data: {
          subtotal: subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
        }
      })
    }

    // Récupérer la facture mise à jour
    const finalInvoice = await prisma.invoice.findFirst({
      where: { id: id },
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
    })

    return NextResponse.json({ 
      invoice: finalInvoice,
      message: 'Facture mise à jour avec succès'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 })
    }
    console.error('Erreur PATCH /api/invoices/[id]:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
