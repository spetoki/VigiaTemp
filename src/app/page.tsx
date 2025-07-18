
"use client";

import React, { useState, useEffect } from 'react';
import SensorCard from '@/components/dashboard/SensorCard';
import { demoSensors, simulateTemperatureUpdate } from '@/lib/mockData';
import type { Sensor, Alert } from '@/types';
import { Button } from '@/components/ui/button';
import { RefreshCcw, VolumeX, Volume2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/context/SettingsContext';
import { getSensorStatus, formatTemperature } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { defaultCriticalSound } from '@/lib/sounds';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, temperatureUnit } = useSettings();
  const [isMuted, setIsMuted] = useState(false);
  const { currentUser, authState } = useAuth();
  const router = useRouter();

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

  // Effect to redirect if not authenticated
  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.push('/login');
    }
  }, [authState, router]);

  // Effect to load initial sensor data
  useEffect(() => {
    if (currentUser) {
      const SENSORS_KEY = `sensors_${currentUser.email}`;
      try {
          const storedSensors = localStorage.getItem(SENSORS_KEY);
          if (storedSensors) {
              const parsedSensors: any[] = JSON.parse(storedSensors);
              const cleanedSensors: Sensor[] = parsedSensors.map(s => ({
                  id: s.id || `sensor-${Date.now()}${Math.random()}`,
                  name: s.name || 'Unnamed Sensor',
                  location: s.location || 'Unknown Location',
                  currentTemperature: s.currentTemperature ?? 25,
                  highThreshold: s.highThreshold ?? 30,
                  lowThreshold: s.lowThreshold ?? 20,
                  historicalData: Array.isArray(s.historicalData) ? s.historicalData : [],
                  model: s.model || 'Unknown Model',
                  ipAddress: s.ipAddress || '',
                  macAddress: s.macAddress || '',
                  criticalAlertSound: s.criticalAlertSound || undefined,
              }));
              setSensors(cleanedSensors);
          } else {
              // If no sensors for this user, seed with demo data
              localStorage.setItem(SENSORS_KEY, JSON.stringify(demoSensors));
              setSensors(demoSensors);
          }
      } catch (e) {
          console.error("Failed to parse sensors from localStorage, defaulting to demo data.", e);
          setSensors(demoSensors);
      } finally {
          setIsLoading(false);
      }
    } else if (authState === 'unauthenticated') {
      router.push('/login');
    } else {
      setIsLoading(true);
    }
  }, [currentUser, authState, router]);


  // Effect for the main update interval
  useEffect(() => {
    if (!currentUser) return; // Only run updates if logged in

    const intervalId = setInterval(() => {
        const SENSORS_KEY = `sensors_${currentUser.email}`;
        const ALERTS_KEY = `alerts_${currentUser.email}`;
        
        let currentSensors: Sensor[] = [];
        try {
            const storedSensors = localStorage.getItem(SENSORS_KEY);
            currentSensors = storedSensors ? JSON.parse(storedSensors) : [];
        } catch (e) {
            console.error("Failed to parse sensors from localStorage during update.", e);
            return;
        }

        const updatedSensors = currentSensors.map((sensor) => {
            const newTemperature = simulateTemperatureUpdate(sensor.currentTemperature);
            return {
                ...sensor,
                currentTemperature: newTemperature,
                historicalData: [
                    ...(sensor.historicalData || []),
                    { timestamp: Date.now(), temperature: newTemperature }
                ].slice(-200)
            };
        });

        let currentAlerts: Alert[] = [];
        try {
            const storedAlerts = localStorage.getItem(ALERTS_KEY);
            currentAlerts = storedAlerts ? JSON.parse(storedAlerts) : [];
        } catch (e) {
            currentAlerts = [];
        }

        const soundsToQueueForThisInterval: (string | undefined)[] = [];
        
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
                    const newAlert: Alert = {
                        id: `alert-${Date.now()}-${sensor.id}`,
                        sensorId: sensor.id,
                        sensorName: sensor.name,
                        timestamp: Date.now(),
                        level: status,
                        message: message,
                        acknowledged: false,
                        reason: isHigh ? 'high' : 'low',
                    };
                    currentAlerts.unshift(newAlert);
                }
            }

            if (status === 'critical') {
                soundsToQueueForThisInterval.push(sensor.criticalAlertSound || defaultCriticalSound);
            }
        });

        if (soundsToQueueForThisInterval.length > 0) {
            setSoundQueue(prevQueue => [...prevQueue, ...soundsToQueueForThisInterval]);
        }
        
        try {
          localStorage.setItem(ALERTS_KEY, JSON.stringify(currentAlerts.slice(0, 100)));
          localStorage.setItem(SENSORS_KEY, JSON.stringify(updatedSensors));
          setSensors(updatedSensors);
        } catch(e) {
            if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                console.error("LocalStorage quota exceeded on dashboard update. Further updates may fail.");
            }
        }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [currentUser, t, temperatureUnit]);


  const handleRefreshData = () => {
    setIsLoading(true);
    if (currentUser) {
        const SENSORS_KEY = `sensors_${currentUser.email}`;
        localStorage.setItem(SENSORS_KEY, JSON.stringify(demoSensors));
    }
    setSensors(demoSensors);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };
  

  if (isLoading || authState !== 'authenticated') {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-28" />
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
          <Button onClick={handleRefreshData} variant="outline" disabled={isLoading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? t('dashboard.refreshingButton', 'Atualizando...') : t('dashboard.refreshButton', 'Atualizar Dados')}
          </Button>
        </div>
      </div>

      <section aria-labelledby="real-time-monitoring">
        <h2 id="real-time-monitoring" className="text-2xl font-semibold mb-4 font-headline">{t('dashboard.realTimeMonitoring', 'Monitoramento em Tempo Real')}</h2>
        {sensors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
