import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  try {
    const species = await prisma.species.findMany({
      where: { is_active: true },
      select: { id: true, name: true, category: true },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json({ species })
  } catch (error) {
    console.error('Erreur GET /api/species:', error)
    return NextResponse.json({ error: 'Erreur chargement espèces' }, { status: 500 })
  }
}


