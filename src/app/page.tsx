
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import SensorCard from '@/components/dashboard/SensorCard';
import { simulateTemperatureUpdate } from '@/lib/mockData';
import type { Sensor, Alert } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/context/SettingsContext';
import { getSensorStatus, formatTemperature } from '@/lib/utils';
import { defaultCriticalSound } from '@/lib/sounds';
import AmbientWeatherCard from '@/components/dashboard/AmbientWeatherCard';
import { getAmbientTemperature } from '@/ai/flows/get-ambient-temperature';
import { getSensors, updateSensor } from '@/services/sensor-service';
import { getAlerts, addAlert } from '@/services/alert-service';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hand, Gauge, Rss, Settings } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [ambientTemp, setAmbientTemp] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAmbientTemp, setIsLoadingAmbientTemp] = useState(true);
  const { t, temperatureUnit, activeKey } = useSettings();
  const { toast } = useToast();
  
  const [soundQueue, setSoundQueue] = useState<(string | undefined)[]>([]);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  useEffect(() => {
    // This effect is responsible for playing sounds from the queue.
    // It's temporarily disabled to avoid potential issues with browser policies
    // that require user interaction before playing audio.
    // To re-enable, simply uncomment the code inside this effect.
    /*
    if (isPlayingSound || soundQueue.length === 0) {
      return;
    }

    setIsPlayingSound(true);
    const soundToPlay = soundQueue[0];

    const playNextSound = () => {
        setTimeout(() => {
            setSoundQueue(prev => prev.slice(1));
            setIsPlayingSound(false);
        }, 500);
    };

    if (!soundToPlay) {
        playNextSound();
        return;
    }
    
    const audio = new Audio(soundToPlay);
    audio.volume = 0.5;

    audio.addEventListener('ended', playNextSound);
    audio.addEventListener('error', (e) => {
        console.error("Audio playback error:", e);
        playNextSound();
    });
    
    audio.play().catch(error => {
      console.error("Audio playback promise failed:", error);
      playNextSound();
    });
    */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundQueue, isPlayingSound]);

  useEffect(() => {
    async function fetchAmbientTemp() {
      setIsLoadingAmbientTemp(true);
      try {
        const result = await getAmbientTemperature();
        setAmbientTemp(result.temperature);
      } catch (error) {
        console.error("Could not fetch ambient temperature:", error);
        setAmbientTemp(null); // Set to null on error
      } finally {
        setIsLoadingAmbientTemp(false);
      }
    }
    fetchAmbientTemp();
  }, []);

  const fetchInitialData = useCallback(async () => {
      if (!activeKey) {
        setIsLoading(false);
        return;
      };
      setIsLoading(true);
      try {
          const fetchedSensors = await getSensors(activeKey);
          setSensors(fetchedSensors);
      } catch (error) {
          console.error("Failed to load initial sensor data from Firestore:", error);
          toast({
            title: "Erro ao Carregar Sensores",
            description: "Não foi possível buscar os sensores. Verifique sua conexão e configuração do Firebase.",
            variant: "destructive",
          });
          setSensors([]);
      } finally {
          setIsLoading(false);
      }
  }, [activeKey, toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);


  useEffect(() => {
    if (!activeKey) return;

    const intervalId = setInterval(async () => {
        
        let currentSensors: Sensor[] = [];
        try {
            currentSensors = await getSensors(activeKey);
        } catch (e) {
            console.error("Failed to fetch sensors during update.", e);
            return;
        }

        const updatePromises: Promise<any>[] = [];
        const updatedSensors = currentSensors.map((sensor) => {
            const newTemperature = simulateTemperatureUpdate(sensor.currentTemperature);
            const updatedSensor = { ...sensor, currentTemperature: newTemperature };
            updatePromises.push(updateSensor(activeKey, sensor.id, { currentTemperature: newTemperature }));
            return updatedSensor;
        });
        
        await Promise.all(updatePromises);
        
        setSensors(updatedSensors);

        let currentAlerts: Alert[] = [];
        try {
            currentAlerts = await getAlerts(activeKey);
        } catch (e) {
            currentAlerts = [];
        }

        const soundsToQueueForThisInterval: (string | undefined)[] = [];
        const newAlertPromises: Promise<any>[] = [];
        
        updatedSensors.forEach(sensor => {
            const status = getSensorStatus(sensor);
            if (status === 'critical' || status === 'warning') {
                const hasRecentUnacknowledgedAlert = currentAlerts.some(
                    alert => alert.sensorId === sensor.id && !alert.acknowledged && alert.level === status
                );

                if (!hasRecentUnacknowledgedAlert) {
                    const isHigh = sensor.currentTemperature > sensor.highThreshold;
                    const message = t('alert.message.template', 
                        'Temperatura de {temp} está {direction} do limite de {limit}', 
                        {
                            temp: formatTemperature(sensor.currentTemperature, temperatureUnit),
                            direction: isHigh ? t('alert.message.above', 'acima') : t('alert.message.below', 'abaixo'),
                            limit: formatTemperature(isHigh ? sensor.highThreshold : sensor.lowThreshold, temperatureUnit)
                        }
                    );
                    const newAlert: Omit<Alert, 'id'> = {
                        sensorId: sensor.id,
                        sensorName: sensor.name,
                        timestamp: Date.now(),
                        level: status,
                        message: message,
                        acknowledged: false,
                        reason: isHigh ? 'high' : 'low',
                    };
                    newAlertPromises.push(addAlert(activeKey, newAlert));
                }
            }

            if (status === 'critical') {
                soundsToQueueForThisInterval.push(defaultCriticalSound);
            }
        });
        
        if (newAlertPromises.length > 0) {
            await Promise.all(newAlertPromises);
        }

        if (soundsToQueueForThisInterval.length > 0) {
            setSoundQueue(prevQueue => [...prevQueue, ...soundsToQueueForThisInterval]);
        }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [activeKey, t, temperatureUnit]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <CardSkeleton key={i} />
            ))}
            </div>
          </div>
      </div>
    );
  }
  
  const QuickAccessCard = () => (
    <Card>
        <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>Atalhos para as principais funções.</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="space-y-2">
                <li><Link href="/sensors" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"><Gauge className="h-5 w-5 text-primary" /> Gerenciar Sensores</Link></li>
                <li><Link href="/alerts" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"><Rss className="h-5 w-5 text-primary" /> Ver Alertas</Link></li>
                <li><Link href="/traceability" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"><Hand className="h-5 w-5 text-primary" /> Rastreabilidade</Link></li>
                <li><Link href="/system-settings" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"><Settings className="h-5 w-5 text-primary" /> Configurações</Link></li>
            </ul>
        </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Coluna da Esquerda */}
        <div className="lg:col-span-1 space-y-6">
             <AmbientWeatherCard
                  temperature={ambientTemp}
                  isLoading={isLoadingAmbientTemp}
              />
             <QuickAccessCard />
        </div>
        
        {/* Coluna da Direita */}
        <div className="lg:col-span-3">
            <h1 className="text-3xl font-bold font-headline text-primary mb-6">{t('dashboard.realTimeMonitoring', 'Monitoramento em Tempo Real')}</h1>
            {sensors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sensors.map(sensor => (
                    <SensorCard key={sensor.id} sensor={sensor} />
                ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="pt-6">
                         <p className="text-muted-foreground text-center">{t('dashboard.noSensorsAvailable', 'Nenhum sensor disponível. Adicione sensores na página de Gerenciamento de Sensores.')}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    </div>
  );
}

const CardSkeleton = () => (
  <div className="p-4 border rounded-lg shadow space-y-3">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex items-center justify-center my-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <Skeleton className="h-12 w-24 ml-4" />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
    </div>
  </div>
);

    