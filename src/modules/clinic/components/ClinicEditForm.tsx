'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { useClinic } from '@/modules/clinic/hooks/use-clinic';
import type { TClinic } from '@/types/database.types';

const clinicSchema = z.object({
  name: z.string().min(1, 'Le nom de la clinique est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default('France'),
});

type ClinicFormData = z.infer<typeof clinicSchema>;

interface ClinicEditFormProps {
  clinic: TClinic | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClinicEditForm({ clinic, onSuccess, onCancel }: ClinicEditFormProps) {
  const { updateClinic } = useClinic();
  
  const form = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      name: clinic?.name || '',
      email: clinic?.email || '',
      phone: clinic?.phone || '',
      address: clinic?.address || '',
      city: clinic?.city || '',
      postal_code: clinic?.postal_code || '',
      country: clinic?.country || 'France',
    },
  });

  const onSubmit = async (data: ClinicFormData) => {
    try {
      if (!clinic?.id) {
        toast.error('Clinique non trouvée');
        return;
      }

      await updateClinic(clinic.id, {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        postalCode: data.postal_code || undefined,
      });

      toast.success('Clinique mise à jour avec succès !');
      onSuccess?.();
    } catch (error) {
      console.error('Erreur mise à jour clinique:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Nom de la clinique */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom de la clinique *
          </label>
          <Input
            {...form.register('name')}
            placeholder="Clinique Vétérinaire..."
            error={form.formState.errors.name?.message}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <Input
            {...form.register('email')}
            type="email"
            placeholder="contact@clinique.fr"
            error={form.formState.errors.email?.message}
          />
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Téléphone
          </label>
          <Input
            {...form.register('phone')}
            type="tel"
            placeholder="01 23 45 67 89"
            error={form.formState.errors.phone?.message}
          />
        </div>

        {/* Adresse */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Adresse
          </label>
          <Input
            {...form.register('address')}
            placeholder="123 rue de la Paix"
            error={form.formState.errors.address?.message}
          />
        </div>

        {/* Ville */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ville
          </label>
          <Input
            {...form.register('city')}
            placeholder="Paris"
            error={form.formState.errors.city?.message}
          />
        </div>

        {/* Code postal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Code postal
          </label>
          <Input
            {...form.register('postal_code')}
            placeholder="75001"
            error={form.formState.errors.postal_code?.message}
          />
        </div>

        {/* Pays */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pays
          </label>
          <Input
            {...form.register('country')}
            placeholder="France"
            error={form.formState.errors.country?.message}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
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
  );
}