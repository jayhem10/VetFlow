import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { R2StorageService } from '@/lib/r2-storage'

export async function DELETE(request: NextRequest, context: any) {
  try {
    const clinicId = context?.params?.id as string
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const profile = await prisma.profile.findFirst({
      where: { userId: session.user.id }
    })

    if (!profile?.clinicId || profile.clinicId !== clinicId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Vérifier les permissions
    const userRoles = profile.role ? profile.role.split(',').map(r => r.trim().toLowerCase()) : ['assistant']
    const hasClinicPermission = userRoles.some(role => hasPermission(role as any, 'clinic_settings', 'update'))

    if (!hasClinicPermission) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    // Récupérer la clinique pour obtenir l'URL du logo actuel
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId }
    })

    if (clinic?.logo_url) {
      // Extraire la clé R2 de l'URL du logo
      const logoKey = R2StorageService.extractLogoKeyFromUrl(clinic.logo_url)
      
      if (logoKey) {
        // Supprimer le logo de R2
        try {
          await R2StorageService.deleteLogo(logoKey)
        } catch (error) {
          console.error('Erreur suppression logo R2:', error)
          // Continuer même si la suppression R2 échoue
        }
      }
    }

    // Supprimer le logo (mettre à null)
    await prisma.clinic.update({
      where: { id: clinicId },
      data: { logo_url: null }
    })

    return NextResponse.json({
      message: 'Logo supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur suppression logo:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
