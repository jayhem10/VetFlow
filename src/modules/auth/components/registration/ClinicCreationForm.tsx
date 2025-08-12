import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clinicCreationSchema, type ClinicCreationData } from '@/schemas/auth.schema'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import { useCompleteProfileStore, type ClinicData } from '@/stores/completeProfileStore'
import { toast } from 'react-hot-toast'

interface ClinicCreationFormProps {
  onSubmit?: () => Promise<void>
}

export function ClinicCreationForm({ onSubmit }: ClinicCreationFormProps) {
  const { setClinicData, clinicData, loading } = useCompleteProfileStore()
  
  const form = useForm<ClinicCreationData>({
    resolver: zodResolver(clinicCreationSchema),
    defaultValues: {
      name: clinicData?.name || '',
      email: clinicData?.email || '',
      phone: clinicData?.phone || '',
      address: clinicData?.address || '',
      city: clinicData?.city || '',
      postal_code: clinicData?.postal_code || '',
      country: clinicData?.country || 'France',
      subscription_plan: clinicData?.subscription_plan || 'starter',
    }
  })

  const handleSubmit = async (data: ClinicCreationData) => {
    try {
      // Sauvegarder les données de la clinique dans le store
      const clinicData: ClinicData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postal_code: data.postal_code,
        country: data.country,
        subscription_plan: data.subscription_plan,
      }
      
      setClinicData(clinicData)
      toast.success('Informations de clinique sauvegardées !')
      
      // Appeler la fonction de finalisation
      if (onSubmit) {
        await onSubmit()
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
      console.error('Erreur sauvegarde clinique:', error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Nom de la clinique"
          {...form.register('name')}
          error={form.formState.errors.name?.message}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
          />
          <Input
            label="Téléphone"
            {...form.register('phone')}
            error={form.formState.errors.phone?.message}
          />
        </div>

        <Input
          label="Adresse"
          {...form.register('address')}
          error={form.formState.errors.address?.message}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Ville"
            {...form.register('city')}
            error={form.formState.errors.city?.message}
          />
          <Input
            label="Code postal"
            {...form.register('postal_code')}
            error={form.formState.errors.postal_code?.message}
          />
          <Input
            label="Pays"
            {...form.register('country')}
            error={form.formState.errors.country?.message}
          />
        </div>

        <Select
          label="Forfait"
          value={form.watch('subscription_plan')}
          onChange={(value) => form.setValue('subscription_plan', value as any)}
          options={[
            { value: 'starter', label: 'Starter - 49€/mois' },
            { value: 'professional', label: 'Professional - 199€/mois' },
            { value: 'clinic', label: 'Clinic - 199€/mois' }
          ]}
          error={form.formState.errors.subscription_plan?.message}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        loading={loading}
        disabled={loading || form.formState.isSubmitting}
      >
        {loading ? 'Finalisation en cours...' : '🚀 Finaliser la création'}
      </Button>
    </form>
  )
} 