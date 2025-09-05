'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/lib/toast';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { useClinic } from '@/modules/clinic/hooks/use-clinic';
import type { TClinic } from '@/types/database.types';

const clinicSchema = z.object({
  name: z.string().min(1, 'Le nom de la clinique est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string()
    .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
      'Format de téléphone français invalide (ex: 01 23 45 67 89)')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string()
    .regex(/^[0-9]{5}$/,'Code postal français invalide (5 chiffres)')
    .optional()
    .or(z.literal('')),
  country: z.string().default('France'),
  legalForm: z.enum(['EI','EURL','SARL','SASU','SAS','SELARL','SCM','Association']).optional().or(z.literal('')),
  siret: z.string().regex(/^\d{14}$/,'SIRET invalide (14 chiffres)').optional().or(z.literal('')),
  tvaNumber: z.string().regex(/^FR[0-9A-Z]{2}\d{9}$/,'Numéro TVA FR invalide').optional().or(z.literal('')),
  nafCode: z.string().regex(/^[A-Z]{1}\d{2}\.\d[A-Z]?$/,'Code NAF/APE invalide (ex: 75.00Z)').optional().or(z.literal('')),
  iban: z.string().regex(/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/,'IBAN invalide').optional().or(z.literal('')),
  bic: z.string().regex(/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/,'BIC/SWIFT invalide').optional().or(z.literal('')),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
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
      postalCode: clinic?.postalCode || '',
      country: clinic?.country || 'France',
      legalForm: (clinic as any)?.legalForm || '',
      siret: (clinic as any)?.siret || '',
      tvaNumber: (clinic as any)?.tvaNumber || '',
      nafCode: (clinic as any)?.nafCode || '',
      iban: (clinic as any)?.iban || '',
      bic: (clinic as any)?.bic || '',
      website: (clinic as any)?.website || '',
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
        postalCode: data.postalCode || undefined,
        legalForm: data.legalForm || undefined,
        siret: data.siret || undefined,
        tvaNumber: data.tvaNumber || undefined,
        nafCode: data.nafCode || undefined,
        iban: data.iban || undefined,
        bic: data.bic || undefined,
        website: data.website || undefined,
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
            {...form.register('postalCode')}
            placeholder="75001"
            error={form.formState.errors.postalCode?.message}
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

        {/* Champs légaux */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Forme juridique</label>
            <Input {...form.register('legalForm')} placeholder="SASU, SELARL, ..." error={(form.formState.errors as any).legalForm?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SIRET</label>
            <Input {...form.register('siret')} placeholder="14 chiffres" error={(form.formState.errors as any).siret?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">N° TVA</label>
            <Input {...form.register('tvaNumber')} placeholder="FRxx123456789" error={(form.formState.errors as any).tvaNumber?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code NAF/APE</label>
            <Input {...form.register('nafCode')} placeholder="75.00Z" error={(form.formState.errors as any).nafCode?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IBAN</label>
            <Input {...form.register('iban')} placeholder="FR76 ..." error={(form.formState.errors as any).iban?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">BIC / SWIFT</label>
            <Input {...form.register('bic')} placeholder="XXXXXXXXXXX" error={(form.formState.errors as any).bic?.message} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site web</label>
            <Input {...form.register('website')} placeholder="https://..." error={(form.formState.errors as any).website?.message} />
          </div>
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