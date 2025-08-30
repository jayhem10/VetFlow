'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from '@/lib/toast'
import { authService } from '@/modules/auth/services/auth.service'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Card from '@/components/atoms/Card'

const signUpSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

type SignUpFormData = z.infer<typeof signUpSchema>

export function SimpleSignUpForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (data: SignUpFormData) => {
    setIsSubmitting(true)
    
    try {
      const result = await authService.signUpSimple(data.email, data.password)
      
      if (result.success) {
        setIsSuccess(true)
        toast.success('🎉 Compte créé ! Vérifiez votre email pour confirmer votre compte.')
      } else {
        toast.error(result.error || 'Une erreur s\'est produite lors de l\'inscription')
      }
    } catch (error) {
      console.error('Erreur inscription:', error)
      toast.error('Une erreur s\'est produite lors de l\'inscription')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-green-700">
            🎉 Compte créé avec succès !
          </h2>
          <p className="text-gray-600">
            Nous avons envoyé un email de confirmation à votre adresse.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Vérifiez votre boîte de réception et cliquez sur le lien de confirmation.
            </p>
            <p className="text-sm text-gray-600">
              Une fois confirmé, vous pourrez vous connecter et compléter votre profil.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            Créer votre compte VetFlow
          </h2>
          <p className="text-gray-600 mt-2">
            Commencez votre essai gratuit de 15 jours
          </p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email professionnel"
            type="email"
            placeholder="votre@email.com"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
          />

          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            {...form.register('password')}
            error={form.formState.errors.password?.message}
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            placeholder="••••••••"
            {...form.register('confirmPassword')}
            error={form.formState.errors.confirmPassword?.message}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Création en cours...' : 'Créer mon compte'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            En créant votre compte, vous acceptez nos{' '}
            <a href="#" className="text-green-700 hover:underline">conditions d'utilisation</a>
            {' '}et notre{' '}
            <a href="#" className="text-green-700 hover:underline">politique de confidentialité</a>.
          </p>
        </form>
      </div>
    </Card>
  )
} 