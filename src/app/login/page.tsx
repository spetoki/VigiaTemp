
"use client";

import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import AuthLayout from '@/components/layout/AuthLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThermometerSnowflake } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/context/SettingsContext';

export default function LoginPage() {
  const { authState } = useAuth();
  const router = useRouter();
  const { t } = useSettings();

  useEffect(() => {
    if (authState === 'user') {
      router.push('/');
    } else if (authState === 'admin') {
      router.push('/admin');
    }
  }, [authState, router]);

  if (authState === 'loading' || authState === 'user' || authState === 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
            <Skeleton className="h-7 w-24 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full mt-4" />
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
            <CardTitle className="text-2xl font-bold">{t('nav.login', 'Login')}</CardTitle>
            <CardDescription>{t('login.pageDescription', 'Bem-vindo de volta! Acesse sua conta.')}</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <div className="mt-6 text-center text-sm">
              {t('login.noAccount', 'Não tem uma conta?')}
              {' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                {t('signup.signUpLink', 'Cadastre-se')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
