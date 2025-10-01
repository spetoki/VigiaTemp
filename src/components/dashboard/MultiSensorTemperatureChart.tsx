
"use client";

import type { Sensor, HistoricalDataPoint } from '@/types';
import { useSettings } from '@/context/SettingsContext';
import { convertTemperature } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ListFilter, Loader2 } from 'lucide-react';
import { getHistoricalData } from '@/services/sensor-service';

// Helper function to aggregate data points to avoid over-plotting on large time scales
const aggregateData = (data: HistoricalDataPoint[], timePeriod: 'hour' | 'day' | 'week' | 'month'): HistoricalDataPoint[] => {
  if (data.length < 200) return data; // No need to aggregate if data is not dense

  const aggregated: Record<string, { sum: number, count: number, timestamp: number }> = {};
  let interval = 60 * 1000; // 1 minute default
  if (timePeriod === 'week') interval = 15 * 60 * 1000; // 15 minutes
  if (timePeriod === 'month') interval = 60 * 60 * 1000; // 1 hour

  data.forEach(point => {
    const key = Math.floor(point.timestamp / interval).toString();
    if (!aggregated[key]) {
      aggregated[key] = { sum: 0, count: 0, timestamp: point.timestamp };
    }
    aggregated[key].sum += point.temperature;
    aggregated[key].count += 1;
  });

  return Object.values(aggregated).map(agg => ({
    timestamp: agg.timestamp,
    temperature: agg.sum / agg.count,
  })).sort((a,b) => a.timestamp - b.timestamp);
};


const chartColors = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(200 80% 50%)",
  "hsl(300 70% 50%)", "hsl(50 90% 50%)",
];

type TimePeriod = 'hour' | 'day' | 'week' | 'month';

interface MultiSensorTemperatureChartProps {
  sensors: Sensor[];
  collectionPath: string;
}

export default function MultiSensorTemperatureChart({ sensors, collectionPath }: MultiSensorTemperatureChartProps) {
  const { temperatureUnit, t } = useSettings();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('day');
  const [selectedSensorIds, setSelectedSensorIds] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initially select all available sensors
  useEffect(() => {
    setSelectedSensorIds(sensors.map(s => s.id));
  }, [sensors]);

  const displayedSensors = useMemo(() => {
    return sensors.filter(sensor => selectedSensorIds.includes(sensor.id));
  }, [sensors, selectedSensorIds]);

  const chartConfig = useMemo(() => {
    return sensors.reduce((config, sensor, index) => {
      config[`sensor_${sensor.id}`] = {
        label: sensor.name,
        color: chartColors[index % chartColors.length],
      };
      return config;
    }, {} as ChartConfig);
  }, [sensors]);
  
  const fetchAndProcessData = useCallback(async () => {
    if (displayedSensors.length === 0) {
      setChartData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const allSensorsDataPromises = displayedSensors.map(async (sensor) => {
        const history = await getHistoricalData(collectionPath, sensor.id, timePeriod);
        const aggregated = aggregateData(history, timePeriod);
        return {
          sensorId: sensor.id,
          data: aggregated.map(p => ({
            timestamp: p.timestamp,
            temperature: parseFloat(convertTemperature(p.temperature, temperatureUnit).toFixed(1))
          }))
        };
      });

      const allSensorsData = await Promise.all(allSensorsDataPromises);
      
      const allTimestamps = [...new Set(allSensorsData.flatMap(s => s.data.map(p => p.timestamp)))].sort((a, b) => a - b);

      if(allTimestamps.length === 0) {
        setChartData([]);
        setIsLoading(false);
        return;
      }
      
      const combinedData = allTimestamps.map(ts => {
        const dataPoint: { timestamp: number; [key: string]: number | null } = { timestamp: ts };
        for (const sensorSeries of allSensorsData) {
          const pointForSensor = sensorSeries.data.find(p => p.timestamp === ts);
          dataPoint[`sensor_${sensorSeries.sensorId}`] = pointForSensor ? pointForSensor.temperature : null;
        }
        return dataPoint;
      });

      setChartData(combinedData);
    } catch (error) {
      console.error("Failed to process chart data:", error);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  }, [collectionPath, displayedSensors, timePeriod, temperatureUnit]);

  useEffect(() => {
    fetchAndProcessData();
  }, [fetchAndProcessData]);

  const timeFormatOptions: Intl.DateTimeFormatOptions = 
    timePeriod === 'hour' || timePeriod === 'day' ? { hour: '2-digit', minute: '2-digit' } : { month: 'short', day: 'numeric' };

  const handleSelectAllToggle = (selectAll: boolean) => {
    setSelectedSensorIds(selectAll ? sensors.map(s => s.id) : []);
  };
  
  const areAllSensorsSelected = selectedSensorIds.length === sensors.length && sensors.length > 0;

  return (
    <Card className="shadow-lg w-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-4">
        <div>
          <CardTitle className="text-lg font-headline">{t('multiSensorChart.title', 'Tendência de Temperatura dos Sensores')}</CardTitle>
          <CardDescription>
             {t('multiSensorChart.desc.multiple', 'Comparativo de {count} sensores - Última(o) {timePeriod}', { count: displayedSensors.length, timePeriod: t(`temperatureChart.timePeriod.${timePeriod}`) })}
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('temperatureChart.selectPeriod', 'Período')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">{t('temperatureChart.lastHour', 'Última Hora')}</SelectItem>
              <SelectItem value="day">{t('temperatureChart.lastDay', 'Último Dia')}</SelectItem>
              <SelectItem value="week">{t('temperatureChart.lastWeek', 'Última Semana')}</SelectItem>
              <SelectItem value="month">{t('temperatureChart.lastMonth', 'Último Mês')}</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <ListFilter className="mr-2 h-4 w-4" />
                {t('multiSensorChart.filterSensorsButton', 'Selecionar Sensores ({count})', { count: selectedSensorIds.length })}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[250px]">
              <DropdownMenuLabel>{t('multiSensorChart.filterSensorsLabel', 'Exibir Sensores')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
               <DropdownMenuCheckboxItem checked={areAllSensorsSelected} onCheckedChange={(checked) => handleSelectAllToggle(Boolean(checked))}>
                {t(areAllSensorsSelected ? 'multiSensorChart.deselectAll' : 'multiSensorChart.selectAll')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {sensors.map(sensor => (
                <DropdownMenuCheckboxItem
                  key={sensor.id}
                  checked={selectedSensorIds.includes(sensor.id)}
                  onCheckedChange={(checked) => setSelectedSensorIds(prev => checked ? [...prev, sensor.id] : prev.filter(id => id !== sensor.id))}
                >
                  {sensor.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="h-[400px] sm:h-[500px]">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : chartData.length > 1 ? (
        <ChartContainer config={chartConfig} className="w-full h-full">
          <LineChart data={chartData} margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
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
              cursor={true}
              content={<ChartTooltipContent indicator="line" labelFormatter={(value) => new Date(value).toLocaleString(t('localeCode', 'pt-BR'))} />}
            />
            {displayedSensors.map(sensor => (
              <Line
                key={sensor.id}
                dataKey={`sensor_${sensor.id}`}
                name={sensor.name}
                type="monotone"
                stroke={chartConfig[`sensor_${sensor.id}`]?.color}
                strokeWidth={2}
                dot={false}
                connectNulls={true}
              />
            ))}
          </LineChart>
        </ChartContainer>
         ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {displayedSensors.length === 0 ? t('multiSensorChart.selectOneOrMore', 'Selecione um ou mais sensores para exibir no gráfico.') : t('multiSensorChart.insufficientData', 'Dados insuficientes para exibir o gráfico.')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
