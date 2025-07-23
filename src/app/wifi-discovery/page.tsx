
"use client";

import React, { useState } from 'react';
import type { Sensor } from '@/types';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Wifi, Loader2, PlusCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Mock data for discovered WiFi devices
const mockDiscoveredDevices = [
    { name: 'Sensor Estufa Principal', ipAddress: '192.168.1.15', macAddress: 'A1:B2:C3:D4:E5:F6', signal: -45 },
    { name: 'Sensor de Canto', ipAddress: '192.168.1.23', macAddress: 'B2:C3:D4:E5:F6:A1', signal: -67 },
    { name: 'Sensor via Totolink EX750', ipAddress: '192.168.1.88', macAddress: 'E8:F6:C1:AA:BB:CC', signal: -52 },
    { name: 'TempMonitor-3000', ipAddress: '192.168.1.42', macAddress: 'C3:D4:E5:F6:A1:B2', signal: -80 },
    { name: 'Sensor Desconhecido', ipAddress: '192.168.1.55', macAddress: 'D4:E5:F6:A1:B2:C3', signal: -55 },
];

type DiscoveredDevice = typeof mockDiscoveredDevices[0];

const SENSORS_KEY = 'demo_sensors';

export default function WifiDiscoveryPage() {
  const { t } = useSettings();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([]);
  const [addedMacs, setAddedMacs] = useState<Set<string>>(new Set());

  const getSignalStrengthBadge = (signal: number) => {
    if (signal > -60) return 'bg-green-100 text-green-800 border-green-300';
    if (signal > -75) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };
  const getSignalStrengthText = (signal: number) => {
    if (signal > -60) return t('wifiDiscoveryPage.signal.excellent', "Excelente");
    if (signal > -75) return t('wifiDiscoveryPage.signal.good', "Bom");
    return t('wifiDiscoveryPage.signal.weak', "Fraco");
  };
  
  const handleScan = async () => {
    setIsScanning(true);
    setDiscoveredDevices([]);

    await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate network scan

    const storedSensorsRaw = localStorage.getItem(SENSORS_KEY);
    const existingSensors: Sensor[] = storedSensorsRaw ? JSON.parse(storedSensorsRaw) : [];
    const existingMacs = new Set(existingSensors.map(s => s.macAddress).filter((mac): mac is string => mac !== undefined));
    
    setAddedMacs(existingMacs);
    setDiscoveredDevices(mockDiscoveredDevices);
    setIsScanning(false);
  };
  
  const handleAddSensor = (device: DiscoveredDevice) => {
    const storedSensorsRaw = localStorage.getItem(SENSORS_KEY);
    const sensors: Sensor[] = storedSensorsRaw ? JSON.parse(storedSensorsRaw) : [];

    if (sensors.some(s => s.macAddress === device.macAddress)) {
      toast({
          title: t('wifiDiscoveryPage.toast.alreadyExists.title', 'Sensor já Existe'),
          description: t('wifiDiscoveryPage.toast.alreadyExists.description', 'O sensor com o endereço MAC {mac} já está na sua lista.', { mac: device.macAddress }),
          variant: "destructive",
      });
      return;
    }
    
    const newSensor: Sensor = {
        id: `sensor-wifi-${device.macAddress}`,
        name: device.name,
        location: t('wifiDiscoveryPage.defaultLocation', 'Descoberto via WiFi'),
        currentTemperature: 25, 
        highThreshold: 30,
        lowThreshold: 20,
        historicalData: [],
        model: 'WiFi Generic',
        ipAddress: device.ipAddress,
        macAddress: device.macAddress,
    };
    
    const updatedSensors = [newSensor, ...sensors];
    localStorage.setItem(SENSORS_KEY, JSON.stringify(updatedSensors));
    setAddedMacs(prev => new Set(prev).add(device.macAddress));

    toast({
        title: t('wifiDiscoveryPage.toast.sensorAdded.title', 'Sensor Adicionado'),
        description: t('wifiDiscoveryPage.toast.sensorAdded.description', 'O sensor {deviceName} foi adicionado à sua lista.', { deviceName: newSensor.name }),
    });
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <Wifi className="mr-3 h-8 w-8" />
          {t('wifiDiscoveryPage.title', 'Descoberta de Sensores via WiFi')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('wifiDiscoveryPage.description', 'Busque por sensores na sua rede local e adicione-os ao sistema. (Funcionalidade simulada)')}
        </p>
      </div>

      <div className="flex justify-start p-4 border-2 border-dashed rounded-lg">
        <Button onClick={handleScan} disabled={isScanning} size="lg">
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t('wifiDiscoveryPage.scanningButton', 'Buscando na rede...')}
            </>
          ) : (
            <>
              <Wifi className="mr-2 h-5 w-5" />
              {t('wifiDiscoveryPage.scanButton', 'Buscar Sensores na Rede')}
            </>
          )}
        </Button>
      </div>

      {(isScanning || discoveredDevices.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('wifiDiscoveryPage.resultsTitle', 'Resultados da Busca')}</h2>
           <div className="rounded-lg border overflow-hidden shadow-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('wifiDiscoveryPage.deviceTable.name', 'Nome do Dispositivo')}</TableHead>
                            <TableHead>{t('wifiDiscoveryPage.deviceTable.ipAddress', 'Endereço IP')}</TableHead>
                            <TableHead>{t('wifiDiscoveryPage.deviceTable.macAddress', 'Endereço MAC')}</TableHead>
                            <TableHead className="text-center">{t('wifiDiscoveryPage.deviceTable.signalStrength', 'Sinal')}</TableHead>
                            <TableHead className="text-right">{t('wifiDiscoveryPage.deviceTable.actions', 'Ação')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isScanning ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : discoveredDevices.length === 0 ? (
                             <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    {t('wifiDiscoveryPage.noDevicesFound', 'Nenhum dispositivo encontrado na rede.')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            discoveredDevices.map(device => (
                                <TableRow key={device.macAddress}>
                                    <TableCell className="font-medium">{device.name}</TableCell>
                                    <TableCell>{device.ipAddress}</TableCell>
                                    <TableCell className="font-mono text-xs">{device.macAddress}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className={cn(getSignalStrengthBadge(device.signal))}>
                                            {getSignalStrengthText(device.signal)} ({device.signal} dBm)
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {addedMacs.has(device.macAddress) ? (
                                        <div className="flex items-center justify-end gap-2 text-green-600">
                                            <CheckCircle className="h-4 w-4" />
                                            {t('wifiDiscoveryPage.added', 'Adicionado')}
                                        </div>
                                      ) : (
                                        <Button size="sm" onClick={() => handleAddSensor(device)}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            {t('wifiDiscoveryPage.addButton', 'Adicionar')}
                                        </Button>
                                      )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
           </div>
        </div>
      )}
    </div>
  );
}
