import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { hasPermission } from '@/lib/permissions'

const serviceSchema = z.object({
  code: z.string().min(1, 'Code requis').max(50, 'Code trop long'),
  name: z.string().min(1, 'Nom requis').max(150, 'Nom trop long'),
  description: z.string().optional(),
  default_price: z.number().positive('Prix doit être positif'),
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
    const hasAccess = userRoles.some(role => hasPermission(role as any, 'services', 'read'))
    if (!hasAccess) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const services = await prisma.service.findMany({
      where: { 
        clinic_id: profile.clinicId
      },
      orderBy: [{ name: 'asc' }],
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Erreur GET /api/services:', error)
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
    const hasAccess = userRoles.some(role => hasPermission(role as any, 'services', 'create'))
    if (!hasAccess) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = serviceSchema.parse(body)

    // Vérifier que le code n'existe pas déjà
    const existingService = await prisma.service.findFirst({
      where: { 
        clinic_id: profile.clinicId,
        code: validatedData.code 
      }
    })

    if (existingService) {
      return NextResponse.json({ error: 'Un service avec ce code existe déjà' }, { status: 400 })
    }

    const service = await prisma.service.create({
      data: {
        ...validatedData,
        clinic_id: profile.clinicId,
      }
    })

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Erreur POST /api/services:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
