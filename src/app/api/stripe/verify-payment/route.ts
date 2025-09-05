import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Stripe from 'stripe'
import { activateSubscription } from '@/lib/trial-utils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.profile?.clinicId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID manquant' },
        { status: 400 }
      )
    }

    // Récupérer la session Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Paiement non confirmé' },
        { status: 400 }
      )
    }

    const clinicId = checkoutSession.metadata?.clinicId
    const planId = checkoutSession.metadata?.planId

    if (!clinicId || !planId) {
      return NextResponse.json(
        { error: 'Métadonnées manquantes' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur a accès à cette clinique
    if (session.user.profile.clinicId !== clinicId) {
      return NextResponse.json(
        { error: 'Accès interdit' },
        { status: 403 }
      )
    }

    const subscription = checkoutSession.subscription as Stripe.Subscription

    // Activer l'abonnement dans la base de données
    await activateSubscription(
      clinicId,
      planId,
      checkoutSession.customer as string,
      subscription.id
    )

    return NextResponse.json({
      success: true,
      message: 'Abonnement activé avec succès',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_end: (subscription as any).current_period_end,
      },
    })

  } catch (error) {
    console.error('Erreur vérification paiement:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du paiement' },
      { status: 500 }
    )
  }
}
