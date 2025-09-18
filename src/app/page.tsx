
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import SensorCard from '@/components/dashboard/SensorCard';
import type { Sensor, Alert } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/context/SettingsContext';
import { getSensorStatus, formatTemperature } from '@/lib/utils';
import { defaultCriticalSound } from '@/lib/sounds';
import { getAlerts, addAlert } from '@/services/alert-service';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';


export default function DashboardPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, temperatureUnit, storageKeys } = useSettings();
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

  // This effect now sets up a real-time listener on the sensors collection
  useEffect(() => {
    if (!db || !storageKeys.sensors || !storageKeys.sensors.startsWith('users/')) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const sensorsCol = collection(db, storageKeys.sensors);
    const q = query(sensorsCol, orderBy("name", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedSensors: Sensor[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Sensor));
        
        setSensors(fetchedSensors);
        setIsLoading(false);
    }, (error) => {
        console.error("Failed to listen to sensor data from Firestore:", error);
        toast({
          title: "Erro ao Carregar Sensores",
          description: "Não foi possível conectar para receber atualizações em tempo real.",
          variant: "destructive",
        });
        setIsLoading(false);
        setSensors([]);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [storageKeys.sensors, toast]);


  // This effect runs whenever the sensor data changes to check for new alerts.
  useEffect(() => {
    if (isLoading || sensors.length === 0 || !storageKeys.alerts) return;

    const checkAlerts = async () => {
        let currentAlerts: Alert[] = [];
        try {
            currentAlerts = await getAlerts(storageKeys.alerts);
        } catch (e) {
            console.warn("Could not fetch alerts, proceeding without them for this check.");
            currentAlerts = [];
        }

        const soundsToQueueForThisInterval: (string | undefined)[] = [];
        const newAlertPromises: Promise<any>[] = [];
        
        sensors.forEach(sensor => {
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
                    newAlertPromises.push(addAlert(storageKeys.alerts, newAlert));
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
    };

    checkAlerts();
    
  }, [sensors, isLoading, storageKeys.alerts, t, temperatureUnit]);

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

    

    