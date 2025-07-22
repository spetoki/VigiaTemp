
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { CalendarRange } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { getWeatherForecast, DailyForecast } from '@/ai/flows/get-weather-forecast';
import ForecastCard from '@/components/weather/ForecastCard';
import ForecastTable from '@/components/weather/ForecastTable';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

type ViewMode = 'day' | 'week' | 'month';

export default function WeatherForecastPage() {
  const { t } = useSettings();
  const [view, setView] = useState<ViewMode>('day');
  const [forecasts, setForecasts] = useState<DailyForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = useCallback(async (period: ViewMode) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getWeatherForecast({ 
        location: 'Fazenda de Cacau, Bahia', // Hardcoded for simulation
        period 
      });
      setForecasts(result.forecasts);
    } catch (err) {
      console.error("Failed to fetch weather forecast:", err);
      const errorMessage = err instanceof Error ? err.message : t('weatherForecast.error.unknown', 'An unknown error occurred.');
      setError(errorMessage);
      setForecasts([]);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchForecast(view);
  }, [view, fetchForecast]);

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton className="h-96 w-full" />;
    }

    if (error) {
       return (
        <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('optimizeAlarmsForm.errorTitle', 'Erro')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
       )
    }

    if (forecasts.length === 0) {
      return <p className="text-center text-muted-foreground mt-8">{t('weatherForecast.noData', 'Não há dados de previsão disponíveis.')}</p>;
    }

    if (view === 'day') {
      return <ForecastCard forecast={forecasts[0]} />;
    }

    return <ForecastTable forecasts={forecasts} />;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <CalendarRange className="mr-3 h-8 w-8" />
          {t('weatherForecast.title', 'Previsão do Tempo Detalhada')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('weatherForecast.description', 'Analise as condições climáticas para os próximos dias, semana e mês.')}
        </p>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="day">{t('weatherForecast.tabs.day', 'Hoje')}</TabsTrigger>
          <TabsTrigger value="week">{t('weatherForecast.tabs.week', 'Próximos 7 Dias')}</TabsTrigger>
          <TabsTrigger value="month">{t('weatherForecast.tabs.month', 'Próximos 30 Dias')}</TabsTrigger>
        </TabsList>
        <TabsContent value={view} className="mt-4">
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
