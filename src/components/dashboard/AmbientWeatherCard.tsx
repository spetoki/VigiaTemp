
"use client";

import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTemperature } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';
import { Sun, Cloud, Snowflake, Thermometer, CalendarDays } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

interface AmbientWeatherCardProps {
  temperature: number | null;
  isLoading: boolean;
}

const getWeatherIcon = (temp: number | null) => {
    if (temp === null) return <Thermometer className="h-8 w-8 text-muted-foreground" />;
    if (temp < 10) return <Snowflake className="h-8 w-8 text-blue-400" />;
    if (temp > 28) return <Sun className="h-8 w-8 text-yellow-500" />;
    return <Cloud className="h-8 w-8 text-gray-500" />;
}

export default function AmbientWeatherCard({ temperature, isLoading }: AmbientWeatherCardProps) {
  const { temperatureUnit, t } = useSettings();

  return (
    <Card className="w-full max-w-sm mx-auto sm:mx-0 sm:max-w-xs shadow-md flex flex-col">
      <CardContent className="p-4 flex-grow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t('ambientWeather.cardTitle', 'Previsão do Tempo Ambiente')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('ambientWeather.location', 'Fazenda de Cacau (Simulado)')}
            </p>
          </div>
          {isLoading ? <Skeleton className="h-8 w-8 rounded-full" /> : getWeatherIcon(temperature)}
        </div>
        <div className="mt-4 flex items-baseline justify-center gap-2">
            {isLoading ? (
                <Skeleton className="h-10 w-24" />
            ) : temperature !== null ? (
                <p className="text-4xl font-bold text-primary">
                    {formatTemperature(temperature, temperatureUnit)}
                </p>
            ) : (
                <p className="text-lg text-muted-foreground">
                    {t('ambientWeather.unavailable', 'Indisponível')}
                </p>
            )}
        </div>
      </CardContent>
       <CardFooter className="p-2 border-t">
        <Button asChild variant="ghost" className="w-full">
            <Link href="/weather-forecast">
                <CalendarDays className="mr-2 h-4 w-4" />
                {t('ambientWeather.viewForecast', 'Ver Previsão Completa')}
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
