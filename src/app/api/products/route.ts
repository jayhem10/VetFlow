import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { hasPermission } from '@/lib/permissions'

const productSchema = z.object({
  sku: z.string().min(1, 'SKU requis').max(50, 'SKU trop long'),
  name: z.string().min(1, 'Nom requis').max(150, 'Nom trop long'),
  unit: z.string().min(1, 'Unité requise').max(20, 'Unité trop longue'),
  stock_qty: z.number().min(0, 'Stock doit être positif'),
  low_stock_threshold: z.number().min(0, 'Seuil doit être positif'),
  price: z.number().positive('Prix doit être positif'),
  tax_rate: z.number().min(0).max(100).optional(),
  active: z.boolean().optional().default(true),
})

export async function GET(request: NextRequest) {
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
    const hasAccess = userRoles.some(role => hasPermission(role as any, 'products', 'read'))
    if (!hasAccess) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const products = await prisma.product.findMany({
      where: { 
        clinic_id: profile.clinicId
      },
      orderBy: [{ name: 'asc' }],
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Erreur GET /api/products:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

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

    // Vérifier les permissions - gérer les rôles multiples
    const userRoles = profile.role ? profile.role.split(',').map(r => r.trim()) : ['assistant']
    const hasAccess = userRoles.some(role => hasPermission(role as any, 'products', 'create'))
    if (!hasAccess) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = productSchema.parse(body)

    // Vérifier que le SKU n'existe pas déjà
    const existingProduct = await prisma.product.findFirst({
      where: { 
        clinic_id: profile.clinicId,
        sku: validatedData.sku 
      }
    })

    if (existingProduct) {
      return NextResponse.json({ error: 'Un produit avec ce SKU existe déjà' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        clinic_id: profile.clinicId,
      }
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Erreur POST /api/products:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
