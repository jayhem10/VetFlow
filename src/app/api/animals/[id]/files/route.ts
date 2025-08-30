import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'

export async function GET(
  request: NextRequest,
  context: any
) {
  const animalId = context?.params?.id as string | undefined
  let clinicId: string | null = null
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const profile = await prisma.profile.findFirst({
      where: { userId: session.user.id },
      include: { user: true }
    })
    clinicId = profile?.clinicId ?? null
    
    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Aucune clinique associée' }, { status: 404 })
    }

    // Vérifier les permissions
    const userRoles = (profile.role as string)?.split(',').map(r => r.trim()) || ['assistant']
    const hasFilePermission = userRoles.some(role => 
      hasPermission(role as any, 'files', 'read')
    )
    
    if (!hasFilePermission) {
      return NextResponse.json({ error: 'Permission insuffisante' }, { status: 403 })
    }

    // Vérifier que l'animal existe et appartient à la clinique
    const animal = await prisma.animal.findFirst({
      where: { 
        id: animalId,
        clinic_id: profile.clinicId 
      }
    })

    if (!animal) {
      return NextResponse.json({ error: 'Animal non trouvé' }, { status: 404 })
    }

    // Récupérer les fichiers directement liés à l'animal ET ceux liés à ses rendez-vous
    const files = await prisma.file.findMany({
      where: {
        OR: [
          { animal_id: animalId },
          {
            appointment: {
              animal_id: animalId
            }
          }
        ],
        clinic_id: profile.clinicId
      },
      include: {
        appointment: {
          select: {
            id: true,
            appointment_date: true,
            title: true,
            description: true
          }
        }
      },
      orderBy: {
        uploaded_at: 'desc' // Du plus récent au plus ancien
      }
    })

    return NextResponse.json({ files })
  } catch (error) {
    console.error('Erreur GET /api/animals/[id]/files:', {
      error,
      animalId,
      clinicId,
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    })
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
