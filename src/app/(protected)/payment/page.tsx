'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import { CheckCircle, Zap, Building, Crown, Loader2 } from 'lucide-react'
import { toast } from '@/lib/toast'
import { useTrialStatus } from '@/hooks/useTrialStatus'

interface PricingPlan {
  id: string
  name: string
  price: number
  currency: string
  interval: 'month' | 'year'
  description: string
  features: string[]
  recommended?: boolean
  icon: React.ComponentType<{ className?: string }>
  stripePrice: string
}

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    currency: 'EUR',
    interval: 'month',
    description: 'Cabinets individuels',
    features: [
      'Planning (1 praticien)',
      'Clients: 1 000 inclus',
      'Animaux: 2 000 inclus',
      'Factures PDF + envoi email',
      'Documents patients (1 Go)'
    ],
    icon: Zap,
    stripePrice: 'price_starter_monthly',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    currency: 'EUR',
    interval: 'month',
    description: 'Cliniques & équipes',
    features: [
      'Planning (jusqu’à 5 praticiens)',
      'Clients: 10 000 inclus',
      'Animaux: illimités',
      'Inventaire & seuils',
      'Rôles & permissions',
      'Exports & rapports',
      'Documents patients (10 Go)'
    ],
    recommended: true,
    icon: Building,
    stripePrice: 'price_pro_monthly',
  },
]

export default function PaymentPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { daysLeft, isExpired, isInTrial } = useTrialStatus()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!session?.user?.profile?.clinicId) {
      toast.error('Erreur: Clinique non trouvée')
      return
    }

    setLoading(plan.id)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePrice,
          clinicId: session.user.profile.clinicId,
          planId: plan.id,
          planName: plan.name,
          planDescription: plan.description,
          hasTrialPeriod: isInTrial && !isExpired,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session')
      }

      const { url } = await response.json()
      
      if (url) {
        // Rediriger vers Stripe Checkout
        window.location.href = url
      } else {
        throw new Error('URL de redirection manquante')
      }

    } catch (error) {
      console.error('Erreur checkout:', error)
      toast.error('Erreur lors de la redirection vers le paiement')
    } finally {
      setLoading(null)
    }
  }

  const handleTestCheckout = async () => {
    try {
      setLoading('test')
      const response = await fetch('/api/stripe/test-checkout', { method: 'POST' })
      const data = await response.json()
      if (!response.ok || !data.url) throw new Error('Erreur création session test')
      window.location.href = data.url
    } catch (e) {
      toast.error('Erreur lors de la redirection vers le paiement test')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {isExpired ? 'Votre période d\'essai a expiré' : 'Choisissez votre abonnement'}
          </h1>
          
          {isExpired ? (
            <p className="text-lg text-red-600 dark:text-red-400 mb-4">
              Pour continuer à utiliser VetFlow, veuillez souscrire à un abonnement.
            </p>
          ) : isInTrial ? (
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              Il vous reste <span className="font-semibold text-blue-600 dark:text-blue-400">{daysLeft} jour{daysLeft > 1 ? 's' : ''}</span> de période d'essai.
              <br />
              Souscrivez maintenant pour éviter toute interruption de service.
            </p>
          ) : (
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              Choisissez le plan qui correspond le mieux à vos besoins.
            </p>
          )}
        </div>

        {/* Plans de tarification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isLoading = loading === plan.id

            return (
              <Card 
                key={plan.id}
                variant="pricing"
                className={
                  plan.recommended
                    ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/30 border-2 border-green-500 dark:border-green-400 transform scale-105 shadow-2xl p-8'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 p-8'
                }
                hover={false}
              >
                {plan.recommended && (
                  <div className="text-center mb-4">
                    <span className="bg-green-700 dark:bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      ⭐ Le plus populaire
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {plan.price}€
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      /{plan.interval === 'month' ? 'mois' : 'an'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isLoading}
                  className={`w-full ${plan.recommended ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  variant={plan.recommended ? 'default' : 'outline'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Redirection...
                    </>
                  ) : (
                    'Choisir ce plan'
                  )}
                </Button>
              </Card>
            )
          })}
        </div>

        {/* Bouton test 1€ (développement) */}
        <div className="text-center mb-8">
          <Button onClick={handleTestCheckout} variant="outline" className="mx-auto">
            Lancer un paiement test (1€ / mois)
          </Button>
        </div>

        {/* Garanties */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center space-x-8 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              Paiement sécurisé par Stripe
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              Annulation à tout moment
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              Support client inclus
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
