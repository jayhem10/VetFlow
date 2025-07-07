import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step2Schema, Step2FormData } from '@/schemas/auth.schema'
import Input from '@/components/atoms/Input'
import Button from '@/components/atoms/Button'
import { Select } from '@/components/atoms/Select'
import { FRANCOPHONE_COUNTRIES, PREFERRED_CONTACTS } from '@/lib/constants'
import { useRegistrationStore } from '@/stores/registrationStore'

interface Step2ContactInfoProps {
  onNext: () => void
  onBack: () => void
}

export function Step2ContactInfo({ onNext, onBack }: Step2ContactInfoProps) {
  const { setStepData, data } = useRegistrationStore()
  const form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    mode: 'onBlur',
    defaultValues: data.step2 || {
      phone: '',
      mobile: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'France',
      preferredContact: 'email',
      marketingConsent: false,
    },
  })

  const { handleSubmit, control, formState: { errors } } = form

  const onSubmit = async (values: Step2FormData) => {
    const isValid = await form.trigger()
    if (isValid) {
      setStepData('step2', values)
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header avec message d'accueil */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">2</span>
          </div>
          <div>
            <h3 className="font-medium text-green-900 dark:text-green-100">Contact</h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Seul le téléphone est obligatoire. Les autres informations sont optionnelles.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input 
                {...field} 
                label="Téléphone *" 
                type="tel"
                placeholder="01 23 45 67 89"
                error={errors.phone?.message}
                autoComplete="tel"
                required
              />
            )}
          />
          <Controller
            name="mobile"
            control={control}
            render={({ field }) => (
              <Input 
                {...field} 
                label="Mobile (optionnel)" 
                type="tel"
                placeholder="06 12 34 56 78"
                error={errors.mobile?.message}
                autoComplete="tel"
              />
            )}
          />
        </div>
        
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Input 
              {...field} 
              label="Adresse (optionnel)" 
              placeholder="123 rue de la Paix"
              error={errors.address?.message}
              autoComplete="street-address"
            />
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <Input 
                {...field} 
                label="Ville (optionnel)" 
                placeholder="Paris"
                error={errors.city?.message}
                autoComplete="address-level2"
              />
            )}
          />
          <Controller
            name="postalCode"
            control={control}
            render={({ field }) => (
              <Input 
                {...field} 
                label="Code postal (optionnel)" 
                placeholder="75001"
                error={errors.postalCode?.message}
                autoComplete="postal-code"
              />
            )}
          />
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                options={FRANCOPHONE_COUNTRIES}
                label="Pays"
                placeholder="Sélectionnez votre pays"
                error={errors.country?.message}
              />
            )}
          />
        </div>
        
        <Controller
          name="preferredContact"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onChange={field.onChange}
              options={PREFERRED_CONTACTS}
              label="Moyen de contact préféré"
              placeholder="Choisissez votre moyen de contact"
              error={errors.preferredContact?.message}
            />
          )}
        />
        
        <Controller
          name="marketingConsent"
          control={control}
          render={({ field: { value, onChange } }) => (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={value}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-600">
                J&apos;accepte de recevoir des communications marketing
              </label>
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