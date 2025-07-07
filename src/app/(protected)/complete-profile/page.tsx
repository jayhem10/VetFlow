'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProfileCreationForm } from '@/modules/auth/components/registration/ProfileCreationForm'
import { ClinicCreationForm } from '@/modules/auth/components/registration/ClinicCreationForm'
import { cn } from '@/lib/utils'

export default function CompleteProfilePage() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [profileData, setProfileData] = useState(null)

  const steps = [
    { id: 'profile', title: 'Profil', description: 'Informations personnelles' },
    { id: 'clinic', title: 'Clinique', description: 'Informations de la clinique' },
    { id: 'complete', title: 'Terminé', description: 'Configuration terminée' }
  ]

  const handleProfileComplete = () => {
    setCurrentStep(1)
  }

  const handleClinicComplete = async (data: any) => {
    // Logique pour créer la clinique
    console.log('Données clinique:', data)
    setCurrentStep(2)
  }

  const handleStepClick = (stepIndex: number) => {
    // Permettre de revenir aux étapes précédentes
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex)
    }
  }

  if (!user) {
    return <div>Chargement...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header simple pour la création du profil */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">V</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Vet<span className="text-blue-700 dark:text-blue-400">Flow</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Bienvenue {user.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Créez votre profil vétérinaire
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Configurez votre profil et votre clinique pour commencer à utiliser VetFlow
          </p>
        </div>

        {/* Étapes de progression */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer transition-all duration-200",
                      currentStep === index
                        ? "bg-blue-600 text-white"
                        : currentStep > index
                        ? "bg-green-600 text-white"
                        : "bg-gray-300 text-gray-600 hover:bg-gray-400"
                    )}
                    onClick={() => handleStepClick(index)}
                  >
                    {currentStep > index ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={cn(
                    "ml-2 text-sm font-medium transition-colors",
                    currentStep >= index ? "text-blue-600" : "text-gray-500"
                  )}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "h-px w-16 ml-4 transition-colors",
                      currentStep > index ? "bg-green-600" : "bg-gray-300"
                    )}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Formulaire de création de profil */}
        {currentStep === 0 && (
          <ProfileCreationForm onSuccess={handleProfileComplete} />
        )}

        {/* Formulaire de création de clinique */}
        {currentStep === 1 && (
          <ClinicCreationForm onSubmit={handleClinicComplete} />
        )}

        {/* Étape terminée */}
        {currentStep === 2 && (
          <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Profil créé avec succès !
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Votre profil et votre clinique sont maintenant configurés. Vous pouvez commencer à utiliser VetFlow.
            </p>
            <a
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Accéder au tableau de bord
            </a>
          </div>
        )}
      </main>
    </div>
  )
} 