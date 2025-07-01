
'use client';

import React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { forgotPassword, ForgotPasswordFormState } from '@/app/forgot-password/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Send } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

const initialState: ForgotPasswordFormState = {};

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
          {t('forgotPassword.submittingButton', 'Enviando...')}
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" /> {t('forgotPassword.submitButton', 'Enviar Link de Redefinição')}
        </>
      )}
    </Button>
  );
}

export default function ForgotPasswordForm() {
  const [state, formAction] = useFormState(forgotPassword, initialState);
  const { t } = useSettings();

  if (state?.success) {
     return (
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('forgotPassword.checkEmailTitle', 'Verifique seu Email')}</AlertTitle>
          <AlertDescription>{t(state.message || '', state.message)}</AlertDescription>
        </Alert>
     )
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.message && !state.success && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('forgotPassword.errorTitle', 'Erro')}</AlertTitle>
          <AlertDescription>{t(state.message, state.message)}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">{t('forgotPassword.emailLabel', 'Email')}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={t('forgotPassword.emailPlaceholder', 'seu@email.com')}
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
      
      <SubmitButton />
    </form>
  );
}

    
