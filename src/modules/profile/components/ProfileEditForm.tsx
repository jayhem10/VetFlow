'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/lib/toast';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { MultiRoleSelect } from '@/components/molecules/MultiRoleSelect';
import { useProfile } from '@/modules/profile/hooks/use-profile';
import { useClinic } from '@/modules/clinic/hooks/use-clinic';
import { useSession } from 'next-auth/react';
import type { TProfile } from '@/types/database.types';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  phone: z.string().optional(),
  role: z.string().refine((val) => {
    if (!val) return true // Rôle optionnel
    const roles = val.split(',').map(r => r.trim())
    const validRoles = ['owner', 'vet', 'assistant', 'admin', 'stock_manager']
    return roles.every(role => validRoles.includes(role))
  }, 'Rôles invalides'),
  licenseNumber: z.string().optional(),
  specialties: z.array(z.string()).default([]),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  profile: TProfile | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProfileEditForm({ profile, onSuccess, onCancel }: ProfileEditFormProps) {
  const { updateProfile } = useProfile();
  const { clinic } = useClinic();
  const { data: session } = useSession();
  
  // Déterminer si l'utilisateur actuel est le créateur de la clinique
    const isClinicCreator: boolean = !!(clinic?.createdAt && profile?.createdAt &&
    new Date(profile.createdAt) <= new Date(clinic.createdAt));
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      phone: profile?.phone || '',
      role: profile?.role || 'vet',
      licenseNumber: profile?.license_number || '',
      specialties: profile?.specialties || [],
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      if (!profile?.id) {
        toast.error('Profil non trouvé');
        return;
      }

      await updateProfile(profile.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role,
        licenseNumber: data.licenseNumber,
        specialties: data.specialties,
      });

      toast.success('Profil mis à jour avec succès !');
      onSuccess?.();
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleSpecialtyAdd = () => {
    const specialtyInput = document.getElementById('specialty-input') as HTMLInputElement;
    const specialty = specialtyInput?.value.trim();
    
    if (specialty && !form.getValues('specialties').includes(specialty)) {
      const currentSpecialties = form.getValues('specialties');
      form.setValue('specialties', [...currentSpecialties, specialty]);
      specialtyInput.value = '';
    }
  };

  const handleSpecialtyRemove = (index: number) => {
    const currentSpecialties = form.getValues('specialties');
    form.setValue('specialties', currentSpecialties.filter((_, i) => i !== index));
  };

  // Vérifier si l'utilisateur a le rôle vétérinaire
  const hasVetRole = form.watch('role')?.includes('vet') || false;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prénom *
          </label>
          <Input
            {...form.register('firstName')}
            placeholder="Votre prénom"
            error={form.formState.errors.firstName?.message}
          />
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom *
          </label>
          <Input
            {...form.register('lastName')}
            placeholder="Votre nom"
            error={form.formState.errors.lastName?.message}
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
      </div>

      {/* Rôles multiples */}
      <div>
        <MultiRoleSelect
          value={form.watch('role') || ''}
          onChange={(value) => form.setValue('role', value)}
          label="Rôles *"
          error={form.formState.errors.role?.message}
          isCurrentUser={true}
          isClinicCreator={isClinicCreator}
        />
      </div>

      {/* Numéro de licence (conditionnel) */}
      {hasVetRole && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Numéro de licence vétérinaire
          </label>
          <Input
            {...form.register('licenseNumber')}
            placeholder="ex: 12345"
            error={form.formState.errors.licenseNumber?.message}
          />
        </div>
      )}

      {/* Spécialités */}
      {hasVetRole && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Spécialités
          </label>
          
          {/* Liste des spécialités */}
          {form.watch('specialties').length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {form.watch('specialties').map((specialty, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-200"
                >
                  {specialty}
                  <button
                    type="button"
                    onClick={() => handleSpecialtyRemove(index)}
                    className="ml-2 text-green-700 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {/* Ajouter une spécialité */}
          <div className="flex gap-2">
            <Input
              id="specialty-input"
              placeholder="Ajouter une spécialité..."
              {...{
                onKeyDown: (e: any) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSpecialtyAdd();
                  }
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSpecialtyAdd}
            >
              Ajouter
            </Button>
          </div>
        </div>
      )}

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