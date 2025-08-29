import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: appointmentId } = await params
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
    const hasFilePermission = userRoles.some(role => hasPermission(role, 'files', 'read'))

    if (!hasFilePermission) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    // Vérifier que le rendez-vous appartient à la clinique
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        clinic_id: profile.clinicId
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Rendez-vous non trouvé' }, { status: 404 })
    }

    // Récupérer les fichiers du rendez-vous
    const files = await prisma.file.findMany({
      where: {
        appointment_id: appointmentId,
        clinic_id: profile.clinicId
      },
      orderBy: {
        uploaded_at: 'desc'
      }
    })

    // Formater les fichiers pour la réponse
    const formattedFiles = files.map(file => ({
      id: file.id,
      filename: file.filename,
      originalName: file.original_name,
      url: file.file_url,
      size: file.file_size,
      mimeType: file.mime_type,
      uploadedAt: file.uploaded_at,
    }))

    return NextResponse.json({
      files: formattedFiles,
      count: files.length
    })

  } catch (error) {
    console.error('Erreur récupération fichiers:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 })
  }
}
