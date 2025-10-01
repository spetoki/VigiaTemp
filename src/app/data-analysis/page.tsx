
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Sensor, Alert } from '@/types';
import { useSettings } from '@/context/SettingsContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, CalendarDays, PieChartIcon, Activity } from 'lucide-react';
import SensorStatusPieChart from '@/components/charts/SensorStatusPieChart';
import AlertFrequencyBarChart from '@/components/charts/AlertFrequencyBarChart';
import AlertsCalendarHeatmap from '@/components/charts/AlertsCalendarHeatmap';
import { getSensors } from '@/services/sensor-service';
import { getAlerts } from '@/services/alert-service';
import { useToast } from '@/hooks/use-toast';

export default function DataAnalysisPage() {
  const { t, storageKeys } = useSettings();
  const { toast } = useToast();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedSensors, fetchedAlerts] = await Promise.all([
        getSensors(storageKeys.sensors),
        getAlerts(storageKeys.alerts)
      ]);
      setSensors(fetchedSensors);
      setAlerts(fetchedAlerts);
    } catch (error) {
      console.error("Falha ao carregar dados para a página de análise:", error);
      toast({
        title: "Erro ao Carregar Dados",
        description: "Não foi possível buscar os dados para análise.",
        variant: "destructive",
      });
      setSensors([]);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, [storageKeys.sensors, storageKeys.alerts, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const alertsByDay = useMemo(() => {
    return alerts.reduce((acc, alert) => {
      const day = new Date(alert.timestamp).toISOString().split('T')[0];
      const existing = acc.find(d => d.day === day);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ day, value: 1 });
      }
      return acc;
    }, [] as { day: string, value: number }[]);
  }, [alerts]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full lg:col-span-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <Activity className="mr-3 h-8 w-8" />
            {t('dataAnalysis.pageTitle', 'Análise de Dados dos Sensores')}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            {t('dataAnalysis.pageDescription', 'Explore visualizações avançadas sobre o comportamento dos seus sensores e a frequência de alertas para identificar padrões e otimizar a operação.')}
          </p>
        </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              {t('dataAnalysis.pieChart.title', 'Distribuição de Status por Sensor')}
            </CardTitle>
            <CardDescription>{t('dataAnalysis.pieChart.description', 'Percentual de tempo que cada sensor permaneceu em estado "Normal", "Atenção" ou "Crítico". (Baseado em simulação)')}</CardDescription>
          </CardHeader>
          <CardContent>
            {sensors.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {sensors.map(sensor => (
                  <SensorStatusPieChart key={sensor.id} sensor={sensor} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">{t('dataAnalysis.noSensorData', 'Não há dados de sensores para analisar.')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              {t('dataAnalysis.barChart.title', 'Frequência de Alertas por Nível')}
            </CardTitle>
             <CardDescription>{t('dataAnalysis.barChart.description', 'Contagem de alertas de "Atenção" e "Críticos" agrupados por dia para identificar picos de incidentes.')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
             {alerts.length > 0 ? (
                <AlertFrequencyBarChart alerts={alerts} />
             ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    {t('dataAnalysis.noAlertData', 'Não há dados de alertas para analisar.')}
                </div>
             )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              {t('dataAnalysis.heatmap.title', 'Calendário de Atividade de Alertas (Heatmap)')}</CardTitle>
            <CardDescription>{t('dataAnalysis.heatmap.description', 'Visualize a intensidade de alertas ao longo do ano. Dias mais escuros indicam uma maior ocorrência de alertas.')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
             {alerts.length > 0 ? (
                <AlertsCalendarHeatmap data={alertsByDay} />
             ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                     {t('dataAnalysis.noAlertData', 'Não há dados de alertas para analisar.')}
                </div>
             )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
