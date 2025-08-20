import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { hasPermission } from '@/lib/permissions'

const updateServiceSchema = z.object({
  code: z.string().min(1, 'Code requis').max(50, 'Code trop long').optional(),
  name: z.string().min(1, 'Nom requis').max(150, 'Nom trop long').optional(),
  description: z.string().optional(),
  default_price: z.number().positive('Prix doit être positif').optional(),
  tax_rate: z.number().min(0).max(100).optional(),
  active: z.boolean().optional(),
})

export async function PATCH(
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
    const hasAccess = userRoles.some(role => hasPermission(role as any, 'services', 'update'))
    if (!hasAccess) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const serviceId = params.id
    const body = await request.json()
    const validatedData = updateServiceSchema.parse(body)

    // Vérifier que le service existe et appartient à la clinique
    const existingService = await prisma.service.findFirst({
      where: { 
        id: serviceId,
        clinic_id: profile.clinicId 
      }
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Service non trouvé' }, { status: 404 })
    }

    // Vérifier que le code n'existe pas déjà (si modifié)
    if (validatedData.code && validatedData.code !== existingService.code) {
      const codeExists = await prisma.service.findFirst({
        where: { 
          clinic_id: profile.clinicId,
          code: validatedData.code,
          id: { not: serviceId }
        }
      })

      if (codeExists) {
        return NextResponse.json({ error: 'Un service avec ce code existe déjà' }, { status: 400 })
      }
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: validatedData
    })

    return NextResponse.json({ service: updatedService })
  } catch (error) {
    console.error('Erreur PATCH /api/services/[id]:', error)
    
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
    const hasAccess = userRoles.some(role => hasPermission(role as any, 'services', 'delete'))
    if (!hasAccess) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const serviceId = params.id

    // Vérifier que le service existe et appartient à la clinique
    const existingService = await prisma.service.findFirst({
      where: { 
        id: serviceId,
        clinic_id: profile.clinicId 
      }
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Service non trouvé' }, { status: 404 })
    }

    // Soft delete - désactiver le service
    const deletedService = await prisma.service.update({
      where: { id: serviceId },
      data: { active: false }
    })

    return NextResponse.json({ service: deletedService })
  } catch (error) {
    console.error('Erreur DELETE /api/services/[id]:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
