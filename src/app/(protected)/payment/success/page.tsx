'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import { toast } from '@/lib/toast'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      toast.error('Session de paiement non trouvée')
      router.push('/payment')
      return
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/stripe/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la vérification du paiement')
        }

        const data = await response.json()
        
        if (data.success) {
          setSuccess(true)
          toast.subscriptionActivated()
          
          // Nettoyer le cookie d'expiration
          document.cookie = 'trial-expired=false; path=/'
        } else {
          throw new Error(data.error || 'Paiement non confirmé')
        }

      } catch (error) {
        console.error('Erreur vérification paiement:', error)
        toast.error('Erreur lors de la vérification du paiement')
        router.push('/payment')
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [sessionId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Vérification du paiement...
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Veuillez patienter pendant que nous confirmons votre abonnement.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <Card className="p-8 text-center max-w-md w-full">
        <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-6" />
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Paiement réussi !
        </h1>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Votre abonnement a été activé avec succès. Vous avez maintenant accès à toutes les fonctionnalités de VetFlow.
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full"
          >
            Accéder au tableau de bord
          </Button>
          
          <Button
            onClick={() => router.push('/clinic-settings')}
            variant="outline"
            className="w-full"
          >
            Gérer mon abonnement
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
          Un email de confirmation vous a été envoyé avec les détails de votre abonnement.
        </p>
      </Card>
    </div>
  )
}
