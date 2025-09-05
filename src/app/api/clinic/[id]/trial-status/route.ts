import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTrialStatus } from '@/lib/trial-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.profile?.clinicId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id: clinicId } = await params

    // Vérifier que l'utilisateur a accès à cette clinique
    if (session.user.profile.clinicId !== clinicId) {
      return NextResponse.json(
        { error: 'Accès interdit' },
        { status: 403 }
      )
    }

    // Récupérer le statut trial
    const trialStatus = await getTrialStatus(clinicId)

    return NextResponse.json({
      success: true,
      trialStatus,
    })

  } catch (error) {
    console.error('Erreur récupération statut trial:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
