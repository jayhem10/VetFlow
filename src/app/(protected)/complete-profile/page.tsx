'use client'

import { useAuth } from '@/hooks/useAuth'
import { ProfileCreationForm } from '@/modules/auth/components/registration/ProfileCreationForm'
import { ClinicCreationForm } from '@/modules/auth/components/registration/ClinicCreationForm'
import { useCompleteProfileStore } from '@/stores/completeProfileStore'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function CompleteProfilePage() {
  const { user } = useAuth()
  const { data: session, update } = useSession()
  const router = useRouter()
  const { 
    currentStep, 
    loading,
    nextStep,
    setCurrentStep,
    completeRegistration 
  } = useCompleteProfileStore()

  const steps = [
    { id: 'profile', title: 'Profil', description: 'Informations personnelles' },
    { id: 'clinic', title: 'Clinique', description: 'Informations de la clinique' },
    { id: 'complete', title: 'Terminé', description: 'Configuration terminée' }
  ]

  const handleProfileComplete = () => {
    nextStep()
  }

  const handleClinicComplete = async () => {
    // Toutes les données sont maintenant dans le store
    // On appelle la fonction qui envoie tout d'un coup
    const success = await completeRegistration()
    
    if (success) {
      // Mettre à jour la session avec les informations de profil et clinique
      await update({
        ...session,
        user: {
          ...session?.user,
          hasProfile: true,
          hasClinic: true,
        },
      })
      
      // Rediriger vers le dashboard après un délai pour voir le message de succès
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    // Permettre de revenir aux étapes précédentes uniquement
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex)
    }
  }

  if (!user) {
    return <div>Chargement...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header avec étapes */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Finalisez votre profil
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complétez les informations de votre profil et de votre clinique pour commencer à utiliser VetFlow
            </p>
          </div>

          {/* Indicateur d'étapes */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div 
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer",
                      currentStep >= index 
                        ? "bg-green-700 text-white" 
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
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
                    currentStep >= index ? "text-green-700" : "text-gray-500"
                  )}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "h-px w-16 ml-4 transition-colors",
                      currentStep > index ? "bg-green-700" : "bg-gray-300"
                    )}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Configuration terminée !
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Votre profil et votre clinique ont été créés avec succès. Vous allez être redirigé vers votre tableau de bord.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  )
} 