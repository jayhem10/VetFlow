import { Metadata } from 'next';
import { AuthLayout } from '@/components/templates/AuthLayout';
import { SimpleSignUpForm } from '@/modules/auth/components/SimpleSignUpForm';

export const metadata: Metadata = {
  title: 'Inscription - VetFlow',
  description: 'Créez votre compte VetFlow et rejoignez plus de 2,500 vétérinaires qui nous font confiance.',
};

export default function RegisterPage() {
  return (
    <AuthLayout>
      <SimpleSignUpForm />
    </AuthLayout>
  );
} 