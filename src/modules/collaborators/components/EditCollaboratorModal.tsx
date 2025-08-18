'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore';
import type { TProfile } from '@/types/database.types';

const editCollaboratorSchema = z.object({
  role: z.enum(['vet', 'assistant'], {
    required_error: 'Le rôle est requis'
  }),
  isAdmin: z.boolean().optional().default(false),
  calendarColor: z.enum(['emerald','blue','purple','rose','amber','lime','cyan','fuchsia','indigo','teal']).optional(),
});

type EditCollaboratorFormData = z.infer<typeof editCollaboratorSchema>;

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
    ? collaborator.role.replace(',admin', '').replace('admin,', '') as 'vet' | 'assistant'
    : collaborator.role as 'vet' | 'assistant';
  
  const isAdmin = collaborator.role.includes('admin');
  
  const form = useForm<EditCollaboratorFormData>({
    resolver: zodResolver(editCollaboratorSchema),
    defaultValues: {
      role: baseRole,
      isAdmin: isAdmin,
      calendarColor: collaborator.calendar_color as any || undefined,
    },
  });

  const onSubmit = async (data: EditCollaboratorFormData) => {
    try {
      // Construire le rôle final (rôle de base + admin si demandé)
      const finalRole = data.isAdmin ? `${data.role},admin` : data.role;
      
      // Mettre à jour le rôle
      await updateCollaboratorRole(collaborator.id, finalRole);
      
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Modifier le collaborateur
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

        <div className="mb-6">
          <div className="flex items-center space-x-3">
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
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rôle principal
            </label>
            <Select
              value={form.watch('role')}
              onChange={(value) => form.setValue('role', value as 'vet' | 'assistant')}
              options={[
                { value: 'vet', label: 'Vétérinaire' },
                { value: 'assistant', label: 'Assistant(e)' },
              ]}
              placeholder="Sélectionner un rôle"
            />
            {form.formState.errors.role && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.role.message}</p>
            )}
          </div>

          {/* Droits administrateur */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...form.register('isAdmin')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Accorder les droits administrateur
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Permet d'inviter d'autres collaborateurs et d'accéder aux paramètres avancés
            </p>
          </div>

          {/* Couleur calendrier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={form.formState.isSubmitting}
              disabled={form.formState.isSubmitting}
            >
              Mettre à jour
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
