import { prisma } from './prisma'

export interface TrialStatus {
  isInTrial: boolean
  isExpired: boolean
  daysLeft: number
  canAccess: boolean
  shouldShowNotification: boolean
}

/**
 * Calcule le statut de la période d'essai basé uniquement sur la date de fin
 */
export function calculateTrialStatus(
  subscriptionStatus: string,
  trialEndDate: Date | null
): TrialStatus {
  const now = new Date()
  
  // Si ce n'est pas en trial, accès complet
  if (subscriptionStatus !== 'trial') {
    return {
      isInTrial: false,
      isExpired: false,
      daysLeft: 0,
      canAccess: true,
      shouldShowNotification: false,
    }
  }

  // Si pas de date de fin définie, considérer comme expiré
  if (!trialEndDate) {
    return {
      isInTrial: true,
      isExpired: true,
      daysLeft: 0,
      canAccess: false,
      shouldShowNotification: false,
    }
  }

  const endDate = new Date(trialEndDate)
  const timeDiff = endDate.getTime() - now.getTime()
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24))

  const isExpired = daysLeft <= 0
  const canAccess = !isExpired
  const shouldShowNotification = daysLeft <= 14 && daysLeft > 0

  return {
    isInTrial: true,
    isExpired,
    daysLeft: Math.max(0, daysLeft),
    canAccess,
    shouldShowNotification,
  }
}

/**
 * Récupère le statut trial d'une clinique
 */
export async function getTrialStatus(clinicId: string): Promise<TrialStatus> {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: {
      subscriptionStatus: true,
      trialEndDate: true,
    },
  })

  if (!clinic) {
    throw new Error('Clinique non trouvée')
  }

  return calculateTrialStatus(
    clinic.subscriptionStatus,
    clinic.trialEndDate
  )
}

/**
 * Vérifie si une clinique peut accéder à une fonctionnalité
 */
export async function checkAccess(clinicId: string): Promise<{
  canAccess: boolean
  redirectTo?: string
  reason?: string
}> {
  const trialStatus = await getTrialStatus(clinicId)

  if (!trialStatus.canAccess) {
    return {
      canAccess: false,
      redirectTo: '/payment',
      reason: 'trial_expired',
    }
  }

  return { canAccess: true }
}

/**
 * Active un abonnement payant
 */
export async function activateSubscription(
  clinicId: string,
  plan: string,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
): Promise<void> {
  await prisma.clinic.update({
    where: { id: clinicId },
    data: {
      subscriptionStatus: 'active',
      subscriptionPlan: plan,
      stripeCustomerId,
      stripeSubscriptionId,
      trialEndDate: null, // Reset trial
    },
  })
}
