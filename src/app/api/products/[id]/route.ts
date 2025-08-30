import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { hasPermission } from '@/lib/permissions'

const updateProductSchema = z.object({
  sku: z.string().min(1, 'SKU requis').max(50, 'SKU trop long').optional(),
  name: z.string().min(1, 'Nom requis').max(150, 'Nom trop long').optional(),
  unit: z.string().min(1, 'Unité requise').max(20, 'Unité trop longue').optional(),
  stock_qty: z.number().min(0, 'Stock doit être positif').optional(),
  low_stock_threshold: z.number().min(0, 'Seuil doit être positif').optional(),
  price: z.number().positive('Prix doit être positif').optional(),
  tax_rate: z.number().min(0).max(100).optional(),
  active: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  context: any
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
    const hasAccess = userRoles.some(role => hasPermission(role as any, 'products', 'update'))
    if (!hasAccess) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const productId = context?.params?.id as string
    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)

    // Vérifier que le produit existe et appartient à la clinique
    const existingProduct = await prisma.product.findFirst({
      where: { 
        id: productId,
        clinic_id: profile.clinicId 
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
    }

    // Vérifier que le SKU n'existe pas déjà (si modifié)
    if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findFirst({
        where: { 
          clinic_id: profile.clinicId,
          sku: validatedData.sku,
          id: { not: productId }
        }
      })

      if (skuExists) {
        return NextResponse.json({ error: 'Un produit avec ce SKU existe déjà' }, { status: 400 })
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: validatedData
    })

    return NextResponse.json({ product: updatedProduct })
  } catch (error) {
    console.error('Erreur PATCH /api/products/[id]:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: any
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
    const hasAccess = userRoles.some(role => hasPermission(role as any, 'products', 'delete'))
    if (!hasAccess) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const productId = context?.params?.id as string

    // Vérifier que le produit existe et appartient à la clinique
    const existingProduct = await prisma.product.findFirst({
      where: { 
        id: productId,
        clinic_id: profile.clinicId 
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
    }

    // Soft delete - désactiver le produit
    const deletedProduct = await prisma.product.update({
      where: { id: productId },
      data: { active: false }
    })

    return NextResponse.json({ product: deletedProduct })
  } catch (error) {
    console.error('Erreur DELETE /api/products/[id]:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
