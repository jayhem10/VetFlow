import { z } from 'zod'

// Schéma pour la connexion
export const signInSchema = z.object({
  email: z.string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  password: z.string()
    .min(1, 'Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

// Schéma pour l'inscription
export const signUpSchema = z.object({
  firstName: z.string()
    .min(1, 'Le prénom est requis')
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  lastName: z.string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  email: z.string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  password: z.string()
    .min(1, 'Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    ),
  confirmPassword: z.string()
    .min(1, 'La confirmation du mot de passe est requise'),
  clinicName: z.string()
    .min(1, 'Le nom de la clinique est requis')
    .min(2, 'Le nom de la clinique doit contenir au moins 2 caractères')
    .max(100, 'Le nom de la clinique ne peut pas dépasser 100 caractères'),
  phone: z.string()
    .min(1, 'Le numéro de téléphone est requis')
    .regex(
      /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
      'Format de téléphone français invalide'
    ),
  acceptTerms: z.boolean()
    .refine(val => val === true, {
      message: 'Vous devez accepter les conditions d\'utilisation'
    })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

// Schéma pour la réinitialisation de mot de passe
export const resetPasswordSchema = z.object({
  email: z.string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
})

// Schémas pour l'inscription multi-étapes - MOT DE PASSE À LA FIN
export const step1Schema = z.object({
  firstName: z.string()
    .min(1, 'Le prénom est requis')
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  lastName: z.string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  email: z.string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
})

export const step2Schema = z.object({
  phone: z.string()
    .min(1, 'Le numéro de téléphone est requis')
    .regex(
      /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
      'Format de téléphone français invalide (ex: 01 23 45 67 89)'
    ),
  mobile: z.string()
    .regex(
      /^(?:(?:\+|00)33|0)\s*[6-7](?:[\s.-]*\d{2}){4}$/,
      'Format de mobile français invalide (ex: 06 12 34 56 78)'
    )
    .optional()
    .or(z.literal('')),
  address: z.string()
    .max(200, 'L\'adresse ne peut pas dépasser 200 caractères')
    .optional()
    .or(z.literal('')),
  city: z.string()
    .max(100, 'La ville ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),
  postalCode: z.string()
    .regex(
      /^[0-9]{5}$/,
      'Code postal français invalide (5 chiffres requis)'
    )
    .optional()
    .or(z.literal('')),
  country: z.string()
    .min(1, 'Le pays est requis'),
  preferredContact: z.enum(['email', 'phone', 'mobile']),
  marketingConsent: z.boolean(),
})

export const step3Schema = z.object({
  clinicName: z.string()
    .min(1, 'Le nom de la clinique est requis')
    .min(2, 'Le nom de la clinique doit contenir au moins 2 caractères')
    .max(100, 'Le nom de la clinique ne peut pas dépasser 100 caractères'),
  clinicEmail: z.string()
    .email('Format d\'email invalide')
    .optional()
    .or(z.literal('')),
  clinicPhone: z.string()
    .regex(
      /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
      'Format de téléphone français invalide'
    )
    .optional()
    .or(z.literal('')),
  clinicAddress: z.string()
    .max(200, 'L\'adresse ne peut pas dépasser 200 caractères')
    .optional()
    .or(z.literal('')),
  clinicCity: z.string()
    .max(100, 'La ville ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),
  clinicPostalCode: z.string()
    .regex(
      /^[0-9]{5}$/,
      'Code postal français invalide (5 chiffres requis)'
    )
    .optional()
    .or(z.literal('')),
  subscriptionPlan: z.enum(['starter', 'professional', 'clinic']),
})

// Schéma pour l'étape finale avec mot de passe
export const step4Schema = z.object({
  password: z.string()
    .min(1, 'Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    ),
  confirmPassword: z.string()
    .min(1, 'La confirmation du mot de passe est requise'),
  acceptTerms: z.boolean()
    .refine(val => val === true, {
      message: 'Vous devez accepter les conditions d\'utilisation'
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

// Type pour toutes les données d'inscription
export const fullRegistrationSchema = step1Schema.merge(step2Schema).merge(step3Schema).merge(
  z.object({
    password: z.string(),
    confirmPassword: z.string(),
  })
)

// Types inférés des schémas
export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type Step1FormData = z.infer<typeof step1Schema>
export type Step2FormData = z.infer<typeof step2Schema>
export type Step3FormData = z.infer<typeof step3Schema>
export type Step4FormData = z.infer<typeof step4Schema>
export type FullRegistrationData = z.infer<typeof fullRegistrationSchema>

// Schéma pour la création du profil
export const profileCreationSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  role: z.enum(['veterinarian', 'assistant']).default('veterinarian'),
  license_number: z.string().optional(),
  specialties: z.array(z.string()).optional(),
})

export type ProfileCreationData = z.infer<typeof profileCreationSchema>

// Schéma pour la création de la clinique
export const clinicCreationSchema = z.object({
  name: z.string().min(2, 'Le nom de la clinique doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  address: z.string().min(5, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  postal_code: z.string().min(5, 'Code postal invalide'),
  country: z.string().min(2, 'Pays requis').default('France'),
  subscription_plan: z.enum(['starter', 'professional', 'clinic']).default('starter'),
})

export type ClinicCreationData = z.infer<typeof clinicCreationSchema> 