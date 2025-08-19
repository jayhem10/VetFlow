'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import { validatePassword } from '@/lib/password'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(1, 'Nouveau mot de passe requis'),
  confirmPassword: z.string().min(1, 'Confirmation du mot de passe requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
}).refine((data) => {
  const validation = validatePassword(data.newPassword)
  return validation.isValid
}, {
  message: "Le nouveau mot de passe ne respecte pas les critères de sécurité",
  path: ["newPassword"],
})

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export default function ChangePasswordPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: false, errors: [] })

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  // Vérifier si l'utilisateur doit changer son mot de passe
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/login')
      return
    }

    // Si l'utilisateur n'a pas besoin de changer son mot de passe, rediriger vers le dashboard
    if (!session.user.mustChangePassword) {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  const handlePasswordChange = (password: string) => {
    const validation = validatePassword(password)
    setPasswordValidation(validation)
  }

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors du changement de mot de passe')
      }

      toast.success('Mot de passe modifié avec succès !')
      router.push('/dashboard')
    } catch (error) {
      const message = (error as Error)?.message || 'Erreur lors du changement de mot de passe'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            🔐 Changer votre mot de passe
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Pour des raisons de sécurité, vous devez changer votre mot de passe temporaire
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Mot de passe actuel */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe actuel
              </label>
              <Input
                id="currentPassword"
                type="password"
                {...form.register('currentPassword')}
                error={form.formState.errors.currentPassword?.message}
                placeholder="Votre mot de passe temporaire"
              />
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nouveau mot de passe
              </label>
              <Input
                id="newPassword"
                type="password"
                {...form.register('newPassword')}
                error={form.formState.errors.newPassword?.message}
                placeholder="Votre nouveau mot de passe"
                onChange={(e) => {
                  form.register('newPassword').onChange(e)
                  handlePasswordChange(e.target.value)
                }}
              />
              
              {/* Critères de sécurité */}
              {form.watch('newPassword') && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Critères de sécurité :
                  </p>
                  <ul className="text-xs space-y-1">
                    <li className={form.watch('newPassword').length >= 8 ? 'text-green-600' : 'text-red-600'}>
                      ✓ Au moins 8 caractères
                    </li>
                    <li className={/[A-Z]/.test(form.watch('newPassword')) ? 'text-green-600' : 'text-red-600'}>
                      ✓ Au moins une majuscule
                    </li>
                    <li className={/[a-z]/.test(form.watch('newPassword')) ? 'text-green-600' : 'text-red-600'}>
                      ✓ Au moins une minuscule
                    </li>
                    <li className={/\d/.test(form.watch('newPassword')) ? 'text-green-600' : 'text-red-600'}>
                      ✓ Au moins un chiffre
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirmation du mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <Input
                id="confirmPassword"
                type="password"
                {...form.register('confirmPassword')}
                error={form.formState.errors.confirmPassword?.message}
                placeholder="Confirmez votre nouveau mot de passe"
              />
            </div>

            {/* Bouton de soumission */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !passwordValidation.isValid}
              loading={isLoading}
            >
              {isLoading ? 'Modification...' : 'Modifier le mot de passe'}
            </Button>
          </form>
        </Card>

        {/* Informations de sécurité */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-blue-700 dark:text-blue-400 text-lg">🔒</span>
            <div className="text-sm text-blue-900 dark:text-blue-200">
              <p className="font-medium mb-1">Sécurité</p>
              <p>
                Votre nouveau mot de passe doit respecter les critères de sécurité affichés ci-dessus.
                Une fois modifié, vous pourrez accéder à votre espace VetFlow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
