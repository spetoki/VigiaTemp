
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, ShieldAlert, AlertCircle, Award, Star, Gem, Cpu, CheckCircle, PackageCheck, LineChart, Bell, QrCode, BrainCircuit, Wrench, Activity } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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


const PricingCard = ({ title, icon: Icon, price, duration, features, discount, recommended }: {
    title: string;
    icon: React.ElementType;
    price: string;
    duration: string;
    features: string[];
    discount: string;
    recommended?: boolean;
}) => (
    <Card className={`flex flex-col ${recommended ? 'border-primary shadow-lg' : ''}`}>
        <CardHeader className="items-center pb-2">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">{title}</CardTitle>
            </div>
            <CardDescription className="text-xs">{duration}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-1 text-center px-4 py-2">
            <p className="text-xl font-bold">{price}</p>
            <p className="text-xs text-muted-foreground">por sensor</p>
            <ul className="space-y-1 text-xs text-muted-foreground pt-1">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start justify-center gap-1.5 text-center">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </CardContent>
        <CardFooter className="flex-col pt-2 pb-3 text-center">
            <p className='text-xs text-muted-foreground px-2'>Desconto válido para pagamento à vista ou parcelado em até 6x.</p>
            <div className="mt-2 bg-primary/10 text-primary font-bold text-xs py-1 px-2 rounded-full">
                {discount}
            </div>
        </CardFooter>
    </Card>
);

const FeaturesCard = () => (
    <Card className="flex flex-col border-secondary shadow-lg md:col-span-3">
        <CardHeader className="items-center pb-4">
             <div className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Principais Funcionalidades do App</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 text-center px-6 text-sm">
            <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" />
                <span>Monitoramento em Tempo Real</span>
            </div>
             <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span>Alertas de Temperatura</span>
            </div>
             <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" />
                <span>Rastreabilidade com QR Code</span>
            </div>
             <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" />
                <span>Gráficos</span>
            </div>
            <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span>Análise de Dados</span>
            </div>
             <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary" />
                <span>Guias de Hardware</span>
            </div>
        </CardContent>
         <CardFooter className="flex-col pt-4 pb-4">
        </CardFooter>
    </Card>
);

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 overflow-y-auto">
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
                className="text-center text-4xl tracking-[2rem] font-mono h-24 w-full px-4"
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
        </CardFooter>
      </Card>
      
       <div className="mt-8 text-center max-w-5xl">
            <h2 className="text-xl font-bold text-primary">Nossos Planos de Licenciamento</h2>
            <p className="text-muted-foreground mb-6 text-sm">
                Escolha o plano que melhor se adapta à sua necessidade.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PricingCard 
                    title="Plano Prata"
                    icon={Award}
                    price="R$ 350,00"
                    duration="Licença de 6 Meses"
                    features={["Suporte via WhatsApp"]}
                    discount="desconto para 6 ou mais sensores de 5%"
                />
                <PricingCard 
                    title="Plano Bronze"
                    icon={Star}
                    price="R$ 600,00"
                    duration="Licença de 12 Meses"
                    features={["Suporte via WhatsApp"]}
                    discount="desconto para 6 ou mais sensores de 10%"
                    recommended
                />
                <PricingCard 
                    title="Plano Ouro"
                    icon={Gem}
                    price="R$ 2.500,00"
                    duration="Licença Permanente"
                    features={["1 ano de assistência prioritária", "Suporte via WhatsApp"]}
                    discount="desconto para 6 ou mais sensores de 10%"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Card className="md:col-span-3 shadow-lg border-secondary">
                    <CardHeader className="items-center text-center pb-2">
                        <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-primary" />
                            <CardTitle className="text-base">Equipamento Físico (Sensor)</CardTitle>
                        </div>
                        <CardDescription className="text-xs">Opcional: adquira o hardware pronto para usar.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center px-4 py-2">
                        <p className="text-xl font-bold">R$ 150,00</p>
                        <p className="text-xs text-muted-foreground">por unidade de sensor</p>
                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <li className="flex items-start justify-center gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Sensor de temperatura de alta precisão</span>
                            </li>
                            <li className="flex items-start justify-center gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Placa ESP32 com conectividade WiFi</span>
                            </li>
                            <li className="flex items-start justify-center gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Montado e pronto para configurar</span>
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter className="flex-col pt-2 pb-3">
                        <div className="bg-primary/10 text-primary font-bold text-xs py-1 px-2 rounded-full">
                            desconto de 30% na compra de 6 ou mais sensores
                        </div>
                    </CardFooter>
                </Card>
                <FeaturesCard />
            </div>
            <p className="text-xl font-semibold text-center mt-6">
                Para adquirir, entre em contato via WhatsApp com Irineu Marcos Bartnik: +55 45 99931-4560
            </p>
        </div>
    </div>
  );
}

    

    
