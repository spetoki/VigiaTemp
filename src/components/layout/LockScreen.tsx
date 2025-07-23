
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, ThermometerSnowflake, ShieldAlert } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const FAILED_ATTEMPTS_KEY = 'vigiatemp_failed_attempts';
const LOCKOUT_END_TIME_KEY = 'vigiatemp_lockout_end_time';

const getInitialState = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
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
      const now = Date.now();
      const remainingMs = Math.max(0, lockoutEndTime - now);

      if (remainingMs === 0) {
        setLockoutEndTime(null);
        setFailedAttempts(0); // Reset attempts after lockout
        clearInterval(intervalId);
        return;
      }

      const totalSeconds = Math.floor(remainingMs / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      let remainingString = '';
      if (days > 0) remainingString += `${days}d `;
      if (hours > 0) remainingString += `${hours}h `;
      if (minutes > 0) remainingString += `${minutes}m `;
      remainingString += `${seconds}s`;

      setTimeRemaining(remainingString.trim());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [lockoutEndTime]);

  const isLockedOut = useMemo(() => lockoutEndTime !== null && lockoutEndTime > Date.now(), [lockoutEndTime]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLockedOut) {
      return;
    }

    if (!/^\d{4}$/.test(key)) {
      setError(t('lockScreen.error.invalidFormat', 'A chave deve conter 4 dígitos.'));
      return;
    }
    
    if (unlockApp(key)) {
      setFailedAttempts(0);
      setLockoutEndTime(null);
      toast({
        title: t('lockScreen.toast.successTitle', 'Desbloqueado!'),
        description: t('lockScreen.toast.successDescription', 'Bem-vindo ao VigiaTemp.'),
      });
    } else {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      setError(t('lockScreen.error.incorrectKey', 'Chave de acesso incorreta. Tente novamente.'));
      setKey('');

      if (newFailedAttempts >= 3) {
          const lockoutCount = Math.floor((newFailedAttempts - 3) / 3);
          // Base 20 minutes, doubles each time, max 1 day, then adds days
          let lockoutMinutes = 20 * Math.pow(2, lockoutCount);
          if (lockoutMinutes >= 1440) { // 24 hours in minutes
            lockoutMinutes = 1440 * (1 + lockoutCount - Math.floor(Math.log2(1440/20)));
          }

          const newLockoutEndTime = Date.now() + lockoutMinutes * 60 * 1000;
          setLockoutEndTime(newLockoutEndTime);
          setError(t('lockScreen.error.tooManyAttempts', 'Muitas tentativas incorretas. Tente novamente mais tarde.'));
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            {isLockedOut ? (
                <ShieldAlert className="h-10 w-10 text-destructive" />
            ) : (
                <ThermometerSnowflake className="h-10 w-10 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-headline">
            {t('lockScreen.title', 'VigiaTemp')}
          </CardTitle>
          <CardDescription>
            {isLockedOut 
                ? t('lockScreen.lockedOutDescription', 'Sistema bloqueado por segurança.')
                : t('lockScreen.description', 'Por favor, insira a chave de acesso para continuar.')
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUnlock} className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="access-key" className="sr-only">{t('lockScreen.keyLabel', 'Chave de Acesso')}</label>
                <Input
                  id="access-key"
                  type="password"
                  maxLength={4}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="----"
                  className="text-center text-2xl tracking-[1rem] font-mono"
                  autoFocus
                  disabled={isLockedOut}
                />
              </div>

              {!isLockedOut && (
                  <div className="text-center text-sm text-muted-foreground pt-2 space-y-2">
                    <p>{t('lockScreen.contactForAccess', 'Para adquirir uma chave de acesso, entre em contato pelo WhatsApp: +55 45 99931-4560.')}</p>
                  </div>
              )}
             
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
               
              {isLockedOut && timeRemaining && (
                <div className="text-center text-destructive font-medium">
                  <p>{t('lockScreen.tryAgainIn', 'Tente novamente em: {time}', {time: timeRemaining})}</p>
                </div>
              )}

              {!isLockedOut && !error && (
                <Alert variant="default" className="border-amber-500/50 text-amber-600 bg-amber-500/5">
                  <ShieldAlert className="h-4 w-4 !text-amber-600" />
                  <AlertDescription>
                    {t('lockScreen.warning.lockout', 'Atenção: Após 3 tentativas incorretas, o acesso será bloqueado temporariamente.')}
                  </AlertDescription>
                </Alert>
              )}
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleUnlock} disabled={key.length !== 4 || isLockedOut}>
            <KeyRound className="mr-2 h-4 w-4" />
            {isLockedOut ? t('lockScreen.unlockButtonLocked', 'Bloqueado') : t('lockScreen.unlockButton', 'Desbloquear')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
