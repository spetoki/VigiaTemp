
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSettings } from '@/context/SettingsContext';
import { formatTemperature } from '@/lib/utils';
import type { DailyForecast } from '@/ai/flows/get-weather-forecast';
import { Sun, Cloud, Cloudy, Umbrella, Zap, Snowflake, Droplets, Wind, Sunrise, Sunset } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ForecastCardProps {
  forecast: DailyForecast;
}

const iconMap: { [key: string]: React.ElementType } = {
  Sun,
  Cloud,
  Cloudy,
  Rain: Umbrella,
  Storm: Zap,
  Snowflake,
};

export default function ForecastCard({ forecast }: ForecastCardProps) {
  const { temperatureUnit, t } = useSettings();
  const WeatherIcon = iconMap[forecast.icon] || Sun;

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('weatherForecast.tabs.day', 'Hoje')}</span>
          <span className="text-lg font-medium text-muted-foreground">
             {format(new Date(forecast.date), "PPP", { locale: ptBR })}
          </span>
        </CardTitle>
        <CardDescription>{t('weatherForecast.location', 'Fazenda de Cacau, Bahia')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <WeatherIcon className="h-24 w-24 text-primary" />
          <p className="text-6xl font-bold">{formatTemperature(forecast.maxTemp, temperatureUnit)}</p>
          <p className="text-2xl text-muted-foreground">{forecast.condition}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">{t('weatherForecast.minTemp', 'Mínima')}</p>
                <p className="text-xl font-semibold">{formatTemperature(forecast.minTemp, temperatureUnit)}</p>
            </div>
             <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">{t('weatherForecast.maxTemp', 'Máxima')}</p>
                <p className="text-xl font-semibold">{formatTemperature(forecast.maxTemp, temperatureUnit)}</p>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center space-y-1">
            <Droplets className="h-6 w-6 text-blue-500" />
            <p className="text-sm">{t('weatherForecast.humidity', 'Umidade')}</p>
            <p className="font-semibold">{forecast.humidity}%</p>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <Wind className="h-6 w-6 text-gray-500" />
            <p className="text-sm">{t('weatherForecast.wind', 'Vento')}</p>
            <p className="font-semibold">{forecast.windSpeed} km/h</p>
          </div>
           <div className="flex flex-col items-center space-y-1">
            <Sunrise className="h-6 w-6 text-yellow-500" />
            <p className="text-sm">{t('weatherForecast.sunrise', 'Nascer do Sol')}</p>
            <p className="font-semibold">06:15</p>
          </div>
           <div className="flex flex-col items-center space-y-1">
            <Sunset className="h-6 w-6 text-orange-500" />
            <p className="text-sm">{t('weatherForecast.sunset', 'Pôr do Sol')}</p>
            <p className="font-semibold">17:45</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
