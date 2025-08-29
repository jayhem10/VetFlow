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
      include: { user: true }
    })
    
    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Aucune clinique associée' }, { status: 404 })
    }

    // Vérifier les permissions (gestion multi-roles)
    let userRoles: string[] = []
    
    if (profile.role) {
      userRoles = profile.role.split(',').map(r => r.trim().toLowerCase())
    }
    
    // Si pas de rôle défini ou rôles invalides, utiliser 'assistant' par défaut
    if (userRoles.length === 0 || !userRoles.some(role => ['admin', 'vet', 'assistant', 'stock_manager'].includes(role))) {
      userRoles = ['assistant']
    }
    
    console.log('Debug - Rôles utilisateur:', userRoles)
    
    const hasInvoicePermission = userRoles.some(role => {
      const hasPerm = hasPermission(role as any, 'invoices', 'read')
      console.log(`Debug - Rôle ${role} a permission invoices.read:`, hasPerm)
      return hasPerm
    })
    
    console.log('Debug - Permission finale invoices.read:', hasInvoicePermission)
    
    if (!hasInvoicePermission) {
      return NextResponse.json({ 
        error: 'Accès non autorisé',
        debug: {
          userRoles,
          clinicId: profile.clinicId,
          hasPermission: hasInvoicePermission
        }
      }, { status: 403 })
    }

    // Récupérer les paramètres de pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // Construire les filtres
    const where: any = {
      clinic_id: profile.clinicId
    }

    if (search) {
      where.OR = [
        { invoice_number: { contains: search, mode: 'insensitive' } },
        { appointment: { title: { contains: search, mode: 'insensitive' } } },
        { owner: { 
          OR: [
            { first_name: { contains: search, mode: 'insensitive' } },
            { last_name: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ]
    }

    if (status) {
      where.payment_status = status
    }

    // Récupérer les factures avec les relations
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
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
        },
        orderBy: { invoice_date: 'desc' },
        skip,
        take: limit
      }),
      prisma.invoice.count({ where })
    ])



    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erreur GET /api/invoices:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
