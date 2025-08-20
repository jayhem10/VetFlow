import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { hasPermission } from '@/lib/permissions'

const stockMovementSchema = z.object({
  type: z.enum(['in', 'out', 'adjust']),
  quantity: z.number().positive('Quantité doit être positive'),
  reason: z.string().optional(),
  appointment_id: z.string().uuid().optional(),
  invoice_id: z.string().uuid().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Vérifier les permissions - gérer les rôles multiples
    const userRoles = profile.role ? profile.role.split(',').map(r => r.trim()) : ['assistant']
    const hasAccess = userRoles.some(role => hasPermission(role as any, 'stock', 'create'))
    if (!hasAccess) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const productId = params.id
    const body = await request.json()
    const validatedData = stockMovementSchema.parse(body)

    // Vérifier que le produit existe et appartient à la clinique
    const product = await prisma.product.findFirst({
      where: { 
        id: productId,
        clinic_id: profile.clinicId 
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
    }

    // Vérifier le stock disponible pour les sorties
    if (validatedData.type === 'out' && product.stock_qty < validatedData.quantity) {
      return NextResponse.json({ 
        error: 'Stock insuffisant',
        available: product.stock_qty,
        requested: validatedData.quantity
      }, { status: 400 })
    }

    // Effectuer le mouvement de stock dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer le mouvement de stock
      const movement = await tx.stockMovement.create({
        data: {
          clinic_id: profile.clinicId,
          product_id: productId,
          type: validatedData.type,
          quantity: validatedData.quantity,
          reason: validatedData.reason,
          appointment_id: validatedData.appointment_id,
          invoice_id: validatedData.invoice_id,
        }
      })

      // Mettre à jour le stock du produit
      let newStock = product.stock_qty
      switch (validatedData.type) {
        case 'in':
          newStock += validatedData.quantity
          break
        case 'out':
          newStock -= validatedData.quantity
          break
        case 'adjust':
          newStock = validatedData.quantity
          break
      }

      await tx.product.update({
        where: { id: productId },
        data: { stock_qty: newStock }
      })

      return movement
    })

    return NextResponse.json({ 
      movement: result,
      newStock: result.type === 'adjust' ? validatedData.quantity : 
                result.type === 'in' ? product.stock_qty + validatedData.quantity :
                product.stock_qty - validatedData.quantity
    })
  } catch (error) {
    console.error('Erreur POST /api/products/[id]/stock:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
