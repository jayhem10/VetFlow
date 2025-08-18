import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { canManageCollaborators } from '@/lib/auth-utils'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { profileId } = await params

    // Récupérer le profil à supprimer
    const targetProfile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { user: true }
    })

    if (!targetProfile) {
      return NextResponse.json(
        { error: 'Collaborateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur actuel a les droits sur cette clinique
    const currentUserProfile = await prisma.profile.findFirst({
      where: {
        userId: session.user.id,
        clinicId: targetProfile.clinicId,
      },
    })

    if (!currentUserProfile) {
      return NextResponse.json(
        { error: 'Profil utilisateur non trouvé' },
        { status: 404 }
      )
    }

    console.log("ROLE!!!!!", currentUserProfile.role, currentUserProfile)
    // Vérifier que l'utilisateur a les droits (owner, admin ou vet)
    if (!canManageCollaborators(currentUserProfile.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé - Seuls les propriétaires, vétérinaires et admins peuvent supprimer des collaborateurs' },
        { status: 403 }
      )
    }

    // Ne pas permettre de se supprimer soi-même
    if (targetProfile.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous supprimer vous-même' },
        { status: 400 }
      )
    }

    console.log('🔍 Suppression collaborateur:', { profileId, userId: targetProfile.userId })
    
    // Supprimer le profil et l'utilisateur
    try {
      await prisma.$transaction(async (tx) => {
        // Vérifier s'il y a des données liées
        const appointments = await tx.appointment.count({
          where: { veterinarian_id: profileId }
        })
        const medicalRecords = await tx.medicalRecord.count({
          where: { veterinarian_id: profileId }
        })
        const prescriptions = await tx.prescription.count({
          where: { veterinarian_id: profileId }
        })
        const vaccinations = await tx.vaccination.count({
          where: { veterinarian_id: profileId }
        })
        
        console.log('📊 Données liées:', { appointments, medicalRecords, prescriptions, vaccinations })
        
        // Supprimer les données liées en premier
        if (appointments > 0) {
          await tx.appointment.deleteMany({
            where: { veterinarian_id: profileId }
          })
        }
        
        if (medicalRecords > 0) {
          await tx.medicalRecord.deleteMany({
            where: { veterinarian_id: profileId }
          })
        }
        
        if (prescriptions > 0) {
          await tx.prescription.deleteMany({
            where: { veterinarian_id: profileId }
          })
        }
        
        if (vaccinations > 0) {
          await tx.vaccination.deleteMany({
            where: { veterinarian_id: profileId }
          })
        }
        
        // Maintenant supprimer le profil
        await tx.profile.delete({
          where: { id: profileId }
        })
      })
      console.log('✅ Suppression réussie')
    } catch (transactionError) {
      console.error('❌ Erreur transaction:', transactionError)
      throw transactionError
    }

    return NextResponse.json({
      message: 'Collaborateur supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur suppression collaborateur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}