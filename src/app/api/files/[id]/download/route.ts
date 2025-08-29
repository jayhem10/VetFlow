import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { R2StorageService } from '@/lib/r2-storage'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id: fileId } = await params

    // Récupérer le profil pour avoir la clinicId et les rôles
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    })

    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Aucune clinique associée' }, { status: 403 })
    }

    // Vérifier permission lecture fichiers
    const userRoles = (profile.role || '').split(',').map(r => r.trim().toLowerCase()).filter(Boolean)
    const canRead = userRoles.length === 0 
      ? hasPermission('assistant', 'files', 'read') 
      : userRoles.some(role => hasPermission(role as any, 'files', 'read'))
    if (!canRead) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    // Récupérer le fichier et vérifier qu'il appartient à la clinique
    const file = await prisma.file.findFirst({
      where: { id: fileId, clinic_id: profile.clinicId }
    })

    if (!file) {
      return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
    }

    // Extraire la clé depuis l'URL stockée (ou utiliser tel quel si déjà une clé)
    let key = R2StorageService.extractKeyFromUrl(file.file_url)
    if (!key) {
      // Si file_url ressemble déjà à une clé (ex: files/clinicId/xxx.ext)
      key = file.file_url.startsWith('files/') ? file.file_url : null
    }

    if (!key) {
      return NextResponse.json({ error: 'Clé R2 introuvable pour ce fichier' }, { status: 500 })
    }

    // Générer une URL signée courte durée
    const signedUrl = await R2StorageService.getSignedDownloadUrl(key, 300)

    // Disposition du contenu: attachment par défaut, inline si demandé
    const { searchParams } = new URL(request.url)
    const disposition = searchParams.get('disposition') === 'inline' ? 'inline' : 'attachment'

    // Récupérer le binaire depuis R2 puis le renvoyer avec les bons headers
    const upstream = await fetch(signedUrl)
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Téléchargement impossible' }, { status: 502 })
    }

    const contentType = upstream.headers.get('content-type') || file.mime_type || 'application/octet-stream'
    const arrayBuffer = await upstream.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.length),
        'Content-Disposition': `${disposition}; filename="${encodeURIComponent(file.original_name)}"`,
        'Cache-Control': 'private, max-age=0, no-cache',
      }
    })

  } catch (error) {
    console.error('Erreur génération URL signée fichier:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération du lien' }, { status: 500 })
  }
}


