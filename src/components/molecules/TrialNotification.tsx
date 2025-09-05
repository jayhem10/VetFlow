'use client'

import { useState } from 'react'
import { AlertTriangle, Clock, CreditCard, X } from 'lucide-react'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import { cn } from '@/lib/utils'

interface TrialNotificationProps {
  daysLeft: number
  onPaymentClick: () => void
  onDismiss?: () => void
  className?: string
}

export function TrialNotification({ 
  daysLeft, 
  onPaymentClick, 
  onDismiss, 
  className 
}: TrialNotificationProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  const getVariant = () => {
    if (daysLeft <= 3) return 'critical'
    if (daysLeft <= 7) return 'warning'
    return 'info'
  }

  const variant = getVariant()

  // Couleurs uniquement sur la bordure gauche pour rester cohérent avec les Cards globales
  const variantStyles = {
    info: 'border-l-green-700 dark:border-l-green-400',
    warning: 'border-l-yellow-500 dark:border-l-yellow-400',
    critical: 'border-l-red-600 dark:border-l-red-400'
  }

  const iconStyles = {
    info: 'text-green-700 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-300',
    critical: 'text-red-600 dark:text-red-300'
  }

  const getIcon = () => {
    switch (variant) {
      case 'critical':
        return <AlertTriangle className={cn('h-5 w-5', iconStyles[variant])} />
      case 'warning':
        return <Clock className={cn('h-5 w-5', iconStyles[variant])} />
      default:
        return <Clock className={cn('h-5 w-5', iconStyles[variant])} />
    }
  }

  const getMessage = () => {
    if (daysLeft === 0) {
      return "Votre période d'essai expire aujourd'hui"
    }
    if (daysLeft === 1) {
      return "Il vous reste 1 jour de période d'essai"
    }
    return `Il vous reste ${daysLeft} jours de période d'essai`
  }

  const getDescription = () => {
    if (daysLeft <= 3) {
      return "Souscrivez maintenant pour continuer à utiliser toutes les fonctionnalités"
    }
    return "Pensez à souscrire un abonnement pour éviter toute interruption de service"
  }

  return (
    <Card className={cn(
      'border-l-4 p-4',
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getIcon()}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-gray-900 dark:text-white">
              {getMessage()}
            </h3>
            <p className="text-xs mt-1 text-gray-700 dark:text-gray-300">
              {getDescription()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            onClick={onPaymentClick}
            className="cursor-pointer"
          >
            <CreditCard className="h-4 w-4 mr-1" />
            Souscrire
          </Button>
          
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="cursor-pointer text-current hover:bg-current/10 dark:hover:bg-current/20 p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
