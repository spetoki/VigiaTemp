
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, ThermometerSnowflake } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';

export default function LockScreen() {
  const { unlockApp, t } = useSettings();
  const { toast } = useToast();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{4}$/.test(key)) {
        setError(t('lockScreen.error.invalidFormat', 'A chave deve conter 4 dígitos.'));
        return;
    }
    
    if (unlockApp(key)) {
      toast({
        title: t('lockScreen.toast.successTitle', 'Desbloqueado!'),
        description: t('lockScreen.toast.successDescription', 'Bem-vindo ao VigiaTemp.'),
      });
    } else {
      setError(t('lockScreen.error.incorrectKey', 'Chave de acesso incorreta. Tente novamente.'));
      setKey('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <ThermometerSnowflake className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">
            {t('lockScreen.title', 'VigiaTemp')}
          </CardTitle>
          <CardDescription>
            {t('lockScreen.description', 'Por favor, insira a chave de acesso para continuar.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUnlock}>
            <div className="grid w-full items-center gap-4">
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
                />
              </div>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleUnlock} disabled={key.length !== 4}>
            <KeyRound className="mr-2 h-4 w-4" />
            {t('lockScreen.unlockButton', 'Desbloquear')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
