import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import Input from '@/components/atoms/Input'
import Button from '@/components/atoms/Button'
import { MultiRoleSelect } from '@/components/molecules/MultiRoleSelect'
import { profileCreationSchema, type ProfileCreationData } from '@/schemas/auth.schema'
import { useCompleteProfileStore, type ProfileData } from '@/stores/completeProfileStore'
import { useAuth } from '@/modules/auth/hooks/use-auth'

// Schéma strictement pour les champs de la table profiles uniquement
type ProfileFormData = ProfileCreationData

interface ProfileCreationFormProps {
  onSuccess?: () => void
}

export function ProfileCreationForm({ onSuccess }: ProfileCreationFormProps = {}) {
  const { user } = useAuth()
  const { setProfileData, profileData } = useCompleteProfileStore()
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileCreationSchema),
    defaultValues: {
      first_name: profileData?.first_name || '',
      last_name: profileData?.last_name || '',
      phone: profileData?.phone || '',
      role: profileData?.role || 'vet',
      license_number: profileData?.license_number || '',
      specialties: profileData?.specialties || [],
    }
  })

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
      toast.error('Vous devez être connecté')
      return
    }

    try {
      // Sauvegarder les données du profil dans le store (pas d'appel API)
      const profileData: ProfileData = {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        role: data.role,
        license_number: data.license_number,
        specialties: data.specialties || [],
      }
      
      setProfileData(profileData)
      toast.success('Informations de profil sauvegardées !')
      
      // Passer directement à l'étape suivante
      onSuccess?.()
      
    } catch (error) {
      console.error('Erreur sauvegarde profil:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }



  const specialtyOptions = [
    'Médecine générale',
    'Chirurgie',
    'Dermatologie',
    'Cardiologie',
    'Ophtalmologie',
    'Dentisterie',
    'Comportement',
    'NAC (Nouveaux Animaux de Compagnie)',
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Votre profil professionnel
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Renseignez vos informations professionnelles pour créer votre profil vétérinaire
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Informations personnelles */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="first_name"
            control={form.control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Prénom *"
                placeholder="Votre prénom"
                error={error?.message}
                className={cn(error && "border-red-500")}
                required
              />
            )}
          />

          <Controller
            name="last_name"
            control={form.control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Nom de famille *"
                placeholder="Votre nom"
                error={error?.message}
                className={cn(error && "border-red-500")}
                required
              />
            )}
          />
        </div>

        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Téléphone professionnel"
              type="tel"
              placeholder="06 12 34 56 78"
              error={error?.message}
              className={cn(error && "border-red-500")}
            />
          )}
        />

        {/* Informations professionnelles */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Informations professionnelles
          </h3>
        </div>

        <Controller
          name="role"
          control={form.control}
          render={({ field, fieldState: { error } }) => (
            <MultiRoleSelect
              value={field.value || ''}
              onChange={field.onChange}
              label="Rôles professionnels *"
              error={error?.message}
            />
          )}
        />

        <Controller
          name="license_number"
          control={form.control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Numéro d'ordre (optionnel)"
              placeholder="Ex: 12345"
              error={error?.message}
              className={cn(error && "border-red-500")}
            />
          )}
        />

        <Controller
          name="specialties"
          control={form.control}
          render={({ field, fieldState: { error } }) => (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Spécialités (optionnel)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {specialtyOptions.map((specialty) => (
                  <label key={specialty} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={field.value?.includes(specialty) || false}
                      onChange={(e) => {
                        const current = field.value || []
                        if (e.target.checked) {
                          field.onChange([...current, specialty])
                        } else {
                          field.onChange(current.filter(s => s !== specialty))
                        }
                      }}
                      className="rounded border-gray-300 text-green-700 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {specialty}
                    </span>
                  </label>
                ))}
              </div>
              {error && (
                <p className="text-sm text-red-500">{error.message}</p>
              )}
            </div>
          )}
        />

        {/* Bouton de soumission */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Sauvegarde en cours...' : '✨ Sauvegarder mon profil'}
        </Button>
      </form>
    </div>
  )
} 