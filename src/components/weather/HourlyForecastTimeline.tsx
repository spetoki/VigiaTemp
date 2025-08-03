
"use client";

import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { formatTemperature } from '@/lib/utils';
import type { HourlyForecast } from '@/ai/flows/get-weather-forecast';
import { Sun, Cloud, Cloudy, Umbrella, Zap, Snowflake } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface HourlyForecastTimelineProps {
  hourlyData: HourlyForecast[];
}

const iconMap: { [key: string]: React.ElementType } = {
  Sun,
  Cloud,
  Cloudy,
  Rain: Umbrella,
  Storm: Zap,
  Snowflake,
};

export default function HourlyForecastTimeline({ hourlyData }: HourlyForecastTimelineProps) {
  const { temperatureUnit } = useSettings();

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-lg">
      <div className="flex space-x-4 pb-4">
        {hourlyData.map((hour) => {
          const WeatherIcon = iconMap[hour.icon] || Sun;
          return (
            <div
              key={hour.time}
              className="flex-shrink-0 flex flex-col items-center justify-center gap-2 p-3 rounded-lg border bg-background"
              style={{ minWidth: '80px' }}
            >
              <p className="text-sm font-medium">{hour.time}</p>
              <WeatherIcon className="h-6 w-6 text-muted-foreground" />
              <p className="text-lg font-bold">
                {formatTemperature(hour.temp, temperatureUnit)}
              </p>
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
