
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, User, Mail, Lock, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { isFirebaseEnabled } from '@/lib/firebase';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function SignupPage() {
  const { signup, authState } = useAuth();
  const { t } = useSettings();
  const { toast } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firebaseDisabled, setFirebaseDisabled] = useState(false);

  useEffect(() => {
    // Check on client-side if Firebase is disabled
    setFirebaseDisabled(!isFirebaseEnabled);
  }, []);

  useEffect(() => {
    if (authState === 'authenticated') {
      router.push('/');
    }
  }, [authState, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: t('signup.errorTitle', 'Error'),
        description: t('signup.passwordMismatch', "Passwords do not match."),
        variant: "destructive"
      });
      return;
    }
    if (password.length < 6) {
        toast({
            title: t('signup.errorTitle', 'Error'),
            description: t('signup.passwordMinLength', 'Password must be at least 6 characters.'),
            variant: "destructive"
        });
        return;
    }
    setIsLoading(true);
    await signup({ name, email, password });
    setIsLoading(false);
  };
  
  if (authState === 'loading' || authState === 'authenticated') {
     return (
        <div className="flex-grow flex flex-col items-center justify-center">
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
    <div className="flex-grow flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t('signup.signUpLink', 'Sign up')}</CardTitle>
          <CardDescription>{t('signup.pageDescription', 'Fill out the fields below to sign up.')}</CardDescription>
        </CardHeader>
        <CardContent>
          {firebaseDisabled && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Configuração Incompleta</AlertTitle>
                <AlertDescription>
                  O cadastro está desativado. Para habilitá-lo, configure as variáveis de ambiente do Firebase no painel do seu projeto Vercel.
                </AlertDescription>
              </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('signup.nameLabel', 'Full Name')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={t('signup.namePlaceholder', 'Your full name')}
                  className="pl-10"
                  disabled={firebaseDisabled}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('signup.emailLabel', 'Email')}</Label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('signup.emailPlaceholder', 'your@email.com')}
                  className="pl-10"
                  disabled={firebaseDisabled}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('signup.passwordLabel', 'Password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t('signup.passwordPlaceholder', 'Create a strong password')}
                  className="pl-10 pr-10"
                  disabled={firebaseDisabled}
                />
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? t('signup.hidePassword', "Hide password") : t('signup.showPassword', "Show password")}
                    disabled={firebaseDisabled}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('signup.confirmPasswordLabel', 'Confirm Password')}</Label>
              <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder={t('signup.confirmPasswordPlaceholder', 'Repeat the password')}
                  className="pl-10 pr-10"
                  disabled={firebaseDisabled}
                />
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? t('signup.hideConfirmPassword', "Hide confirmation") : t('signup.showConfirmPassword', "Show confirmation")}
                    disabled={firebaseDisabled}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || firebaseDisabled}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? t('signup.creatingAccountButton', 'Creating account...') : t('signup.createAccountButton', 'Create Account')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {t('signup.hasAccount', 'Already have an account?')}
            <Link href="/login" className={`underline font-medium text-primary hover:text-primary/80 ${firebaseDisabled ? 'pointer-events-none opacity-50' : ''}`}>
              {' '}{t('login.loginLink', 'Log in')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
