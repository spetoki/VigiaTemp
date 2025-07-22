
"use client";

import React from 'react';
import type { DailyForecast } from '@/ai/flows/get-weather-forecast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSettings } from '@/context/SettingsContext';
import { formatTemperature } from '@/lib/utils';
import { Sun, Cloud, Cloudy, Umbrella, Zap, Snowflake, Droplets, Wind } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ForecastTableProps {
  forecasts: DailyForecast[];
  onDayClick: (forecast: DailyForecast) => void;
}

const iconMap: { [key: string]: React.ElementType } = {
  Sun,
  Cloud,
  Cloudy,
  Rain: Umbrella,
  Storm: Zap,
  Snowflake,
};

export default function ForecastTable({ forecasts, onDayClick }: ForecastTableProps) {
  const { temperatureUnit, t } = useSettings();

  return (
    <div className="rounded-lg border overflow-hidden shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">{t('weatherForecast.table.date', 'Data')}</TableHead>
            <TableHead className="w-[100px] text-center">{t('weatherForecast.table.condition', 'Condição')}</TableHead>
            <TableHead>{t('weatherForecast.table.description', 'Descrição')}</TableHead>
            <TableHead className="text-center">{t('weatherForecast.table.tempRange', 'Temp. (Mín/Máx)')}</TableHead>
            <TableHead className="text-center">{t('weatherForecast.table.humidity', 'Umidade')}</TableHead>
            <TableHead className="text-center">{t('weatherForecast.table.wind', 'Vento (km/h)')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forecasts.map((forecast) => {
            const WeatherIcon = iconMap[forecast.icon] || Sun;
            const date = parseISO(forecast.date);
            return (
              <TableRow key={forecast.date} onClick={() => onDayClick(forecast)} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div>{format(date, "dd/MM/yyyy")}</div>
                  <div className="text-muted-foreground text-xs">{forecast.dayOfWeek}</div>
                </TableCell>
                <TableCell className="text-center">
                  <WeatherIcon className="h-6 w-6 mx-auto text-primary" />
                </TableCell>
                <TableCell>{forecast.condition}</TableCell>
                <TableCell className="text-center">
                    <span className="text-blue-600">{formatTemperature(forecast.minTemp, temperatureUnit)}</span>
                    <span className="text-muted-foreground mx-1">/</span>
                    <span className="text-red-600">{formatTemperature(forecast.maxTemp, temperatureUnit)}</span>
                </TableCell>
                <TableCell className="text-center">{forecast.humidity}%</TableCell>
                <TableCell className="text-center">{forecast.windSpeed}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
