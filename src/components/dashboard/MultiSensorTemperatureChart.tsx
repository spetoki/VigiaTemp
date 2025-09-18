
"use client";

import type { Sensor, HistoricalDataPoint } from '@/types';
import { useSettings } from '@/context/SettingsContext';
import { convertTemperature } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import React, { useState, useMemo, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ListFilter, Loader2 } from 'lucide-react';
import { getHistoricalData } from '@/services/sensor-service';


const aggregateData = (data: HistoricalDataPoint[], timePeriod: 'hour' | 'day' | 'week' | 'month'): HistoricalDataPoint[] => {
  if (data.length === 0) return [];

  if (timePeriod === 'hour' || (timePeriod === 'day' && data.length <= 100)) {
    return data;
  }
  
  let numPointsToAimFor = 100;
  if (timePeriod === 'week') numPointsToAimFor = 100;
  if (timePeriod === 'month') numPointsToAimFor = 150;

  if (data.length > numPointsToAimFor) {
    const aggregated: Record<string, { sum: number, count: number, timestamp: number }> = {};
    const firstTimestamp = data[0].timestamp;
    const lastTimestamp = data[data.length - 1].timestamp;
    const totalDuration = lastTimestamp - firstTimestamp;
    
    const minInterval = 60 * 1000; 
    const calculatedInterval = Math.max(minInterval, totalDuration / numPointsToAimFor);

    data.forEach(point => {
      const key = Math.floor((point.timestamp - firstTimestamp) / calculatedInterval).toString();
      if (!aggregated[key]) {
        aggregated[key] = { sum: 0, count: 0, timestamp: firstTimestamp + (parseInt(key) * calculatedInterval) };
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
};

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(200 80% 50%)",
  "hsl(300 70% 50%)",
  "hsl(50 90% 50%)",
];

type TimePeriod = 'hour' | 'day' | 'week' | 'month';

interface MultiSensorTemperatureChartProps {
  sensors: Sensor[];
  initialTimePeriod?: TimePeriod;
  collectionPath: string; // Explicitly require the collection path
}


export default function MultiSensorTemperatureChart({ sensors, initialTimePeriod = 'day', collectionPath }: MultiSensorTemperatureChartProps) {
  const { temperatureUnit, t } = useSettings();
  const [currentTimePeriod, setCurrentTimePeriod] = useState<TimePeriod>(initialTimePeriod);
  const [selectedSensorIds, setSelectedSensorIds] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initially select all sensors
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
  
  useEffect(() => {
    const fetchAndProcessData = async () => {
        if (!collectionPath || displayedSensors.length === 0) {
            setChartData([]);
            setIsLoading(false); // Stop loading if no sensors are displayed
            return;
        }

        setIsLoading(true);

        const allSensorsData = await Promise.all(
            displayedSensors.map(async sensor => {
                const history = await getHistoricalData(collectionPath, sensor.id, currentTimePeriod);
                const aggregated = aggregateData(history, currentTimePeriod);
                return {
                    sensorId: sensor.id,
                    data: aggregated.map(p => ({
                        timestamp: p.timestamp,
                        temperature: parseFloat(convertTemperature(p.temperature, temperatureUnit).toFixed(1))
                    }))
                };
            })
        );
        
        const allTimestamps = [...new Set(allSensorsData.flatMap(s => s.data.map(p => p.timestamp)))].sort((a, b) => a - b);

        const combinedData = allTimestamps.map(ts => {
            const dataPoint: { timestamp: number; [key: string]: number | null } = { timestamp: ts };
            allSensorsData.forEach(sensorSeries => {
                let pointForSensor = sensorSeries.data.find(p => p.timestamp === ts);
                if (!pointForSensor) {
                    const previousPoints = sensorSeries.data.filter(p => p.timestamp <= ts);
                    if (previousPoints.length > 0) {
                        pointForSensor = previousPoints[previousPoints.length - 1];
                    }
                }
                dataPoint[`sensor_${sensorSeries.sensorId}`] = pointForSensor ? pointForSensor.temperature : null;
            });
            return dataPoint;
        });

        setChartData(combinedData);
        setIsLoading(false);
    };

    fetchAndProcessData();
  }, [displayedSensors, currentTimePeriod, temperatureUnit, collectionPath]);


  const timeFormatOptions: Intl.DateTimeFormatOptions = 
    currentTimePeriod === 'hour' || currentTimePeriod === 'day' ? { hour: '2-digit', minute: '2-digit' } : { month: 'short', day: 'numeric' };

  const translatedTimePeriod = t(`temperatureChart.timePeriod.${currentTimePeriod}`);
  
  const cardDescriptionText = useMemo(() => {
    if (displayedSensors.length === 1) {
        return t('multiSensorChart.desc.single', '{sensorName} - Última(o) {timePeriod}', {
            sensorName: displayedSensors[0].name,
            timePeriod: translatedTimePeriod
        });
    }
    if (displayedSensors.length < sensors.length && displayedSensors.length > 0) {
        return t('multiSensorChart.desc.multiple', 'Comparativo de {count} sensores - Última(o) {timePeriod}', {
            count: displayedSensors.length,
            timePeriod: translatedTimePeriod
        });
    }
    if (displayedSensors.length === 0) {
        return t('multiSensorChart.desc.none', 'Nenhum sensor selecionado - Última(o) {timePeriod}', {
            timePeriod: translatedTimePeriod
        });
    }
    return t('multiSensorChart.desc.all', 'Todos os Sensores - Última(o) {timePeriod}', {
        timePeriod: translatedTimePeriod
    });
  }, [displayedSensors, sensors.length, t, translatedTimePeriod]);


  const handleSensorSelectionChange = (sensorId: string, checked: boolean) => {
    setSelectedSensorIds(prevIds =>
      checked ? [...prevIds, sensorId] : prevIds.filter(id => id !== sensorId)
    );
  };

  const handleSelectAllToggle = (selectAll: boolean) => {
    setSelectedSensorIds(selectAll ? sensors.map(s => s.id) : []);
  };

  const areAllSensorsSelected = selectedSensorIds.length === sensors.length && sensors.length > 0;
  
  return (
    <Card className="shadow-lg w-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-4">
        <div>
          <CardTitle className="text-lg font-headline">{t('multiSensorChart.title', 'Tendência de Temperatura dos Sensores')}</CardTitle>
          <CardDescription>{cardDescriptionText}</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={currentTimePeriod} onValueChange={(value) => setCurrentTimePeriod(value as TimePeriod)}>
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
               <DropdownMenuCheckboxItem
                checked={areAllSensorsSelected}
                onCheckedChange={(checked) => handleSelectAllToggle(Boolean(checked))}
              >
                {t(areAllSensorsSelected ? 'multiSensorChart.deselectAll' : 'multiSensorChart.selectAll', areAllSensorsSelected ? 'Desmarcar Todos' : 'Selecionar Todos')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {sensors.map(sensor => (
                <DropdownMenuCheckboxItem
                  key={sensor.id}
                  checked={selectedSensorIds.includes(sensor.id)}
                  onCheckedChange={(checked) => handleSensorSelectionChange(sensor.id, Boolean(checked))}
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
      ) : displayedSensors.length > 0 && chartData.length > 1 ? (
        <ChartContainer config={chartConfig} className="w-full h-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 0,
              right: 20,
              top: 10,
              bottom: 10,
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
              cursor={true}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value) => new Date(value).toLocaleString(t('localeCode', 'pt-BR'))}
                  formatter={(value, name) => {
                    const configEntry = chartConfig[name as keyof typeof chartConfig];
                    return (
                       <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: configEntry?.color}}/>
                           <span style={{color: configEntry?.color}}>{configEntry?.label || name}</span>
                        </div>
                        <span className="font-medium text-right text-foreground">
                          {value}°{temperatureUnit}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            {displayedSensors.map(sensor => (
              <Line
                key={sensor.id}
                dataKey={`sensor_${sensor.id}`}
                type="monotone"
                stroke={chartConfig[`sensor_${sensor.id}`]?.color || "#8884d8"}
                strokeWidth={2}
                dot={false}
                name={`sensor_${sensor.id}`}
                connectNulls={true}
              />
            ))}
             <ChartLegend content={<ChartLegendContent />} />
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
