
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Sensor } from '@/types';
import MultiSensorTemperatureChart from '@/components/dashboard/MultiSensorTemperatureChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Loader2 } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { getSensors } from '@/services/sensor-service';
import { useToast } from '@/hooks/use-toast';

export default function SensorChartsPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, storageKeys } = useSettings();
  const { toast } = useToast();

  const fetchSensors = useCallback(async () => {
    if (!storageKeys.sensors) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    try {
      const fetchedSensors = await getSensors(storageKeys.sensors);
      setSensors(fetchedSensors);
    } catch (error) {
      console.error("Failed to load sensors for charts, defaulting to empty.", error);
       toast({
        title: "Erro ao Carregar Sensores",
        description: "Não foi possível buscar os dados dos sensores para os gráficos.",
        variant: "destructive",
      });
      setSensors([]);
    } finally {
      setIsLoading(false);
    }
  }, [storageKeys.sensors, toast]);

  useEffect(() => {
    fetchSensors();
  }, [fetchSensors]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-[500px] w-full" /> 
        </div>
      );
    }

    if (sensors.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{t('sensorChartsPage.noSensorsCard.title', 'Nenhum Sensor Disponível')}</CardTitle>
            <CardDescription>
              {t('sensorChartsPage.noSensorsCard.description', 'Não há sensores cadastrados para exibir gráficos. Adicione sensores na página de Gerenciamento de Sensores.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{t('sensorChartsPage.noSensorsCard.content', 'Adicione sensores para visualizar seus dados aqui.')}</p>
          </CardContent>
        </Card>
      );
    }

    if (storageKeys.sensors) {
      return (
        <div className="space-y-6">
          <MultiSensorTemperatureChart 
            sensors={sensors} 
            initialTimePeriod="day" 
            collectionPath={storageKeys.sensors} 
          />
        </div>
      );
    }

    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
            <LineChart className="h-8 w-8 text-primary hidden sm:block" />
            <div>
                <h1 className="text-3xl font-bold font-headline text-primary">{t('sensorChartsPage.title', 'Gráficos Comparativos dos Sensores')}</h1>
                <p className="text-muted-foreground mt-1">
                  {t('sensorChartsPage.description', 'Visualize os dados históricos de temperatura de todos os seus sensores em um único gráfico.')}
                </p>
            </div>
        </div>
      </div>
      
      {renderContent()}

    </div>
  );
}
