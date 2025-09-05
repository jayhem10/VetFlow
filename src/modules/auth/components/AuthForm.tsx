'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import { Heading2, BodyText } from '@/components/atoms/Typography'
import { useAuth } from '../hooks/use-auth'
import { toast } from '@/lib/toast'
import { 
  signInSchema, 
  signUpSchema, 
  type SignInFormData, 
  type SignUpFormData 
} from '@/schemas/auth.schema'
import { cn } from '@/lib/utils'
import { ForgotPasswordForm } from '@/components/molecules/ForgotPasswordForm'

interface AuthFormProps {
  type: 'login' | 'register'
}

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, signUp, loading } = useAuth()
  const [submitLoading, setSubmitLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [autoReconnecting, setAutoReconnecting] = useState(false)
  console.log('loading', loading, 'submitLoading', submitLoading)
  const isLogin = type === 'login'
  const title = isLogin ? 'Connexion à VetFlow' : 'Créer votre compte VetFlow'
  const subtitle = isLogin 
    ? 'Accédez à votre tableau de bord vétérinaire' 
    : 'Rejoignez plus de 2,500 vétérinaires qui nous font confiance'

  // Formulaire de connexion
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Formulaire d'inscription
  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      clinicName: '',
      phone: '',
      acceptTerms: false,
    },
  })

  // Effet pour la reconnexion automatique après création de profil/clinique
  useEffect(() => {
    const autoReconnect = searchParams.get('auto-reconnect')
    const storedEmail = typeof window !== 'undefined' ? sessionStorage.getItem('auto-reconnect-email') : null
    
    if (autoReconnect === 'true' && storedEmail && isLogin) {
      console.log('🔄 Reconnexion automatique pour:', storedEmail)
      setAutoReconnecting(true)
      
      // Remplir automatiquement l'email
      signInForm.setValue('email', storedEmail)
      
      // Afficher un message à l'utilisateur
      toast.success('Profil créé ! Reconnectez-vous pour voir vos données à jour.')
      
      // Nettoyer le storage
      sessionStorage.removeItem('auto-reconnect-email')
    }
  }, [searchParams, isLogin, signInForm])

  const handleSignIn = async (data: SignInFormData) => {
    setSubmitLoading(true)
    try {
      const result = await signIn(data)
      
      if (result.success) {
        toast.success('Connexion réussie ! Redirection...')
        router.push(result.redirectTo || '/dashboard')
      } else {
        toast.error(result.error || 'Erreur lors de la connexion')
      }
    } catch (error) {
      toast.error('Erreur lors de la connexion')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleSignUp = async (data: SignUpFormData) => {
    console.log('📝 Formulaire soumis:', data)
    setSubmitLoading(true)
    try {
      const { acceptTerms, confirmPassword, ...signUpData } = data
      console.log('🔄 Données envoyées à signUp:', signUpData)
      
      const result = await signUp(signUpData)
      console.log('📩 Résultat signUp:', result)
      
      if (result.success) {
        console.log('✅ Inscription réussie!')
        toast.success('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.')
        router.push('/dashboard')
      } else {
        console.log('❌ Erreur inscription:', result.error)
        toast.error(result.error || 'Erreur lors de l\'inscription')
      }
    } catch (error) {
      console.error('💥 Erreur dans handleSignUp:', error)
      toast.error('Erreur lors de l\'inscription')
    } finally {
      setSubmitLoading(false)
    }
  }

  // Si on affiche le formulaire de mot de passe oublié
  if (isLogin && showForgotPassword) {
    return (
      <div className="w-full max-w-md mx-auto">
        <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <Heading2 className="mb-2 text-gray-900 dark:text-white">
          {title}
        </Heading2>
        <BodyText className="text-gray-600 dark:text-gray-400">
          {subtitle}
        </BodyText>
      </div>

      {autoReconnecting && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">
            ✅ Profil et clinique créés avec succès ! Connectez-vous pour accéder à votre espace.
          </p>
        </div>
      )}

      {isLogin ? (
        <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
          <Controller
            name="email"
            control={signInForm.control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Email professionnel"
                type="email"
                placeholder="votre@email.com"
                error={error?.message}
                className={cn(error && "border-red-500")}
                autoComplete="email"
              />
            )}
          />

          <Controller
            name="password"
            control={signInForm.control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Mot de passe"
                type="password"
                placeholder="Votre mot de passe"
                error={error?.message}
                className={cn(error && "border-red-500")}
                autoComplete="current-password"
              />
            )}
          />

          <Button 
            variant="primary" 
            size="lg"
            className="w-full"
            type="submit"
            disabled={loading || submitLoading}
          >
            {(loading || submitLoading) ? (
              'Chargement...'
            ) : (
              '🔑 Se connecter'
            )}
          </Button>

          <div className="text-center">
            <button 
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-green-700 dark:text-green-400 hover:underline"
            >
              Mot de passe oublié ?
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Controller
                name="firstName"
                control={signUpForm.control}
                render={({ field, fieldState: { error } }) => (
                  <Input
                    {...field}
                    label="Prénom"
                    type="text"
                    placeholder="Votre prénom"
                    error={error?.message}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                name="lastName"
                control={signUpForm.control}
                render={({ field, fieldState: { error } }) => (
                  <Input
                    {...field}
                    label="Nom"
                    type="text"
                    placeholder="Votre nom"
                    error={error?.message}
                  />
                )}
              />
            </div>
          </div>
          
          <Controller
            name="clinicName"
            control={signUpForm.control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Nom de la clinique"
                type="text"
                placeholder="Nom de votre clinique vétérinaire"
                error={error?.message}
              />
            )}
          />
          
          <Controller
            name="phone"
            control={signUpForm.control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Téléphone"
                type="tel"
                placeholder="06 12 34 56 78"
                error={error?.message}
              />
            )}
          />

          <Controller
            name="email"
            control={signUpForm.control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Email professionnel"
                type="email"
                placeholder="votre@email.com"
                error={error?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={signUpForm.control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Mot de passe"
                type="password"
                placeholder="Minimum 8 caractères"
                error={error?.message}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={signUpForm.control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Confirmer le mot de passe"
                type="password"
                placeholder="Répétez votre mot de passe"
                error={error?.message}
              />
            )}
          />

          <div className="flex items-start space-x-3 mb-6">
            <Controller
              name="acceptTerms"
              control={signUpForm.control}
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <>
                  <input 
                    type="checkbox" 
                    id="terms"
                    checked={value}
                    onChange={onChange}
                    className={cn(
                      "mt-1 h-4 w-4 text-green-700 border-stone-300 dark:border-gray-600 rounded focus:ring-green-500",
                      error && "border-red-500"
                    )}
                  />
                  <div>
                    <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                      J'accepte les{' '}
                      <a href="#" className="text-green-700 dark:text-green-400 hover:underline">
                        conditions d'utilisation
                      </a>
                      {' '}et la{' '}
                      <a href="#" className="text-green-700 dark:text-green-400 hover:underline">
                        politique de confidentialité
                      </a>
                    </label>
                    {error && (
                      <p className="text-sm text-red-500 mt-1">{error.message}</p>
                    )}
                  </div>
                </>
              )}
            />
          </div>

          <Button 
            variant="primary" 
            size="lg"
            className="w-full"
            type="submit"
            disabled={loading || submitLoading}
          >
            {(loading || submitLoading) ? (
              'Chargement...'
            ) : (
              '🚀 Créer mon compte'
            )}
          </Button>
        </form>
      )}

      <div className="mt-8 text-center">
        <BodyText className="text-gray-600 dark:text-gray-400">
          {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
        </BodyText>
        <a 
          href={isLogin ? "/register" : "/login"} 
          className="text-green-700 dark:text-green-400 hover:underline font-medium ml-1"
        >
          {isLogin ? "Créer un compte" : "Se connecter"}
        </a>
      </div>
    </div>
  )
} 