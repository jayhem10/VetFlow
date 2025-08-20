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

    // Récupérer le profil à désactiver
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
        { error: 'Accès non autorisé - Seuls les propriétaires, vétérinaires et admins peuvent désactiver des collaborateurs' },
        { status: 403 }
      )
    }

    // Ne pas permettre de se désactiver soi-même
    if (targetProfile.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous désactiver vous-même' },
        { status: 400 }
      )
    }

    console.log('🔍 Désactivation collaborateur:', { profileId, userId: targetProfile.userId })
    
    // Soft delete : désactiver le profil sans supprimer les données
    try {
      await prisma.$transaction(async (tx) => {
        // Vérifier s'il y a des données liées (pour information)
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
        
        console.log('📊 Données liées conservées:', { appointments, medicalRecords, prescriptions, vaccinations })
        
        // Désactiver le profil (soft delete)
        await tx.profile.update({
          where: { id: profileId },
          data: {
            isActive: false,
            deactivatedAt: new Date()
          }
        })
      })
      console.log('✅ Désactivation réussie')
    } catch (transactionError) {
      console.error('❌ Erreur transaction:', transactionError)
      throw transactionError
    }

    return NextResponse.json({
      message: 'Collaborateur désactivé avec succès - Les données médicales et rendez-vous sont conservés'
    })

  } catch (error) {
    console.error('Erreur désactivation collaborateur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}