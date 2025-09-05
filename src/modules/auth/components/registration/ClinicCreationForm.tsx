import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clinicCreationSchema, type ClinicCreationData } from '@/schemas/auth.schema'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import { useCompleteProfileStore, type ClinicData } from '@/stores/completeProfileStore'
import { toast } from '@/lib/toast'

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
      postalCode: clinicData?.postalCode || '',
      country: clinicData?.country || 'France',
      legalForm: (clinicData as any)?.legalForm || '',
      siret: (clinicData as any)?.siret || '',
      tvaNumber: (clinicData as any)?.tvaNumber || '',
      nafCode: (clinicData as any)?.nafCode || '',
      iban: (clinicData as any)?.iban || '',
      bic: (clinicData as any)?.bic || '',
      website: (clinicData as any)?.website || '',
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
        postalCode: data.postalCode,
        country: data.country,
        // champs légaux (conservés dans le store puis envoyés à l'API)
        ...(data.legalForm ? { legalForm: data.legalForm } : {}),
        ...(data.siret ? { siret: data.siret } : {}),
        ...(data.tvaNumber ? { tvaNumber: data.tvaNumber } : {}),
        ...(data.nafCode ? { nafCode: data.nafCode } : {}),
        ...(data.iban ? { iban: data.iban } : {}),
        ...(data.bic ? { bic: data.bic } : {}),
        ...(data.website ? { website: data.website } : {}),
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
            placeholder="75001"
            {...form.register('postalCode')}
            error={form.formState.errors.postalCode?.message}
          />
          <Select
            label="Pays"
            value={form.watch('country')}
            onChange={(value) => form.setValue('country', value)}
            options={[
              { value: 'France', label: 'France' },
              { value: 'Belgique', label: 'Belgique' },
              { value: 'Suisse', label: 'Suisse' },
              { value: 'Canada', label: 'Canada' },
              { value: 'Luxembourg', label: 'Luxembourg' },
              { value: 'Autre', label: 'Autre' },
            ]}
            error={form.formState.errors.country?.message}
          />
        </div>

        <Select
          label="Forfait"
          value={form.watch('subscription_plan')}
          onChange={(value) => form.setValue('subscription_plan', value as any)}
          options={[
            { value: 'starter', label: 'Starter - 64.90€/mois' },
            { value: 'professional', label: 'Professional - 99€/mois' },
          ]}
          error={form.formState.errors.subscription_plan?.message}
        />

        {/* Champs légaux */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Forme juridique"
            value={form.watch('legalForm')}
            onChange={(v) => form.setValue('legalForm', v as any)}
            options={[
              { value: '', label: '—' },
              { value: 'EI', label: 'EI' },
              { value: 'EURL', label: 'EURL' },
              { value: 'SARL', label: 'SARL' },
              { value: 'SASU', label: 'SASU' },
              { value: 'SAS', label: 'SAS' },
              { value: 'SELARL', label: 'SELARL' },
              { value: 'SCM', label: 'SCM' },
              { value: 'Association', label: 'Association' },
            ]}
            error={(form.formState.errors as any).legalForm?.message}
          />
          <Input
            label="SIRET"
            placeholder="14 chiffres"
            {...form.register('siret')}
            error={(form.formState.errors as any).siret?.message}
          />
          <Input
            label="N° TVA"
            placeholder="FRxx123456789"
            {...form.register('tvaNumber')}
            error={(form.formState.errors as any).tvaNumber?.message}
          />
          <Input
            label="Code NAF/APE"
            placeholder="75.00Z"
            {...form.register('nafCode')}
            error={(form.formState.errors as any).nafCode?.message}
          />
          <Input
            label="IBAN"
            placeholder="FR76 ...."
            {...form.register('iban')}
            error={(form.formState.errors as any).iban?.message}
          />
          <Input
            label="BIC / SWIFT"
            placeholder="XXXXXXXXXXX"
            {...form.register('bic')}
            error={(form.formState.errors as any).bic?.message}
          />
          <Input
            label="Site web"
            placeholder="https://..."
            {...form.register('website')}
            error={(form.formState.errors as any).website?.message}
          />
        </div>
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