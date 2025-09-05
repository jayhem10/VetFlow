import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28',
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

    const { priceId, clinicId, planId, planName, planDescription, hasTrialPeriod } = await request.json()

    // Vérifier que l'utilisateur a accès à cette clinique
    if (session.user.profile.clinicId !== clinicId) {
      return NextResponse.json(
        { error: 'Accès interdit' },
        { status: 403 }
      )
    }

    // Récupérer les informations de la clinique
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      include: {
        profiles: {
          where: { isActive: true },
          include: { user: true },
          take: 1,
        },
      },
    })

    if (!clinic) {
      return NextResponse.json(
        { error: 'Clinique non trouvée' },
        { status: 404 }
      )
    }

    const userProfile = clinic.profiles[0]
    if (!userProfile?.user) {
      return NextResponse.json(
        { error: 'Profil utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Créer ou récupérer le customer Stripe
    let customerId = clinic.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userProfile.user.email,
        name: clinic.name,
        metadata: {
          clinicId: clinic.id,
          userId: userProfile.user.id,
        },
      })
      
      customerId = customer.id
      
      // Sauvegarder l'ID customer dans la base
      await prisma.clinic.update({
        where: { id: clinicId },
        data: { stripeCustomerId: customerId },
      })
    }

    // Créer la session de checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/payment?canceled=true`,
      metadata: {
        clinicId,
        planId,
        planName,
        planDescription,
        userId: userProfile.user.id,
      },
      subscription_data: {
        metadata: {
          clinicId,
          planId,
          planName,
          planDescription,
          userId: userProfile.user.id,
        },
        // Ajouter une période d'essai seulement si l'utilisateur est encore en trial
        ...(hasTrialPeriod && {
          trial_period_days: 0, // Pas de trial supplémentaire, juste continuer
        }),
      },
    })

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })

  } catch (error) {
    console.error('Erreur création session checkout:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    )
  }
}
