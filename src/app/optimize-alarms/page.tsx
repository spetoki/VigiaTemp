
"use client";

import React, { useEffect } from 'react';
import OptimizeAlarmsForm from '@/components/optimize-alarms/OptimizeAlarmsForm';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/context/SettingsContext';

export default function OptimizeAlarmsPage() {
  const { authState } = useAuth();
  const router = useRouter();
  const { t } = useSettings();

  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.push('/login');
    }
  }, [authState, router]);
  
  if (authState === 'loading' || authState === 'unauthenticated') {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <Skeleton className="h-9 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
        </div>
        <Skeleton className="h-96 w-full max-w-2xl mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline text-primary">{t('optimizeAlarms.pageTitle', 'Otimização de Alarmes com IA')}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          {t('optimizeAlarms.pageDescription', 'Utilize inteligência artificial para ajustar as configurações de alarme da sua estufa para uma fermentação de cacau otimizada. Forneça suas condições específicas, e nossa IA sugerirá limites de temperatura personalizados.')}
        </p>
      </div>
      
      <OptimizeAlarmsForm />
      
    </div>
  );
}
