
"use client";

import React from 'react';
import OptimizeAlarmsForm from '@/components/optimize-alarms/OptimizeAlarmsForm';
import { useSettings } from '@/context/SettingsContext';

export default function OptimizeAlarmsPage() {
  const { t } = useSettings();

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
