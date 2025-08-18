import { z } from 'zod'

export const appointmentSchema = z.object({
  animal_id: z.string().uuid('Animal requis'),
  veterinarian_id: z.string().uuid('Vétérinaire requis'),
  title: z.string().min(1, 'Titre requis').max(255, 'Maximum 255 caractères'),
  description: z.string().max(1000, 'Maximum 1000 caractères').optional(),
  appointment_date: z.string().min(1, 'Date requise'),
  duration_minutes: z.number().int().min(15, 'Minimum 15 minutes').max(480, 'Maximum 8 heures').multipleOf(5, 'Par tranches de 5 min').default(30),
  appointment_type: z.enum(['consultation', 'vaccination', 'surgery', 'checkup', 'emergency']).default('consultation'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).default('scheduled'),
  notes: z.string().max(1000, 'Maximum 1000 caractères').optional(),
  internal_notes: z.string().max(1000, 'Maximum 1000 caractères').optional(),
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>


