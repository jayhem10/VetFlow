'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { authService } from '@/modules/auth/services/auth.service'
import { Step1PersonalInfo } from './registration/Step1PersonalInfo'
import { Step2ContactInfo } from './registration/Step2ContactInfo'
import { Step3ClinicInfo } from './registration/Step3ClinicInfo'
import { useRegistrationStore } from '@/stores/registrationStore'

export function CompleteProfileForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { data, reset } = useRegistrationStore()

  const handleNext = () => {
    setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmitFinal = async () => {
    setIsSubmitting(true)
    
    try {
      // Vérifier que toutes les étapes sont complètes
      if (!data.step1 || !data.step2 || !data.step3) {
        toast.error('Veuillez compléter toutes les étapes')
        return
      }

      // Récupérer l'utilisateur connecté
      const user = await authService.getCurrentUser()
      
      if (!user) {
        toast.error('Vous devez être connecté pour compléter votre profil')
        router.push('/login')
        return
      }

      // Préparer les données pour la complétion
      const profileData = {
        firstName: data.step1.firstName,
        lastName: data.step1.lastName,
        phone: data.step2.phone,
        country: data.step2.country,
        clinicName: data.step3.clinicName,
        clinicEmail: data.step3.clinicEmail,
        clinicPhone: data.step3.clinicPhone,
        clinicAddress: data.step3.clinicAddress,
        clinicCity: data.step3.clinicCity,
        clinicPostalCode: data.step3.clinicPostalCode,
        subscriptionPlan: data.step3.subscriptionPlan,
      }

      // Compléter l'inscription
      await authService.completeRegistration(user.id, profileData)
      
      console.log('✅ Profil complété avec succès')
      
      toast.success('🎉 Profil complété ! Bienvenue dans VetFlow.')
      reset() // Vider le store
      router.push('/dashboard')
      
    } catch (error) {
      console.error('💥 Erreur complétion profil:', error)
      toast.error('Une erreur s\'est produite lors de la complétion du profil')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1PersonalInfo onNext={handleNext} />
      case 1:
        return <Step2ContactInfo onNext={handleNext} onBack={handleBack} />
      case 2:
        return <Step3ClinicInfo onNext={handleNext} onBack={handleBack} />
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Finaliser votre inscription
              </h3>
              <p className="text-gray-600">
                Vérifiez vos informations et finalisez votre inscription
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Informations personnelles</h4>
                <p className="text-sm text-gray-600">
                  {data.step1?.firstName} {data.step1?.lastName}
                </p>
                <p className="text-sm text-gray-600">{data.step1?.email}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contact</h4>
                <p className="text-sm text-gray-600">{data.step2?.phone}</p>
                <p className="text-sm text-gray-600">{data.step2?.country}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Clinique</h4>
                <p className="text-sm text-gray-600">{data.step3?.clinicName}</p>
                <p className="text-sm text-gray-600">{data.step3?.clinicCity}, {data.step3?.clinicPostalCode}</p>
                <p className="text-sm text-gray-600">Plan: {data.step3?.subscriptionPlan}</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Retour
              </button>
              <button
                onClick={handleSubmitFinal}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Finalisation...' : 'Finaliser l\'inscription'}
              </button>
            </div>
          </div>
        )
      default:
        return <Step1PersonalInfo onNext={handleNext} />
    }
  }

  const steps = [
    { title: 'Informations personnelles', description: 'Vos informations de base' },
    { title: 'Informations de contact', description: 'Comment vous contacter ?' },
    { title: 'Informations de la clinique', description: 'Détails de votre établissement' },
    { title: 'Validation', description: 'Vérifiez et finalisez' },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex justify-center">
          <div className="flex items-center space-x-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    currentStep === index
                      ? "bg-blue-600 border-blue-600 text-white"
                      : currentStep > index
                      ? "bg-green-600 border-green-600 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-500"
                  }`}>
                    {currentStep > index ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-lg font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <div className={`text-sm font-medium transition-colors ${
                      currentStep >= index ? "text-blue-600" : "text-gray-500"
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 max-w-28 mx-auto text-center">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-0.5 mx-6 mt-6 transition-colors ${
                    currentStep > index ? "bg-green-600" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {steps[currentStep].description}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {renderStep()}
        </div>
      </div>

      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Finalisation de votre profil en cours...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 