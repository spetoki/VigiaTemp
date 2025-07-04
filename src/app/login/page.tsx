
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useSettings } from '@/context/SettingsContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginPage() {
  const { login, authState } = useAuth();
  const { t } = useSettings();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (authState === 'authenticated') {
      router.push('/');
    }
  }, [authState, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: t('login.errorTitle', 'Login Error'),
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    await login(email, password);
    setIsLoading(false);
  };

  if (authState === 'loading' || authState === 'authenticated') {
     return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-md space-y-4">
                <Skeleton className="h-10 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-full mx-auto" />
                <div className="p-6 space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t('nav.login', 'Login')}</CardTitle>
          <CardDescription>{t('login.pageDescription', 'Welcome back! Access your account.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.emailLabel', 'Login')}</Label>
              <Input
                id="email"
                type="text"
                placeholder={t('login.emailPlaceholder', "Digite 'admin' para o login de administrador")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password">{t('login.passwordLabel', 'Password')}</Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('login.passwordPlaceholder', 'Your password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
               <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-7 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('signup.hidePassword', "Hide password") : t('signup.showPassword', "Show password")}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? t('login.submitting', 'Signing in...') : t('login.submit', 'Sign In')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {t('login.noAccount', "Don't have an account?")}{' '}
            <Link href="/signup" className="underline font-medium text-primary hover:text-primary/80">
              {t('signup.signUpLink', 'Sign up')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
