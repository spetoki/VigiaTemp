
"use client";

import React from 'react';
import type { DailyForecast, HourlyForecast } from '@/ai/flows/get-weather-forecast';
import { useSettings } from '@/context/SettingsContext';
import { formatTemperature } from '@/lib/utils';
import { Sun, Cloud, Cloudy, Umbrella, Zap, Snowflake, Droplets, Wind, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface HourlyForecastDisplayProps {
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

export default function HourlyForecastDisplay({ forecast }: HourlyForecastDisplayProps) {
  const { temperatureUnit, t } = useSettings();

  return (
    <ScrollArea className="h-96 w-full">
      <div className="space-y-4 pr-4">
        {forecast.hourly.map((hour, index) => {
            const WeatherIcon = iconMap[hour.icon] || Sun;
            return (
              <React.Fragment key={hour.time}>
                <div className="grid grid-cols-3 sm:grid-cols-5 items-center gap-2">
                    <div className="flex items-center gap-2 font-medium">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span>{hour.time}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <WeatherIcon className="h-6 w-6 text-primary"/>
                        <span className="font-bold text-lg">{formatTemperature(hour.temp, temperatureUnit)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground hidden sm:block">{hour.condition}</p>
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Droplets className="h-4 w-4" />
                        <span>{hour.humidity}%</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Wind className="h-4 w-4" />
                        <span>{hour.windSpeed} km/h</span>
                    </div>
                </div>
                {index < forecast.hourly.length - 1 && <Separator />}
              </React.Fragment>
            );
        })}
      </div>
    </ScrollArea>
  );
}
