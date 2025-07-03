
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { demoUsers } from '@/lib/mockData';
import type { User } from '@/types';

// The LS_USERS_KEY needs to be consistent with the admin page and signup page
const LS_USERS_KEY = 'vigiatemp_admin_users';

function SubmitButton({ pending }: { pending: boolean }) {
  const { t } = useSettings();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {t('login.submitting', 'Entrando...')}
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-4 w-4" /> {t('login.submit', 'Entrar')}
        </>
      )}
    </Button>
  );
}

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login: authLogin } = useAuth();
  const { t } = useSettings();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = (formData.get('email') as string || '').toLowerCase().trim();
    const password = formData.get('password') as string;

    // Simulate async operation
    setTimeout(() => {
      let users: User[] = [];
      try {
        const storedUsers = localStorage.getItem(LS_USERS_KEY);
        if (storedUsers) {
          users = JSON.parse(storedUsers);
        } else {
          // If no users are in localStorage, initialize with demo data
          users = demoUsers;
          localStorage.setItem(LS_USERS_KEY, JSON.stringify(demoUsers));
        }
      } catch (e) {
        users = demoUsers;
      }

      const foundUser = users.find(u => u.email.toLowerCase() === email);

      // --- Admin login logic ---
      const adminUsers: Record<string, string> = {
        'admin': 'admin',
        'spetoki@gmail.com': '123456',
      };

      if (adminUsers[email]) {
        if (password === adminUsers[email]) {
          authLogin('admin', email);
          // Redirect is handled by the AuthContext now
          return;
        } else {
          setError(t('login.authError', 'Email ou senha inválidos.'));
          setIsLoading(false);
          return;
        }
      }

      // --- Regular user login logic ---
      if (!foundUser) {
        setError(t('login.authError', 'Email ou senha inválidos.'));
        setIsLoading(false);
        return;
      }
      
      // For demo purposes, any password is correct unless it's "fail"
      if (password === 'fail') {
        setError(t('login.authError', 'Email ou senha inválidos.'));
        setIsLoading(false);
        return;
      }

      if (foundUser.status === 'Pending') {
        setError(t('login.pendingApproval', 'Sua conta está pendente de aprovação por um administrador.'));
        setIsLoading(false);
        return;
      }
      
      if (foundUser.status === 'Inactive') {
        setError(t('login.inactiveAccount', 'Esta conta está inativa.'));
        setIsLoading(false);
        return;
      }

      if (foundUser.status === 'Active') {
        authLogin('user', email);
        return;
      }

      // Fallback error
      setError(t('login.authError', 'Email ou senha inválidos.'));
      setIsLoading(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('login.errorTitle', 'Erro de Login')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">{t('login.emailLabel', 'Email ou "admin"')}</Label>
        <Input
          id="email"
          name="email"
          type="text" 
          placeholder={t('login.emailPlaceholder', 'seu@email.com ou admin')}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t('login.passwordLabel', 'Senha')}</Label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            {t('login.forgotPassword', 'Esqueceu a senha?')}
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('login.passwordPlaceholder', 'Sua senha')}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={t(showPassword ? 'signup.hidePassword' : 'signup.showPassword', showPassword ? 'Ocultar senha' : 'Mostrar senha')}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="rememberMe" name="rememberMe" />
        <Label htmlFor="rememberMe" className="text-sm font-normal">
          {t('login.rememberMe', 'Lembrar-me')}
        </Label>
      </div>
      
      <SubmitButton pending={isLoading} />
    </form>
  );
}
