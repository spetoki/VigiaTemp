
"use client";

import type { Sensor, HistoricalDataPoint } from '@/types';
import { useSettings } from '@/context/SettingsContext';
import { convertTemperature, formatTemperature } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from 'recharts';
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TemperatureChartProps {
  sensor: Sensor;
  timePeriod: 'hour' | 'day' | 'week' | 'month';
}

const timePeriodTranslations: Record<'hour' | 'day' | 'week' | 'month', string> = {
  hour: 'hora',
  day: 'dia',
  week: 'semana',
  month: 'mês',
};

const filterDataByTimePeriod = (data: HistoricalDataPoint[], timePeriod: 'hour' | 'day' | 'week' | 'month'): HistoricalDataPoint[] => {
  const now = Date.now();
  let startTime: number;

  switch (timePeriod) {
    case 'hour':
      startTime = now - 60 * 60 * 1000;
      break;
    case 'day':
      startTime = now - 24 * 60 * 60 * 1000;
      break;
    case 'week':
      startTime = now - 7 * 24 * 60 * 60 * 1000;
      break;
    case 'month':
    default:
      startTime = now - 30 * 24 * 60 * 60 * 1000;
      break;
  }
  return data.filter(point => point.timestamp >= startTime);
};

const aggregateData = (data: HistoricalDataPoint[], timePeriod: 'hour' | 'day' | 'week' | 'month'): HistoricalDataPoint[] => {
  if (data.length === 0) return [];

  if (timePeriod === 'hour' || timePeriod === 'day') { 
    return data;
  }
  
  if (data.length > 100) { 
    const aggregated: Record<string, { sum: number, count: number, timestamp: number }> = {};
    const interval = timePeriod === 'week' ? 60 * 60 * 1000 : 3 * 60 * 60 * 1000; 

    data.forEach(point => {
      const key = Math.floor(point.timestamp / interval).toString();
      if (!aggregated[key]) {
        aggregated[key] = { sum: 0, count: 0, timestamp: point.timestamp - (point.timestamp % interval) };
      }
      aggregated[key].sum += point.temperature;
      aggregated[key].count += 1;
    });

    return Object.values(aggregated).map(agg => ({
      timestamp: agg.timestamp,
      temperature: agg.sum / agg.count,
    })).sort((a,b) => a.timestamp - b.timestamp);
  }
  
  return data;
}

export default function TemperatureChart({ sensor, timePeriod: initialTimePeriod }: TemperatureChartProps) {
  const { temperatureUnit, t } = useSettings();
  const [currentTimePeriod, setCurrentTimePeriod] = React.useState<'hour' | 'day' | 'week' | 'month'>(initialTimePeriod);

  const filteredData = filterDataByTimePeriod(sensor.historicalData, currentTimePeriod);
  const chartData = aggregateData(filteredData, currentTimePeriod).map(point => ({
    timestamp: point.timestamp,
    temperature: parseFloat(convertTemperature(point.temperature, temperatureUnit).toFixed(1)),
    lowThreshold: parseFloat(convertTemperature(sensor.lowThreshold, temperatureUnit).toFixed(1)),
    highThreshold: parseFloat(convertTemperature(sensor.highThreshold, temperatureUnit).toFixed(1)),
  }));

  const chartConfig = {
    temperature: {
      label: `Temperatura (°${temperatureUnit})`,
      color: "hsl(var(--primary))",
    },
    lowThreshold: {
      label: `Mín. (°${temperatureUnit})`,
      color: "hsl(var(--accent))",
    },
    highThreshold: {
      label: `Máx. (°${temperatureUnit})`,
      color: "hsl(var(--accent))",
    },
  } satisfies React.ComponentProps<typeof ChartContainer>["config"];
  
  const timeFormatOptions: Intl.DateTimeFormatOptions = 
    currentTimePeriod === 'hour' || currentTimePeriod === 'day' ? { hour: '2-digit', minute: '2-digit' } : { month: 'short', day: 'numeric' };

  const translatedTimePeriod = t(`temperatureChart.timePeriod.${currentTimePeriod}`, timePeriodTranslations[currentTimePeriod]);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-headline">{t('temperatureChart.title', 'Tendência Histórica de Temperatura')}</CardTitle>
          <CardDescription>{t('temperatureChart.description', '{sensorName} - Última(o) {timePeriod}', { sensorName: sensor.name, timePeriod: translatedTimePeriod })}</CardDescription>
        </div>
        <Select value={currentTimePeriod} onValueChange={(value) => setCurrentTimePeriod(value as 'hour' | 'day' | 'week' | 'month')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('temperatureChart.selectPeriod', 'Período')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hour">{t('temperatureChart.lastHour', 'Última Hora')}</SelectItem>
            <SelectItem value="day">{t('temperatureChart.lastDay', 'Último Dia')}</SelectItem>
            <SelectItem value="week">{t('temperatureChart.lastWeek', 'Última Semana')}</SelectItem>
            <SelectItem value="month">{t('temperatureChart.lastMonth', 'Último Mês')}</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-[300px] sm:h-[400px]">
      {chartData.length > 1 ? (
        <ChartContainer config={chartConfig} className="w-full h-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => new Date(value).toLocaleTimeString(t('localeCode', 'pt-BR'), timeFormatOptions)}
              
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}°${temperatureUnit}`}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                indicator="dot"
                formatter={(value, name, item) => (
                  <>
                    <div className="font-medium">{chartConfig[name as keyof typeof chartConfig]?.label || name}</div>
                    <div className="text-muted-foreground">{value}</div>
                    {name === "temperature" && <div className="text-xs text-muted-foreground">{new Date(item.payload.timestamp).toLocaleString(t('localeCode', 'pt-BR'))}</div>}
                  </>
                )}
              />}
            />
            <defs>
              <linearGradient id="fillTemperature" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-temperature)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-temperature)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              dataKey="temperature"
              type="natural"
              fill="url(#fillTemperature)"
              stroke="var(--color-temperature)"
              stackId="a"
            />
            <ReferenceLine 
              y={parseFloat(convertTemperature(sensor.lowThreshold, temperatureUnit).toFixed(1))} 
              label={{ value: `Mín: ${formatTemperature(sensor.lowThreshold, temperatureUnit)}`, position: 'insideBottomLeft', fill: 'hsl(var(--accent))' }} 
              stroke="hsl(var(--accent))" 
              strokeDasharray="3 3" 
            />
            <ReferenceLine 
              y={parseFloat(convertTemperature(sensor.highThreshold, temperatureUnit).toFixed(1))} 
              label={{ value: `Máx: ${formatTemperature(sensor.highThreshold, temperatureUnit)}`, position: 'insideTopLeft', fill: 'hsl(var(--accent))' }}
              stroke="hsl(var(--accent))" 
              strokeDasharray="3 3" 
            />
             <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
         ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {t('temperatureChart.noData', 'Dados insuficientes para o período selecionado.')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    