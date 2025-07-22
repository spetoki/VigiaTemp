
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { CalendarRange, AlertCircle, Loader2, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { getWeatherForecast, DailyForecast } from '@/ai/flows/get-weather-forecast';
import ForecastCard from '@/components/weather/ForecastCard';
import ForecastTable from '@/components/weather/ForecastTable';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import HourlyForecastDisplay from '@/components/weather/HourlyForecastDisplay';

type ViewMode = 'day' | 'week' | 'month';
const LOCATION_STORAGE_KEY = 'weather_forecast_location';

export default function WeatherForecastPage() {
  const { t } = useSettings();
  const { toast } = useToast();
  
  const [view, setView] = useState<ViewMode>('day');
  const [forecasts, setForecasts] = useState<DailyForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  
  const [selectedDay, setSelectedDay] = useState<DailyForecast | null>(null);
  const [isHourlyDialogOpen, setIsHourlyDialogOpen] = useState(false);

  const fetchForecast = useCallback(async (period: ViewMode, loc: string) => {
    if (!loc) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    setError(null);
    try {
      if (!loc.trim()) {
        throw new Error(t('weatherForecast.error.locationRequired', 'Por favor, insira uma localização.'));
      }
      const result = await getWeatherForecast({ 
        location: loc,
        period 
      });
      setForecasts(result.forecasts);
      // Save successful location search
      localStorage.setItem(LOCATION_STORAGE_KEY, loc);
    } catch (err) {
      console.error("Failed to fetch weather forecast:", err);
      const errorMessage = err instanceof Error ? err.message : t('weatherForecast.error.unknown', 'An unknown error occurred.');
      setError(errorMessage);
      setForecasts([]);
      toast({
        variant: "destructive",
        title: t('optimizeAlarmsForm.errorTitle', 'Erro'),
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    // This effect runs once on mount to get the stored location
    const savedLocation = localStorage.getItem(LOCATION_STORAGE_KEY) || 'Fazenda de Cacau, Bahia';
    setLocation(savedLocation);
    // Initial fetch is now triggered by the view effect below
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // This effect runs when the view (day/week/month) changes, or when the location is loaded initially
    if (location) {
      fetchForecast(view, location);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, location]); 

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchForecast(view, location);
  };
  
  const handleDayClick = (day: DailyForecast) => {
    setSelectedDay(day);
    setIsHourlyDialogOpen(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton className="h-96 w-full mt-4" />;
    }

    if (error && forecasts.length === 0) {
       return (
        <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('optimizeAlarmsForm.errorTitle', 'Erro ao Buscar Previsão')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
       )
    }

    if (forecasts.length === 0) {
      return <p className="text-center text-muted-foreground mt-8">{t('weatherForecast.noData', 'Não há dados de previsão disponíveis para esta localização.')}</p>;
    }

    if (view === 'day') {
      return <ForecastCard forecast={forecasts[0]} location={location}/>;
    }

    return <ForecastTable forecasts={forecasts} onDayClick={handleDayClick} />;
  };

  return (
    <>
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <CalendarRange className="mr-3 h-8 w-8" />
          {t('weatherForecast.title', 'Previsão do Tempo Detalhada')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('weatherForecast.pageDescription', 'Insira uma localização e analise as condições climáticas para os próximos dias, semana ou mês.')}
        </p>
      </div>
      
      <form onSubmit={handleLocationSubmit} className="flex flex-col sm:flex-row items-center gap-2">
        <Input 
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t('weatherForecast.locationPlaceholder', 'Ex: Salvador, Bahia')}
            className="flex-grow"
        />
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            {t('weatherForecast.searchButton', 'Buscar Previsão')}
        </Button>
      </form>

      <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="day">{t('weatherForecast.tabs.day', 'Hoje')}</TabsTrigger>
          <TabsTrigger value="week">{t('weatherForecast.tabs.week', 'Próximos 7 Dias')}</TabsTrigger>
          <TabsTrigger value="month">{t('weatherForecast.tabs.month', 'Próximos 30 Dias')}</TabsTrigger>
        </TabsList>
        <TabsContent value={view}>
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
    
    <Dialog open={isHourlyDialogOpen} onOpenChange={setIsHourlyDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
            {selectedDay && (
                <>
                <DialogHeader>
                    <DialogTitle>{t('weatherForecast.hourly.title', 'Previsão Hora a Hora para {date}', {date: new Date(selectedDay.date).toLocaleDateString(t('localeCode','pt-BR'), {weekday: 'long', day: '2-digit', month: 'long'})})}</DialogTitle>
                    <DialogDescription>
                         {t('weatherForecast.hourly.description', 'Detalhes das condições climáticas para {location}.', {location})}
                    </DialogDescription>
                </DialogHeader>
                <HourlyForecastDisplay forecast={selectedDay} />
                </>
            )}
        </DialogContent>
    </Dialog>
    </>
  );
}
