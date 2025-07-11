import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/atoms/Input'
import Button from '@/components/atoms/Button'

import { useProfile } from '@/modules/profile/hooks/use-profile'
import { useAuth } from '@/modules/auth/hooks/use-auth'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

// Schéma strictement pour les champs de la table profiles uniquement
const profileSchema = z.object({
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().min(10, 'Numéro de téléphone invalide').optional(),
  role: z.enum(['owner', 'vet', 'assistant', 'admin']).default('owner'),
  license_number: z.string().optional(),
  specialties: z.array(z.string()).optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileCreationFormProps {
  onSuccess?: () => void
}

export function ProfileCreationForm({ onSuccess }: ProfileCreationFormProps = {}) {
  const { user } = useAuth()
  const { createInitialProfile, loading, error } = useProfile()
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      role: 'owner',
      license_number: '',
      specialties: [],
    }
  })

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
      toast.error('Vous devez être connecté')
      return
    }

    try {
      // Créer SEULEMENT le profil avec les champs de la table profiles
      await createInitialProfile({
        id: user.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: user.email!,
        phone: data.phone || undefined,
        role: data.role,
        license_number: data.license_number || undefined,
        specialties: data.specialties || undefined,
        registration_step: 'profile'
      })
      toast.success('Profil créé avec succès !')
      onSuccess?.() // Notifier le parent que le profil a été créé
    } catch (error) {
      console.error('Erreur création profil:', error)
      toast.error('Erreur lors de la création du profil')
    }
  }

  const roleOptions = [
    { value: 'owner', label: 'Propriétaire de clinique' },
    { value: 'vet', label: 'Vétérinaire' },
    { value: 'assistant', label: 'Assistant(e) vétérinaire' },
  ]

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
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rôle professionnel *
              </label>
              <select
                {...field}
                className={cn(
                  "w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
                  error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                )}
                required
              >
                <option value="">Sélectionnez votre rôle</option>
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {error && (
                <p className="text-sm text-red-500">{error.message}</p>
              )}
            </div>
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
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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

        {/* Affichage des erreurs globales */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Bouton de soumission */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Création en cours...' : '✨ Créer mon profil'}
        </Button>
      </form>
    </div>
  )
} 