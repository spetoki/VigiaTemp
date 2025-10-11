
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, ShieldAlert, AlertCircle } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

// Constantes para controle de bloqueio
const FAILED_ATTEMPTS_KEY = 'vigiatemp_failed_attempts';
const LOCKOUT_END_TIME_KEY = 'vigiatemp_lockout_end_time';
const MASTER_UNLOCK_KEY = '6894';
const lockoutTimes = [1, 2, 5, 10, 30]; // em minutos

const getInitialState = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};


export default function LockScreen() {
  const { unlockApp, t } = useSettings();
  const { toast } = useToast();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const [failedAttempts, setFailedAttempts] = useState(() => getInitialState<number>(FAILED_ATTEMPTS_KEY, 0));
  const [lockoutEndTime, setLockoutEndTime] = useState(() => getInitialState<number | null>(LOCKOUT_END_TIME_KEY, null));

  useEffect(() => {
    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(failedAttempts));
  }, [failedAttempts]);

  useEffect(() => {
    if (lockoutEndTime) {
      localStorage.setItem(LOCKOUT_END_TIME_KEY, JSON.stringify(lockoutEndTime));
    } else {
      localStorage.removeItem(LOCKOUT_END_TIME_KEY);
    }
  }, [lockoutEndTime]);

  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!lockoutEndTime) {
      setTimeRemaining('');
      return;
    }
    const intervalId = setInterval(() => {
      const remainingMs = Math.max(0, lockoutEndTime - Date.now());
      if (remainingMs === 0) {
        setLockoutEndTime(null);
        clearInterval(intervalId);
        return;
      }
      const totalSeconds = Math.floor(remainingMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setTimeRemaining(`${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [lockoutEndTime]);

  const isLockedOut = useMemo(() => lockoutEndTime !== null && lockoutEndTime > Date.now(), [lockoutEndTime]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLockedOut) {
        if (key === MASTER_UNLOCK_KEY) {
            setLockoutEndTime(null);
            setFailedAttempts(0); // Reseta as tentativas também
            setKey('');
            toast({ 
                title: t('lockScreen.toast.lockoutRemovedTitle', 'Bloqueio Removido'), 
                description: t('lockScreen.toast.lockoutRemovedDescription', 'O tempo de espera foi zerado. Tente sua chave novamente.') 
            });
        } else {
            setError(t('lockScreen.tryAgainIn', 'Sistema bloqueado. Tente novamente em {time}.', { time: timeRemaining }));
        }
        return;
    }

    if (!/^\d{4}$/.test(key)) {
      setError(t('lockScreen.error.invalidFormat', 'A chave deve conter exatamente 4 dígitos.'));
      return;
    }
    
    if (unlockApp(key)) {
      setFailedAttempts(0);
      setLockoutEndTime(null);
      toast({ 
        title: t('lockScreen.toast.successTitle', 'Desbloqueado!'), 
        description: t('lockScreen.toast.successDescription', 'Bem-vindo(a) de volta!') 
      });
    } else {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      setError(t('lockScreen.error.incorrectKey', 'Chave de acesso incorreta.'));
      setKey('');

      if (newFailedAttempts >= 3) {
          const lockoutIndex = Math.min(newFailedAttempts - 3, lockoutTimes.length - 1);
          const lockoutMinutes = lockoutTimes[lockoutIndex];
          const newLockoutEndTime = Date.now() + lockoutMinutes * 60 * 1000;
          setLockoutEndTime(newLockoutEndTime);
          setError(t('lockScreen.error.tooManyAttempts', 'Muitas tentativas. Acesso bloqueado por {minutes} minuto(s).', { minutes: lockoutMinutes }));
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl z-10">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
             <ShieldAlert className={`h-12 w-12 ${isLockedOut ? 'text-destructive' : 'text-primary'}`} />
          </div>
          <CardTitle className="text-2xl">{t('lockScreen.title', 'VigiaTemp')}</CardTitle>
          <CardDescription>
            {isLockedOut 
                ? t('lockScreen.lockedOutDescription', 'Sistema bloqueado por segurança.')
                : t('lockScreen.description', 'Insira a chave de acesso para continuar.')
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUnlock} className="space-y-4">
              <Input
                id="access-key"
                type="password"
                maxLength={4}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="----"
                className="text-center text-4xl tracking-[1.5rem] font-mono h-20 w-full"
                autoFocus
                disabled={isLockedOut && key !== MASTER_UNLOCK_KEY}
              />
             
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
               
              {isLockedOut && timeRemaining && (
                <Alert variant="destructive" className="text-center">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('lockScreen.tryAgainIn', 'Tente novamente em: {time}', {time: timeRemaining})}</AlertTitle>
                </Alert>
              )}
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button className="w-full" onClick={handleUnlock} disabled={!key || key.length !== 4}>
            <KeyRound className="mr-2 h-4 w-4" />
            {isLockedOut ? t('lockScreen.unlockButtonLocked', 'Desbloquear Espera') : t('lockScreen.unlockButton', 'Desbloquear')}
          </Button>
          <a href="/pricing" className="text-sm text-primary hover:underline mt-4">
            Clique aqui para conferir nossos planos de aquisição
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
