'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/lib/toast';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';

import { useOwnerStore } from '@/stores/useOwnerStore';
import { useClinic } from '@/modules/clinic/hooks/use-clinic';
import type { Owner } from '@/types/owner.types';

const ownerSchema = z.object({
  first_name: z.string().min(1, 'Le prénom est requis').max(100, 'Prénom trop long (max 100 caractères)'),
  last_name: z.string().min(1, 'Le nom est requis').max(100, 'Nom trop long (max 100 caractères)'),
  email: z.string().email('Email invalide').max(255, 'Email trop long (max 255 caractères)').optional().or(z.literal('')),
  phone: z.string().max(20, 'Téléphone trop long (max 20 caractères)').optional(),
  mobile: z.string().max(20, 'Mobile trop long (max 20 caractères)').optional(),
  address: z.string().optional(),
  city: z.string().max(100, 'Ville trop longue (max 100 caractères)').optional(),
  postal_code: z.string().max(10, 'Code postal trop long (max 10 caractères)').optional(),
  country: z.string().length(2, 'Code pays doit faire 2 caractères (ex: FR)').optional(),
  preferred_contact: z.enum(['email', 'phone', 'mobile']).optional(),
  marketing_consent: z.boolean().optional(),
  notes: z.string().optional(),
})

type OwnerFormData = z.infer<typeof ownerSchema>

interface OwnerFormProps {
  owner?: Owner | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function OwnerForm({ owner, onClose, onSuccess }: OwnerFormProps) {
  const { clinic } = useClinic();
  const { createOwner, updateOwner } = useOwnerStore();

  const form = useForm<OwnerFormData>({
    resolver: zodResolver(ownerSchema),
    defaultValues: owner ? {
      first_name: owner.first_name,
      last_name: owner.last_name,
      email: owner.email || '',
      phone: owner.phone || '',
      mobile: owner.mobile || '',
      address: owner.address || '',
      city: owner.city || '',
      postal_code: owner.postal_code || '',
      country: owner.country || 'FR',
      preferred_contact: owner.preferred_contact || 'email',
      marketing_consent: owner.marketing_consent || false,
      notes: owner.notes || '',
    } : {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      mobile: '',
      address: '',
      city: '',
      postal_code: '',
      country: 'FR',
      preferred_contact: 'email',
      marketing_consent: false,
      notes: '',
    },
  })

  const onSubmit = async (data: OwnerFormData) => {
    try {
      if (!clinic?.id) {
        toast.error('Clinique non trouvée');
        return;
      }

      if (owner) {
        await updateOwner(owner.id, {
          ...data,
          email: data.email || undefined,
          phone: data.phone || undefined,
          mobile: data.mobile || undefined,
          address: data.address || undefined,
          city: data.city || undefined,
          postal_code: data.postal_code || undefined,
          country: data.country || undefined,
          preferred_contact: data.preferred_contact,
          marketing_consent: data.marketing_consent,
          notes: data.notes || undefined,
        });
        toast.success('Propriétaire modifié avec succès');
      } else {
        await createOwner({
          ...data,
          email: data.email || undefined,
          phone: data.phone || undefined,
          mobile: data.mobile || undefined,
          address: data.address || undefined,
          city: data.city || undefined,
          postal_code: data.postal_code || undefined,
          country: data.country || undefined,
          preferred_contact: data.preferred_contact,
          marketing_consent: data.marketing_consent,
          notes: data.notes || undefined,
        });
        toast.success('Propriétaire créé avec succès');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Erreur sauvegarde propriétaire:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {owner ? 'Modifier' : 'Ajouter'} un propriétaire
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          
          {/* Informations personnelles */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Informations personnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prénom *
                </label>
                <Input
                  {...form.register('first_name')}
                  placeholder="Prénom"
                  error={form.formState.errors.first_name?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom *
                </label>
                <Input
                  {...form.register('last_name')}
                  placeholder="Nom"
                  error={form.formState.errors.last_name?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <Input
                  {...form.register('email')}
                  type="email"
                  placeholder="email@exemple.com"
                  error={form.formState.errors.email?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact préféré
                </label>
                <select
                  {...form.register('preferred_contact')}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Sélectionner</option>
                  <option value="email">Email</option>
                  <option value="phone">Téléphone</option>
                  <option value="mobile">Mobile</option>
                </select>
                {form.formState.errors.preferred_contact && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.preferred_contact.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Téléphone
                </label>
                <Input
                  {...form.register('phone')}
                  type="tel"
                  placeholder="01 23 45 67 89"
                  error={form.formState.errors.phone?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mobile
                </label>
                <Input
                  {...form.register('mobile')}
                  type="tel"
                  placeholder="06 12 34 56 78"
                  error={form.formState.errors.mobile?.message}
                />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Adresse
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Adresse
                </label>
                <Input
                  {...form.register('address')}
                  placeholder="123 rue de la Paix"
                  error={form.formState.errors.address?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ville
                  </label>
                  <Input
                    {...form.register('city')}
                    placeholder="Paris"
                    error={form.formState.errors.city?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Code postal
                  </label>
                  <Input
                    {...form.register('postal_code')}
                    placeholder="75001"
                    error={form.formState.errors.postal_code?.message}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pays
                </label>
                <select
                  {...form.register('country')}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Sélectionner un pays</option>
                  <option value="FR">France</option>
                  <option value="BE">Belgique</option>
                  <option value="CH">Suisse</option>
                  <option value="CA">Canada</option>
                  <option value="LU">Luxembourg</option>
                  <option value="MC">Monaco</option>
                </select>
                {form.formState.errors.country && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.country.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Préférences */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Préférences
            </h3>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                {...form.register('marketing_consent')}
                className="h-4 w-4 text-green-700 focus:ring-green-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Accepte de recevoir des communications marketing
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                {...form.register('notes')}
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Notes additionnelles..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              loading={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 