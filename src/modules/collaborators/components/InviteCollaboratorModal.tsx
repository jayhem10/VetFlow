'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore';

const inviteSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  role: z.enum(['vet', 'assistant'], {
    required_error: 'Le rôle est requis'
  }),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteCollaboratorModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteCollaboratorModal({ onClose, onSuccess }: InviteCollaboratorModalProps) {
  const { inviteCollaborator } = useCollaboratorsStore();
  
  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      role: 'assistant',
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    try {
      await inviteCollaborator({
        ...data,
      });

      toast.success('Invitation envoyée avec succès !');
      onSuccess();
    } catch (error) {
      console.error('Erreur invitation:', error);
      toast.error('Erreur lors de l\'envoi de l\'invitation');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Inviter un collaborateur
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            <Input
              {...form.register('email')}
              type="email"
              placeholder="collaborateur@email.com"
              error={form.formState.errors.email?.message}
            />
          </div>

          {/* Prénom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prénom *
            </label>
            <Input
              {...form.register('firstName')}
              placeholder="Prénom"
              error={form.formState.errors.firstName?.message}
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom *
            </label>
            <Input
              {...form.register('lastName')}
              placeholder="Nom"
              error={form.formState.errors.lastName?.message}
            />
          </div>

          {/* Rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rôle *
            </label>
            <Select
              value={form.watch('role')}
              onChange={(value) => form.setValue('role', value as 'vet' | 'assistant')}
              options={[
                { value: 'assistant', label: 'Assistant(e) vétérinaire' },
                { value: 'vet', label: 'Vétérinaire' }
              ]}
              placeholder="Sélectionner un rôle"
              error={form.formState.errors.role?.message}
            />
          </div>

          {/* Info */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-green-700 dark:text-green-400 text-lg">ℹ️</span>
              <div className="text-sm text-green-900 dark:text-green-200">
                <p className="font-medium mb-1">Information</p>
                <p>
                  Le collaborateur recevra un email d'invitation avec un lien pour créer son compte et rejoindre votre clinique.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
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
              {form.formState.isSubmitting ? 'Envoi...' : '📧 Envoyer l\'invitation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}