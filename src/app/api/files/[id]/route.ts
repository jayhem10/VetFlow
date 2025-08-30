import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { R2StorageService } from '@/lib/r2-storage'

export async function DELETE(request: NextRequest, context: any) {
  try {
    const fileId = context?.params?.id as string
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer le profil utilisateur
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    })

    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Aucune clinique associée' }, { status: 404 })
    }

    // Vérifier les permissions
    const userRoles = profile.role ? profile.role.split(',').map(r => r.trim().toLowerCase()) : ['assistant']
    const hasFilePermission = userRoles.some(role => hasPermission(role as any, 'files', 'delete'))

    if (!hasFilePermission) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    // Récupérer le fichier
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        clinic_id: profile.clinicId
      }
    })

    if (!file) {
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 })
    }

    // Supprimer le fichier de R2
    try {
      await R2StorageService.deleteFile(file.filename)
    } catch (error) {
      console.error('Erreur suppression R2:', error)
      // Continuer même si la suppression R2 échoue
    }

    // Supprimer l'enregistrement de la base de données
    await prisma.file.delete({
      where: { id: fileId }
    })

    return NextResponse.json({
      message: 'Fichier supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur suppression fichier:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
