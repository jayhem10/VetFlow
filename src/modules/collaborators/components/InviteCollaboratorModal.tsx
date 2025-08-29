'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from '@/lib/toast'
import Input from '@/components/atoms/Input'
import Button from '@/components/atoms/Button'
import Select from '@/components/atoms/Select'
import { MultiRoleSelect } from '@/components/molecules/MultiRoleSelect'
import { Dialog } from '@/components/atoms/Dialog'
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore'
import { Mail } from 'lucide-react'

const inviteSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  role: z.string().min(1, 'Au moins un rôle est requis'),
  calendarColor: z.enum(['emerald','blue','purple','rose','amber','lime','cyan','fuchsia','indigo','teal']).optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>

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
      role: '',
      calendarColor: undefined,
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    try {
      await inviteCollaborator({
        ...data,
        calendarColor: data.calendarColor,
      });

      toast.success('Invitation envoyée avec succès !');
      onSuccess();
    } catch (error) {
      const message = (error as Error)?.message || 'Erreur lors de l\'envoi de l\'invitation';
      console.error('Erreur invitation:', message);
      toast.error(message);
    }
  };

  return (
    <Dialog
      isOpen={true}
      onClose={onClose}
      title="Inviter un collaborateur"
      size="lg"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email *
          </label>
          <Input
            {...form.register('email')}
            type="email"
            placeholder="collaborateur@email.com"
            error={form.formState.errors.email?.message}
          />
        </div>

        {/* Prénom et Nom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prénom *
            </label>
            <Input
              {...form.register('firstName')}
              placeholder="Prénom"
              error={form.formState.errors.firstName?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom *
            </label>
            <Input
              {...form.register('lastName')}
              placeholder="Nom"
              error={form.formState.errors.lastName?.message}
            />
          </div>
        </div>

        {/* Rôle */}
        <div>
          <MultiRoleSelect
            value={form.watch('role')}
            onChange={(value) => form.setValue('role', value)}
            error={form.formState.errors.role?.message}
          />
        </div>



        {/* Couleur calendrier */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Couleur du calendrier
          </label>
          <Select
            value={form.watch('calendarColor') as any}
            onChange={(value) => form.setValue('calendarColor', value as any)}
            options={[
              { value: 'emerald', label: 'Emerald' },
              { value: 'blue', label: 'Blue' },
              { value: 'purple', label: 'Purple' },
              { value: 'rose', label: 'Rose' },
              { value: 'amber', label: 'Amber' },
              { value: 'lime', label: 'Lime' },
              { value: 'cyan', label: 'Cyan' },
              { value: 'fuchsia', label: 'Fuchsia' },
              { value: 'indigo', label: 'Indigo' },
              { value: 'teal', label: 'Teal' },
            ]}
            placeholder="Choisir une couleur (optionnel)"
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
            {form.formState.isSubmitting ? 'Envoi...' : (
              <>
                <Mail className="w-4 h-4" />
                Envoyer l'invitation
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}