'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { TrialStatus } from '@/lib/trial-utils'

export function useTrialStatus() {
  const { data: session } = useSession()
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Toujours définir loading à false si pas de session ou clinique
    if (!session?.user?.profile?.clinicId) {
      setLoading(false)
      setTrialStatus(null)
      return
    }

    const fetchTrialStatus = async () => {
      try {
        const response = await fetch(`/api/clinic/${session.user.profile.clinicId}/trial-status`)
        
        if (!response.ok) {
          console.error('Erreur lors de la récupération du statut trial')
          return
        }

        const data = await response.json()
        setTrialStatus(data.trialStatus)

        // Mettre à jour le cookie pour le middleware
        if (data.trialStatus.isExpired) {
          document.cookie = 'trial-expired=true; path=/'
        } else {
          document.cookie = 'trial-expired=false; path=/'
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du statut trial:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrialStatus()
  }, [session?.user?.profile?.clinicId])

  return {
    trialStatus,
    loading,
    isInTrial: trialStatus?.isInTrial || false,
    isExpired: trialStatus?.isExpired || false,
    daysLeft: trialStatus?.daysLeft || 0,
    canAccess: trialStatus?.canAccess ?? true,
    shouldShowNotification: trialStatus?.shouldShowNotification || false,
  }
}
