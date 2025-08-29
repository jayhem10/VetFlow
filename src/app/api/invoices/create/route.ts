import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { hasPermission } from '@/lib/permissions'
import { generateInvoiceNumber } from '@/lib/invoice-utils'

const invoiceItemSchema = z.object({
  item_type: z.enum(['product', 'service']),
  product_id: z.string().uuid().optional(),
  service_id: z.string().uuid().optional(),
  description: z.string(),
  quantity: z.number().positive(),
  unit_price: z.number().positive(),
  total_price: z.number().positive(),
})

const createInvoiceSchema = z.object({
  appointment_id: z.string().uuid(),
  items: z.array(invoiceItemSchema).min(1, 'Au moins un article requis'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const profile = await prisma.profile.findFirst({ 
      where: { userId: session.user.id },
      include: { user: true }
    })
    
    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Aucune clinique associée' }, { status: 404 })
    }

    // Vérifier les permissions (gestion multi-roles)
    const userRoles = (profile.role as string)?.split(',').map(r => r.trim()) || ['assistant']
    const hasInvoicePermission = userRoles.some(role => 
      hasPermission(role as any, 'invoices', 'create')
    )
    
    if (!hasInvoicePermission) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createInvoiceSchema.parse(body)

    // Vérifier que le rendez-vous existe et appartient à la clinique
    const appointment = await prisma.appointment.findFirst({
      where: { 
        id: validatedData.appointment_id,
        clinic_id: profile.clinicId 
      },
      include: {
        animal: {
          include: { owner: true }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Rendez-vous non trouvé' }, { status: 404 })
    }

    // Calculer les totaux
    const subtotal = validatedData.items.reduce((sum, item) => sum + item.total_price, 0)
    const taxRate = 20 // TVA par défaut
    const taxAmount = subtotal * (taxRate / 100)
    const totalAmount = subtotal + taxAmount

    // Générer un numéro de facture séquentiel avec la date du jour
    const invoiceNumber = await generateInvoiceNumber(profile.clinicId)

    // Créer la facture et les articles dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer la facture
      const invoice = await tx.invoice.create({
        data: {
          clinic_id: profile.clinicId,
          owner_id: appointment.animal.owner_id,
          appointment_id: validatedData.appointment_id,
          invoice_number: invoiceNumber,
          invoice_date: new Date(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
          subtotal: subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          payment_status: 'pending',
        }
      })

      // Créer les articles de facture
      const invoiceItems = await Promise.all(
        validatedData.items.map(item =>
          tx.invoiceItem.create({
            data: {
              invoice_id: invoice.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              tax_rate: taxRate,
              item_type: item.item_type,
              product_id: item.product_id,
              service_id: item.service_id,
            }
          })
        )
      )

      // Créer les mouvements de stock pour les produits
      const stockMovements = []
      for (const item of validatedData.items) {
        if (item.item_type === 'product' && item.product_id) {
          // Vérifier le stock disponible
          const product = await tx.Product.findFirst({
            where: { 
              id: item.product_id,
              clinic_id: profile.clinicId 
            }
          })

          if (!product) {
            throw new Error(`Produit ${item.product_id} non trouvé`)
          }

          if (product.stock_qty < item.quantity) {
            throw new Error(`Stock insuffisant pour ${product.name}`)
          }

          // Créer le mouvement de stock
          const movement = await tx.StockMovement.create({
            data: {
              clinic_id: profile.clinicId,
              product_id: item.product_id,
              type: 'out',
              quantity: item.quantity,
              reason: `Facture ${invoiceNumber}`,
              invoice_id: invoice.id,
            }
          })

          // Mettre à jour le stock
          await tx.Product.update({
            where: { id: item.product_id },
            data: { stock_qty: product.stock_qty - item.quantity }
          })

          stockMovements.push(movement)
        }
      }

      return { invoice, invoiceItems, stockMovements }
    })

    return NextResponse.json({
      message: 'Facture créée avec succès',
      invoice: result.invoice,
      items: result.invoiceItems,
      stockMovements: result.stockMovements
    })
  } catch (error) {
    console.error('Erreur POST /api/invoices/create:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
