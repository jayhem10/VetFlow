import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useOwners } from '@/hooks/useOwners'
import { useUIStore } from '@/stores/useUIStore'
import { useAuth } from '@/modules/auth/hooks/use-auth'

const ownerSchema = z.object({
  first_name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  preferred_contact: z.enum(['email', 'phone', 'mobile']).optional(),
  marketing_consent: z.boolean().optional(),
  notes: z.string().optional(),
})

type OwnerFormData = z.infer<typeof ownerSchema>

export function OwnerForm() {
  const { user } = useAuth()
  const { createOwner, updateOwner, selectedOwner } = useOwners()
  const { closeModal, showNotification } = useUIStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OwnerFormData>({
    resolver: zodResolver(ownerSchema),
    defaultValues: selectedOwner || {
      country: 'FR',
      preferred_contact: 'email',
      marketing_consent: false,
    },
  })

  const onSubmit = async (data: OwnerFormData) => {
    try {
      if (selectedOwner) {
        await updateOwner(selectedOwner.id, data)
        showNotification('success', 'Propriétaire modifié avec succès')
      } else {
        await createOwner({
          ...data,
          clinic_id: user?.clinic_id || ''
        })
        showNotification('success', 'Propriétaire créé avec succès')
      }
      closeModal('ownerForm')
    } catch (error) {
      showNotification('error', 'Erreur lors de la sauvegarde')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {selectedOwner ? 'Modifier' : 'Ajouter'} un propriétaire
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                {...register('first_name')}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                {...register('last_name')}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile
              </label>
              <input
                type="tel"
                {...register('mobile')}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <input
              type="text"
              {...register('address')}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <input
                type="text"
                {...register('city')}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code postal
              </label>
              <input
                type="text"
                {...register('postal_code')}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact préféré
            </label>
            <select
              {...register('preferred_contact')}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="email">Email</option>
              <option value="phone">Téléphone</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('marketing_consent')}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">
              Accepte de recevoir des communications marketing
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => closeModal('ownerForm')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 