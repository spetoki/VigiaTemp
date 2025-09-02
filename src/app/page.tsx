
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import SensorCard from '@/components/dashboard/SensorCard';
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
import { Card, CardContent } from '@/components/ui/card';

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
    if (!activeKey || sensors.length === 0) return;

    const intervalId = setInterval(async () => {
      let hasChanged = false;
      
      const updatedSensorsPromises = sensors.map(async (sensor) => {
        if (sensor.macAddress) {
          try {
            const res = await fetch(`/api/sensor/${sensor.macAddress}`);
            if (res.ok) {
              const data = await res.json();
              if (data.temperature !== null && data.temperature !== sensor.currentTemperature) {
                hasChanged = true;
                return { ...sensor, currentTemperature: data.temperature };
              }
            }
          } catch (error) {
            console.error(`Error fetching sensor data for ${sensor.macAddress}:`, error);
          }
        }
        return sensor; // Return original sensor if no update
      });
      
      const newSensors = await Promise.all(updatedSensorsPromises);

      if (hasChanged) {
        setSensors(newSensors);
      }

      // --- Lógica de alerta permanece, mas agora opera sobre os dados potencialmente atualizados ---
      let currentAlerts: Alert[] = [];
      try {
          currentAlerts = await getAlerts(activeKey);
      } catch (e) {
          console.warn("Could not fetch alerts, proceeding without them for this check.");
          currentAlerts = [];
      }

      const soundsToQueueForThisInterval: (string | undefined)[] = [];
      const newAlertPromises: Promise<any>[] = [];
      
      newSensors.forEach(sensor => {
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
  }, [activeKey, sensors, t, temperatureUnit, toast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-32" />
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline text-primary">{t('dashboard.realTimeMonitoring', 'Monitoramento em Tempo Real')}</h1>
        <AmbientWeatherCard
          temperature={ambientTemp}
          isLoading={isLoadingAmbientTemp}
        />
      </div>

      {sensors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

    