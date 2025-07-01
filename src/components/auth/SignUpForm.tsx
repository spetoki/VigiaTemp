
'use client';

import React, { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { signup, SignUpFormState } from '@/app/signup/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Eye, EyeOff, AlertCircle, UserPlus, CheckCircle } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import type { User } from '@/types';

const initialState: SignUpFormState = {};

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
          <>{t('signup.creatingAccountButton', 'Criando conta...')}</>
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          <>{t('signup.createAccountButton', 'Criar Conta')}</>
        </>
      )}
    </Button>
  );
}

export default function SignUpForm() {
  const [state, formAction] = useFormState(signup, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { t } = useSettings();

  useEffect(() => {
    // When the server action is successful, add the new user to localStorage.
    if (state.success && state.fields?.email && state.fields?.name) {
      const LS_USERS_KEY = 'vigiatemp_admin_users';
      
      try {
        const storedUsersRaw = localStorage.getItem(LS_USERS_KEY);
        const users: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

        // Prevent adding a duplicate if the form is submitted multiple times
        if (users.some(user => user.email === state.fields!.email)) {
            return;
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            name: state.fields.name,
            email: state.fields.email,
            role: 'User',
            status: 'Pending', // New users are set to Pending for admin approval
            joinedDate: new Date().toISOString().split('T')[0],
            subscriptionTier: 'Free',
            subscriptionEndDate: null,
            tempCoins: 0,
        };

        const updatedUsers = [...users, newUser];
        localStorage.setItem(LS_USERS_KEY, JSON.stringify(updatedUsers));
      } catch (error) {
        console.error("Failed to update users in localStorage from signup form", error);
      }
    }
  }, [state.success, state.fields]);

  return (
    <form action={formAction} className="space-y-4">
      {state?.message && (
        <Alert variant={state.errors || !state.success ? "destructive" : "default"}>
          {state.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{t(state.errors || !state.success ? 'signup.errorTitle' : 'signup.successTitle', state.errors || !state.success ? "Erro" : "Sucesso")}</AlertTitle>
          <AlertDescription>{t(state.message, state.message)}</AlertDescription>
        </Alert>
      )}

      {/* Basic Info */}
      <div className="space-y-2">
        <Label htmlFor="name">{t('signup.nameLabel', 'Nome Completo')}</Label>
        <Input
          id="name"
          name="name"
          placeholder={t('signup.namePlaceholder', 'Seu nome completo')}
          required
          defaultValue={state?.fields?.name}
          aria-describedby="name-error"
          className={state?.errors?.name ? 'border-destructive' : ''}
        />
        {state?.errors?.name && (
          <p id="name-error" className="text-sm text-destructive">
            {t(state.errors.name.join(', '), state.errors.name.join(', '))}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t('signup.emailLabel', 'Email')}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={t('signup.emailPlaceholder', 'seu@email.com')}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">{t('signup.passwordLabel', 'Senha')}</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('signup.passwordPlaceholder', 'Crie uma senha forte')}
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
              aria-label={showPassword ? t('signup.hidePassword', 'Ocultar senha') : t('signup.showPassword', 'Mostrar senha')}
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('signup.confirmPasswordLabel', 'Confirmar Senha')}</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('signup.confirmPasswordPlaceholder', 'Repita a senha')}
              required
              aria-describedby="confirmPassword-error"
              className={state?.errors?.confirmPassword ? 'border-destructive' : ''}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? t('signup.hideConfirmPassword', 'Ocultar confirmação') : t('signup.showConfirmPassword', 'Mostrar confirmação')}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {state?.errors?.confirmPassword && (
            <p id="confirmPassword-error" className="text-sm text-destructive">
              {t(state.errors.confirmPassword.join(', '), state.errors.confirmPassword.join(', '))}
            </p>
          )}
        </div>
      </div>
      
      <div className="pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
