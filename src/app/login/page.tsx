import { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLayout } from '@/components/templates/AuthLayout';
import AuthForm from '@/modules/auth/components/AuthForm';

export const metadata: Metadata = {
  title: 'Connexion - VetFlow',
  description: 'Connectez-vous à votre compte VetFlow pour accéder à votre tableau de bord vétérinaire.',
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div>Chargement...</div>}>
        <AuthForm type="login" />
      </Suspense>
    </AuthLayout>
  );
} 