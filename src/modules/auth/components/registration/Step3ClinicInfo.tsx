import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step3Schema, Step3FormData } from '@/schemas/auth.schema'
import Input from '@/components/atoms/Input'
import Button from '@/components/atoms/Button'
import { SUBSCRIPTION_PLANS } from '@/lib/constants'
import { useRegistrationStore } from '@/stores/registrationStore'
import { cn } from '@/lib/utils'

interface Step3ClinicInfoProps {
  onNext: () => void
  onBack: () => void
}

export function Step3ClinicInfo({ onNext, onBack }: Step3ClinicInfoProps) {
  const { setStepData, data } = useRegistrationStore()
  const form = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    mode: 'onBlur',
    defaultValues: data.step3 || {
      clinicName: '',
      clinicEmail: '',
      clinicPhone: '',
      clinicAddress: '',
      clinicCity: '',
      clinicPostalCode: '',
      subscriptionPlan: 'starter',
    },
  })

  const { handleSubmit, control, formState: { errors } } = form

  const onSubmit = async (values: Step3FormData) => {
    const isValid = await form.trigger()
    if (isValid) {
      setStepData('step3', values)
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header avec message d'accueil */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
            <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">3</span>
          </div>
          <div>
            <h3 className="font-medium text-purple-900 dark:text-purple-100">Votre clinique</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Choisissez votre plan d&apos;abonnement. Tous les plans incluent 15 jours d&apos;essai gratuit !
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          name="clinicName"
          control={control}
          render={({ field }) => (
            <Input 
              {...field} 
              label="Nom de la clinique *" 
              placeholder="Clinique vétérinaire des Champs"
              error={errors.clinicName?.message}
              autoComplete="organization"
              required
            />
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="clinicEmail"
            control={control}
            render={({ field }) => (
              <Input 
                {...field} 
                label="Email de la clinique (optionnel)" 
                type="email"
                placeholder="contact@clinique.com"
                error={errors.clinicEmail?.message}
                autoComplete="email"
              />
            )}
          />
          <Controller
            name="clinicPhone"
            control={control}
            render={({ field }) => (
              <Input 
                {...field} 
                label="Téléphone de la clinique (optionnel)" 
                type="tel"
                placeholder="01 23 45 67 89"
                error={errors.clinicPhone?.message}
                autoComplete="tel"
              />
            )}
          />
        </div>
        
        <Controller
          name="clinicAddress"
          control={control}
          render={({ field }) => (
            <Input 
              {...field} 
              label="Adresse de la clinique (optionnel)" 
              placeholder="123 avenue des Vétérinaires"
              error={errors.clinicAddress?.message}
              autoComplete="street-address"
            />
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="clinicCity"
            control={control}
            render={({ field }) => (
              <Input 
                {...field} 
                label="Ville (optionnel)" 
                placeholder="Paris"
                error={errors.clinicCity?.message}
                autoComplete="address-level2"
              />
            )}
          />
          <Controller
            name="clinicPostalCode"
            control={control}
            render={({ field }) => (
              <Input 
                {...field} 
                label="Code postal (optionnel)" 
                placeholder="75001"
                error={errors.clinicPostalCode?.message}
                autoComplete="postal-code"
              />
            )}
          />
        </div>
        
        <Controller
          name="subscriptionPlan"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Plan d&apos;abonnement
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SUBSCRIPTION_PLANS.map((plan: { value: string; label: string; price: string; trial: string }) => (
                  <label 
                    key={plan.value}
                    className={cn(
                      "border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
                      field.value === plan.value 
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                    )}
                  >
                    <input
                      type="radio"
                      value={plan.value}
                      checked={field.value === plan.value}
                      onChange={field.onChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className={cn(
                        "font-semibold text-lg mb-1",
                        field.value === plan.value 
                          ? "text-blue-600 dark:text-blue-400" 
                          : "text-gray-900 dark:text-white"
                      )}>
                        {plan.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {plan.price}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {plan.trial}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {error && (
                <p className="text-sm text-red-500">{error.message}</p>
              )}
            </div>
          )}
        />
        
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            ← Précédent
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Suivant →
          </Button>
        </div>
      </form>
    </div>
  )
} 