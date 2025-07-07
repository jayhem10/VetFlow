import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clinicCreationSchema, type ClinicCreationData } from '@/schemas/auth.schema'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import { toast } from 'react-hot-toast'

interface ClinicCreationFormProps {
  onSubmit: (data: ClinicCreationData) => Promise<void>
  loading?: boolean
}

export function ClinicCreationForm({ onSubmit, loading }: ClinicCreationFormProps) {
  const form = useForm<ClinicCreationData>({
    resolver: zodResolver(clinicCreationSchema),
    defaultValues: {
      country: 'France',
      subscription_plan: 'starter',
    }
  })

  const handleSubmit = async (data: ClinicCreationData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      toast.error('Erreur lors de la création de la clinique')
      console.error('Erreur création clinique:', error)
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
          {...form.register('subscription_plan')}
          error={form.formState.errors.subscription_plan?.message}
        >
          <option value="starter">Starter</option>
          <option value="professional">Professional</option>
          <option value="clinic">Clinic</option>
        </Select>
      </div>

      <Button
        type="submit"
        className="w-full"
        loading={loading}
        disabled={loading}
      >
        Créer ma clinique
      </Button>
    </form>
  )
} 