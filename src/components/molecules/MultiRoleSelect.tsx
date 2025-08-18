'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { parseUserRoles } from '@/lib/auth-utils'

interface Role {
  value: string
  label: string
  description: string
  protected?: boolean
}

interface MultiRoleSelectProps {
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
  disabled?: boolean
  className?: string
  isCurrentUser?: boolean
  isClinicCreator?: boolean
}

const AVAILABLE_ROLES: Role[] = [
  {
    value: 'admin',
    label: 'Administrateur',
    description: 'Accès complet à toutes les fonctionnalités',
    protected: true
  },
  {
    value: 'owner',
    label: 'Propriétaire',
    description: 'Gestion des propriétaires et animaux'
  },
  {
    value: 'vet',
    label: 'Vétérinaire',
    description: 'Gestion des rendez-vous et dossiers médicaux'
  },
  {
    value: 'assistant',
    label: 'Assistant(e)',
    description: 'Accès limité aux fonctionnalités de base'
  }
]

export function MultiRoleSelect({
  value,
  onChange,
  label = "Rôles",
  error,
  disabled = false,
  className,
  isCurrentUser = false,
  isClinicCreator = false
}: MultiRoleSelectProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  // Parser les rôles actuels
  useEffect(() => {
    if (value) {
      setSelectedRoles(value.split(',').map(r => r.trim()).filter(Boolean))
    } else {
      setSelectedRoles([])
    }
  }, [value])

  const handleRoleToggle = (roleValue: string) => {
    const role = AVAILABLE_ROLES.find(r => r.value === roleValue)
    
    // Protection du rôle admin pour le créateur de la clinique
    if (roleValue === 'admin' && isClinicCreator) {
      return // Ne pas permettre de retirer le rôle admin au créateur
    }

    const newRoles = selectedRoles.includes(roleValue)
      ? selectedRoles.filter(r => r !== roleValue)
      : [...selectedRoles, roleValue]

    setSelectedRoles(newRoles)
    onChange(newRoles.join(', '))
  }

  const getRoleDisplay = (roleValue: string) => {
    const role = AVAILABLE_ROLES.find(r => r.value === roleValue)
    return role?.label || roleValue
  }

  const isRoleProtected = (roleValue: string) => {
    const role = AVAILABLE_ROLES.find(r => r.value === roleValue)
    return role?.protected && isClinicCreator
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div className="space-y-2">
        {AVAILABLE_ROLES.map((role) => {
          const isSelected = selectedRoles.includes(role.value)
          const isProtected = isRoleProtected(role.value)
          
          return (
            <div
              key={role.value}
              className={cn(
                "flex items-center p-3 border rounded-lg cursor-pointer transition-colors",
                isSelected 
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500",
                isProtected && "opacity-75 cursor-not-allowed",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !disabled && !isProtected && handleRoleToggle(role.value)}
            >
              <div className="flex items-center h-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={disabled || isProtected}
                  onChange={() => !disabled && !isProtected && handleRoleToggle(role.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {role.label}
                  </span>
                  {isProtected && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Protégé
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {role.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Affichage des rôles sélectionnés */}
      {selectedRoles.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Rôles sélectionnés :
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedRoles.map((roleValue) => (
              <span
                key={roleValue}
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                )}
              >
                {getRoleDisplay(roleValue)}
                {isRoleProtected(roleValue) && (
                  <span className="ml-1 text-yellow-600">🔒</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Message d'aide pour le créateur */}
      {isClinicCreator && (
        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <span className="font-medium">Note :</span> En tant que créateur de la clinique, 
            votre rôle d'administrateur est protégé et ne peut pas être retiré.
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
