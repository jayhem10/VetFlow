'use client'

import { useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Step {
  id: string
  title: string
  description: string
  content: ReactNode
}

interface MultiStepFormProps {
  steps: Step[]
  onComplete: () => void
  currentStep: number
  onStepChange: (step: number) => void
  canContinue: boolean
  isSubmitting?: boolean
}

export function MultiStepForm({
  steps,
  onComplete,
  currentStep,
  onStepChange,
  canContinue,
  isSubmitting = false
}: MultiStepFormProps) {
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Stepper */}
      <div className="mb-8">
        {/* Desktop Stepper */}
        <div className="hidden md:flex justify-center">
          <div className="flex items-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all",
                      currentStep === index
                        ? "bg-green-700 border-green-700 text-white"
                        : currentStep > index
                        ? "bg-green-700 border-green-700 text-white"
                        : "bg-gray-100 border-gray-300 text-gray-500"
                    )}
                  >
                    {currentStep > index ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-lg font-medium">{index + 1}</span>
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="mt-3 text-center">
                    <div className={cn(
                      "text-sm font-medium transition-colors",
                      currentStep >= index ? "text-green-700" : "text-gray-500"
                    )}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 max-w-28 mx-auto text-center">
                      {step.description}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-24 h-0.5 mx-6 mt-6 transition-colors",
                    currentStep > index ? "bg-green-700" : "bg-gray-200"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Stepper */}
        <div className="md:hidden">
          <div className="flex items-center justify-center mb-4">
            <div className="text-sm text-gray-500">
              Étape {currentStep + 1} sur {steps.length}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-full bg-green-700 border-green-700 text-white"
            >
              <span className="text-sm font-medium">{currentStep + 1}</span>
            </div>
            <div className="ml-3">
              <div className="text-lg font-medium text-green-700">
                {steps[currentStep].title}
              </div>
              <div className="text-sm text-gray-500">
                {steps[currentStep].description}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-700 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            {steps[currentStep].description}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {steps[currentStep].content}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
        {/* Bouton Précédent - Masqué à la première étape */}
        {!isFirstStep ? (
          <button
            type="button"
            onClick={() => onStepChange(currentStep - 1)}
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            ← Précédent
          </button>
        ) : (
          <div /> /* Spacer pour maintenir l'alignement */
        )}

        <div className="flex flex-col items-end">
          {!canContinue && !isSubmitting && (
            <div className="text-xs text-red-500 mb-2">
              {isLastStep 
                ? 'Veuillez accepter les conditions' 
                : currentStep === 0 
                  ? 'Veuillez remplir tous les champs requis avec un email valide' 
                  : currentStep === 1 
                    ? 'Veuillez saisir un numéro de téléphone (minimum 10 chiffres)'
                    : currentStep === 2
                      ? 'Veuillez saisir le nom de la clinique'
                      : 'Veuillez remplir tous les champs requis'}
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              if (isLastStep) {
                onComplete()
              } else {
                onStepChange(currentStep + 1)
              }
            }}
            disabled={!canContinue || isSubmitting}
            className={cn(
              "px-8 py-3 text-sm font-medium rounded-md transition-colors",
              !canContinue || isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-700 text-white hover:bg-green-800 shadow-lg hover:shadow-xl"
            )}
          >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Création en cours...
            </span>
          ) : isLastStep ? (
            '🚀 Créer mon compte'
          ) : (
            'Suivant →'
          )}
          </button>
        </div>
      </div>
    </div>
  )
} 