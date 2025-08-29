'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from '@/lib/toast'
import Button from '@/components/atoms/Button'
import Select from '@/components/atoms/Select'
import { MultiRoleSelect } from '@/components/molecules/MultiRoleSelect'
import { Dialog } from '@/components/atoms/Dialog'
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore'
import type { TProfile } from '@/types/database.types'

const editCollaboratorSchema = z.object({
  role: z.string().min(1, 'Au moins un rôle est requis'),
  calendarColor: z.enum(['emerald','blue','purple','rose','amber','lime','cyan','fuchsia','indigo','teal']).optional(),
});

type EditCollaboratorFormData = z.infer<typeof editCollaboratorSchema>

interface EditCollaboratorModalProps {
  collaborator: TProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditCollaboratorModal({ collaborator, isOpen, onClose, onSuccess }: EditCollaboratorModalProps) {
  const { updateCollaboratorRole, updateCollaboratorColor } = useCollaboratorsStore();
  
  // Extraire le rôle de base (sans admin)
  const baseRole = collaborator.role.includes('admin') 
    ? collaborator.role.replace(',admin', '').replace('admin,', '')
    : collaborator.role;
  
  const isAdmin = collaborator.role.includes('admin');
  
  const form = useForm<EditCollaboratorFormData>({
    resolver: zodResolver(editCollaboratorSchema),
    defaultValues: {
      role: baseRole,
      calendarColor: collaborator.calendar_color as any || undefined,
    },
  });

  const onSubmit = async (data: EditCollaboratorFormData) => {
    try {
      // Mettre à jour le rôle
      await updateCollaboratorRole(collaborator.id, data.role);
      
      // Mettre à jour la couleur si elle a changé
      if (data.calendarColor !== collaborator.calendar_color) {
        await updateCollaboratorColor(collaborator.id, data.calendarColor);
      }

      toast.success('Collaborateur mis à jour avec succès !');
      onSuccess();
    } catch (error) {
      const message = (error as Error)?.message || 'Erreur lors de la mise à jour';
      console.error('Erreur mise à jour collaborateur:', message);
      toast.error(message);
      // Ne pas fermer la modale en cas d'erreur pour permettre à l'utilisateur de corriger
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier le collaborateur"
      size="lg"
    >
      <div className="space-y-6">
        {/* Informations du collaborateur */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="w-10 h-10 bg-green-700 text-white rounded-full flex items-center justify-center text-sm font-medium">
            {collaborator.first_name.charAt(0).toUpperCase()}{collaborator.last_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {collaborator.first_name} {collaborator.last_name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {collaborator.email}
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rôles
            </label>
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
              {form.formState.isSubmitting ? 'Sauvegarde...' : '💾 Sauvegarder'}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
