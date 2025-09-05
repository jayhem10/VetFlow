import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTrialStatus, calculateTrialStatus } from '@/lib/trial-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.profile?.clinicId) {
      return NextResponse.json(
        { error: 'Non autorisé - aucune clinique trouvée' },
        { status: 401 }
      )
    }

    const clinicId = session.user.profile.clinicId

    // Récupérer le statut trial de la clinique actuelle
    const trialStatus = await getTrialStatus(clinicId)

    // Tests avec différentes dates pour vérifier la logique
    const now = new Date()
    const testCases = [
      {
        name: "Trial dans 10 jours",
        trialEndDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        subscriptionStatus: 'trial'
      },
      {
        name: "Trial dans 3 jours (critique)",
        trialEndDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        subscriptionStatus: 'trial'
      },
      {
        name: "Trial expiré depuis 2 jours",
        trialEndDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        subscriptionStatus: 'trial'
      },
      {
        name: "Abonnement actif",
        trialEndDate: null,
        subscriptionStatus: 'active'
      }
    ]

    const testResults = testCases.map(testCase => ({
      ...testCase,
      result: calculateTrialStatus(testCase.subscriptionStatus, testCase.trialEndDate)
    }))

    return NextResponse.json({
      success: true,
      clinicId,
      currentTrialStatus: trialStatus,
      testResults,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur test trial:', error)
    return NextResponse.json(
      { error: 'Erreur lors du test' },
      { status: 500 }
    )
  }
}
