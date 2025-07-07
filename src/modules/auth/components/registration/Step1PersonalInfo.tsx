import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step1Schema, Step1FormData } from '@/schemas/auth.schema'
import Input from '@/components/atoms/Input'
import Button from '@/components/atoms/Button'
import { useRegistrationStore } from '@/stores/registrationStore'

interface Step1PersonalInfoProps {
  onNext: () => void
}

export function Step1PersonalInfo({ onNext }: Step1PersonalInfoProps) {
  const { setStepData, data } = useRegistrationStore()
  const form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    mode: 'onBlur',
    defaultValues: data.step1 || {
      firstName: '',
      lastName: '',
      email: '',
    },
  })

  const { handleSubmit, control, formState: { errors } } = form

  const onSubmit = async (values: Step1FormData) => {
    const isValid = await form.trigger()
    if (isValid) {
      setStepData('step1', values)
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header avec message d'accueil */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">1</span>
          </div>
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Bienvenue chez VetFlow !</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Commençons par vos informations personnelles. Aucune carte bancaire requise pour l&apos;essai gratuit de 15 jours.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <Input 
                {...field} 
                label="Prénom" 
                placeholder="Votre prénom"
                error={errors.firstName?.message}
                autoComplete="given-name"
                required
              />
            )}
          />
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <Input 
                {...field} 
                label="Nom" 
                placeholder="Votre nom"
                error={errors.lastName?.message}
                autoComplete="family-name"
                required
              />
            )}
          />
        </div>
        
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input 
              {...field} 
              label="Email professionnel" 
              type="email"
              placeholder="votre@email.com"
              error={errors.email?.message}
              autoComplete="email"
              required
            />
          )}
        />
        
        <Button type="submit" variant="primary" size="lg" className="w-full">
          Suivant →
        </Button>
      </form>
    </div>
  )
} 