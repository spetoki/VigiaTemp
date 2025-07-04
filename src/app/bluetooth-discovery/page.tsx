
"use client";

import React, { useState } from 'react';
import type { Sensor } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bluetooth, BluetoothConnected, XCircle, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function BluetoothDiscoveryPage() {
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleScan = async () => {
    if (!currentUser) {
      setError(t('bluetoothPage.error.notLoggedIn', 'Você precisa estar logado para adicionar sensores.'));
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      setError(t('bluetoothPage.error.notSupported', 'A API de Bluetooth não é suportada neste navegador.'));
      setSuccessMessage(null);
      return;
    }

    setIsScanning(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service'] 
      });
      
      const SENSORS_KEY = `sensors_${currentUser.email}`;
      const storedSensorsRaw = localStorage.getItem(SENSORS_KEY);
      const sensors: Sensor[] = storedSensorsRaw ? JSON.parse(storedSensorsRaw) : [];

      const newSensor: Sensor = {
        id: `sensor-${device.id}-${Date.now()}`,
        name: device.name || `Sensor ${device.id.substring(0, 6)}...`,
        location: t('bluetoothPage.defaultLocation', 'Descoberto via Bluetooth'),
        currentTemperature: 25, // Default temp in Celsius
        highThreshold: 30, // Default high
        lowThreshold: 20, // Default low
        historicalData: [],
        model: 'Bluetooth Generic',
        ipAddress: '',
        macAddress: device.id, // Using device.id as a stand-in for MAC
        criticalAlertSound: undefined
      };
      
      const updatedSensors = [newSensor, ...sensors];
      localStorage.setItem(SENSORS_KEY, JSON.stringify(updatedSensors));
      
      toast({
          title: t('bluetoothPage.toast.sensorAdded.title', 'Sensor Adicionado'),
          description: t('bluetoothPage.toast.sensorAdded.description', 'O sensor {deviceName} foi adicionado à sua lista.', { deviceName: newSensor.name }),
      });

      setSuccessMessage(t('bluetoothPage.successMessage', 'Sensor "{sensorName}" adicionado com sucesso! Você pode gerenciá-lo na página de Sensores.', { sensorName: newSensor.name }));

    } catch (err: any) {
      if (err.name === 'NotFoundError' || err.name === 'NotAllowedError') {
        setError(t('bluetoothPage.error.cancelled', 'A busca por dispositivos foi cancelada pelo usuário.'));
      } else if (err.name === 'SecurityError') {
        setError(t('bluetoothPage.error.policy', 'O acesso ao Bluetooth foi bloqueado pela política de permissões do navegador. Isso pode ser devido a uma configuração de servidor ausente ou a restrições do navegador.'));
      }
      else {
        setError(t('bluetoothPage.error.unknown', 'Ocorreu um erro desconhecido durante a busca.'));
        console.error(err);
      }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <BluetoothConnected className="mr-3 h-8 w-8" />
          {t('bluetoothPage.title', 'Descoberta de Sensores via Bluetooth')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('bluetoothPage.description', 'Procure por sensores Bluetooth próximos e adicione-os facilmente ao seu sistema.')}
        </p>
      </div>

      <div className="flex justify-center p-8 border-2 border-dashed rounded-lg">
        <Button onClick={handleScan} disabled={isScanning} size="lg">
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t('bluetoothPage.scanningButton', 'Buscando...')}
            </>
          ) : (
            <>
              <Bluetooth className="mr-2 h-5 w-5" />
              {t('bluetoothPage.scanButton', 'Buscar Dispositivos Bluetooth')}
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>{t('signup.errorTitle', 'Erro')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="default" className="border-primary/50 text-primary bg-primary/5">
            <CheckCircle className="h-4 w-4 text-primary" />
            <AlertTitle>{t('signup.successTitle', 'Sucesso!')}</AlertTitle>
            <AlertDescription>
                {successMessage}{' '}
                <Link href="/sensors" className="font-bold underline">
                  Ir para Sensores.
                </Link>
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
