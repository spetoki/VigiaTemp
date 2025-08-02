
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import SensorCard from '@/components/dashboard/SensorCard';
import { simulateTemperatureUpdate } from '@/lib/mockData';
import type { Sensor, Alert } from '@/types';
import { Button } from '@/components/ui/button';
import { RefreshCcw, VolumeX, Volume2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/context/SettingsContext';
import { getSensorStatus, formatTemperature } from '@/lib/utils';
import { defaultCriticalSound } from '@/lib/sounds';
import AmbientWeatherCard from '@/components/dashboard/AmbientWeatherCard';
import { getAmbientTemperature } from '@/ai/flows/get-ambient-temperature';
import { getSensors, updateSensor } from '@/services/sensor-service';
import { getAlerts, addAlert } from '@/services/alert-service';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [ambientTemp, setAmbientTemp] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAmbientTemp, setIsLoadingAmbientTemp] = useState(true);
  const { t, temperatureUnit, activeKey } = useSettings();
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  
  const [soundQueue, setSoundQueue] = useState<(string | undefined)[]>([]);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  useEffect(() => {
    if (isMuted || isPlayingSound || soundQueue.length === 0) {
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
      if (error.name === 'NotAllowedError') {
        console.warn("Audio playback failed because the user didn't interact with the page first. Muting alerts to prevent further errors. Click anywhere on the page to enable sound.");
        setIsMuted(true);
      } else {
        console.error("Audio playback promise failed:", error);
      }
      playNextSound();
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundQueue, isPlayingSound, isMuted]);

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
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold font-headline text-primary">{t('dashboard.title', 'Painel de Sensores')}</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsMuted(!isMuted)} variant="outline">
            {isMuted ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
            {isMuted ? t('dashboard.unmuteButton', 'Ativar Som') : t('dashboard.muteButton', 'Silenciar Alarme')}
          </Button>
          <Button onClick={fetchInitialData} variant="outline" disabled={isLoading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? t('dashboard.refreshingButton', 'Atualizando...') : t('dashboard.refreshButton', 'Atualizar Dados')}
          </Button>
        </div>
      </div>
      
      <section aria-labelledby="external-conditions">
         <h2 id="external-conditions" className="sr-only">Condições Externas e Acesso Rápido</h2>
         <div className="w-full max-w-sm">
            <AmbientWeatherCard
              temperature={ambientTemp}
              isLoading={isLoadingAmbientTemp}
            />
         </div>
      </section>

      <section aria-labelledby="real-time-monitoring">
        <h2 id="real-time-monitoring" className="text-2xl font-semibold mb-4 font-headline">{t('dashboard.realTimeMonitoring', 'Monitoramento em Tempo Real')}</h2>
        {sensors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sensors.map(sensor => (
              <SensorCard key={sensor.id} sensor={sensor} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{t('dashboard.noSensorsAvailable', 'Nenhum sensor disponível. Adicione sensores na página de Gerenciamento de Sensores.')}</p>
        )}
      </section>
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
