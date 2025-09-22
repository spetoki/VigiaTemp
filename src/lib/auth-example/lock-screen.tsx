
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, ShieldAlert } from 'lucide-react';
import { useAuth } from './auth-context'; // Ajuste o caminho se necessário
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Constantes para controle de bloqueio (devem ser iguais às do auth-context.tsx)
const FAILED_ATTEMPTS_KEY = 'myapp_failed_attempts';
const LOCKOUT_END_TIME_KEY = 'myapp_lockout_end_time';
const MASTER_UNLOCK_KEY = '6894';
const lockoutTimes = [1, 2, 5, 10, 30];

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
  const { unlockApp } = useAuth();
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
        setKey('');
        toast({ title: 'Bloqueio Removido', description: 'O tempo de espera foi zerado. Tente sua chave novamente.' });
      } else {
        setError(`Sistema bloqueado. Tente novamente em ${timeRemaining}.`);
      }
      return;
    }

    if (!/^\d{4}$/.test(key)) {
      setError('A chave deve conter exatamente 4 dígitos.');
      return;
    }
    
    if (unlockApp(key)) {
      setFailedAttempts(0);
      setLockoutEndTime(null);
      toast({ title: 'Desbloqueado!', description: 'Bem-vindo(a)!' });
    } else {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      setError('Chave de acesso incorreta.');
      setKey('');

      if (newFailedAttempts >= 3) {
          const lockoutIndex = Math.min(newFailedAttempts - 3, lockoutTimes.length - 1);
          const lockoutMinutes = lockoutTimes[lockoutIndex];
          const newLockoutEndTime = Date.now() + lockoutMinutes * 60 * 1000;
          setLockoutEndTime(newLockoutEndTime);
          setError(`Muitas tentativas. Acesso bloqueado por ${lockoutMinutes} minuto(s).`);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
             <ShieldAlert className={`h-10 w-10 ${isLockedOut ? 'text-destructive' : 'text-primary'}`} />
          </div>
          <CardTitle className="text-2xl">Acesso Restrito</CardTitle>
          <CardDescription>
            {isLockedOut 
                ? 'Sistema bloqueado por segurança.'
                : 'Insira a chave de acesso de 4 dígitos.'
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
                className="text-center text-2xl tracking-[1rem] font-mono"
                autoFocus
                disabled={isLockedOut && key !== MASTER_UNLOCK_KEY}
              />
             
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
               
              {isLockedOut && timeRemaining && (
                <div className="text-center text-destructive font-medium">
                  <p>Tente novamente em: {timeRemaining}</p>
                </div>
              )}
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleUnlock} disabled={key.length !== 4}>
            <KeyRound className="mr-2 h-4 w-4" />
            {isLockedOut ? 'Desbloquear Espera' : 'Desbloquear'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
