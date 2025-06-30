
"use client";

import Link from 'next/link';
import SignUpForm from '@/components/auth/SignUpForm';
import AuthLayout from '@/components/layout/AuthLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThermometerSnowflake } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/context/SettingsContext';

export default function SignUpPage() {
  const { authState } = useAuth();
  const router = useRouter();
  const { t } = useSettings();

  useEffect(() => {
    if (authState === 'user' || authState === 'admin') {
      router.push('/');
    }
  }, [authState, router]);

  if (authState === 'loading' || authState === 'user' || authState === 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
            <Skeleton className="h-7 w-32 mx-auto" />
            <Skeleton className="h-4 w-56 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center min-h-screen py-12">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
             <Link href="/" className="inline-block mb-4">
                <ThermometerSnowflake className="h-12 w-12 text-primary mx-auto" />
            </Link>
            <CardTitle className="text-2xl font-bold">{t('signup.createAccountButton', 'Criar Conta')}</CardTitle>
            <CardDescription>{t('signup.pageDescription', 'Preencha os campos abaixo para se cadastrar.')}</CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm />
            <div className="mt-6 text-center text-sm">
              {t('signup.hasAccount', 'Já tem uma conta?')}
              {' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                {t('login.loginLink', 'Faça login')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
