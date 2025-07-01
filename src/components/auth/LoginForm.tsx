
'use client';

import React, { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { login, LoginFormState } from '@/app/login/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';

const initialState: LoginFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
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
  const [state, formAction] = useFormState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const { login: authLogin } = useAuth();
  const { t } = useSettings();

  useEffect(() => {
    if (state?.redirectTo && state.user) {
      authLogin(state.user.role, state.user.email);
    }
  }, [state, authLogin]);

  return (
    <form action={formAction} className="space-y-6">
      {state?.errors?.form && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('login.errorTitle', 'Erro de Login')}</AlertTitle>
          <AlertDescription>{t(state.errors.form.join(', '), state.errors.form.join(', '))}</AlertDescription>
        </Alert>
      )}
       {state?.message && !state.errors && !state.redirectTo && (
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('login.successTitle', 'Sucesso')}</AlertTitle>
          <AlertDescription>{t(state.message, state.message)}</AlertDescription>
        </Alert>
      )}
      {state?.message && state.redirectTo && (
         <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('login.successTitle', 'Sucesso')}</AlertTitle>
          <AlertDescription>{t(state.message, state.message)}</AlertDescription>
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
          defaultValue={state?.fields?.email}
          aria-describedby="email-error"
          className={state?.errors?.email ? 'border-destructive' : ''}
        />
        {state?.errors?.email && (
          <p id="email-error" className="text-sm text-destructive">
            {t(state.errors.email.join(', '), state.errors.email.join(', '))}
          </p>
        )}
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
            aria-describedby="password-error"
            className={state?.errors?.password ? 'border-destructive' : ''}
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
        {state?.errors?.password && (
          <p id="password-error" className="text-sm text-destructive">
            {t(state.errors.password.join(', '), state.errors.password.join(', '))}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="rememberMe" name="rememberMe" defaultChecked={!!state?.fields?.rememberMe} />
        <Label htmlFor="rememberMe" className="text-sm font-normal">
          {t('login.rememberMe', 'Lembrar-me')}
        </Label>
      </div>
      
      <SubmitButton />
    </form>
  );
}

    
