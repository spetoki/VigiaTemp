
"use client";

import React, { useState, useEffect } from 'react';
import type { Sensor } from '@/types';
import SensorTable from '@/components/sensors/SensorTable';
import SensorForm, { SensorFormData } from '@/components/sensors/SensorForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PlusCircle, Bluetooth, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function SensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useSettings();
  const { authState, currentUser } = useAuth();
  const router = useRouter();

  const getSensorsKey = () => currentUser ? `sensors_${currentUser.email}` : null;

  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.push('/login');
    } else if (currentUser) {
      const SENSORS_KEY = getSensorsKey();
      if (!SENSORS_KEY) {
        setIsLoading(false);
        return;
      };
      
      setIsLoading(true);
      try {
        const storedSensors = localStorage.getItem(SENSORS_KEY);
        if (storedSensors) {
          setSensors(JSON.parse(storedSensors));
        } else {
          // New users start with an empty array
          setSensors([]);
        }
      } catch (error) {
        console.error("Failed to access localStorage or parse sensors", error);
        setSensors([]); // Default to empty array on error
      }
      setIsLoading(false);
    }
  }, [authState, currentUser, router]);

  const handleAddSensor = () => {
    setEditingSensor(null);
    setIsFormOpen(true);
  };

  const handleEditSensor = (sensor: Sensor) => {
    setEditingSensor(sensor);
    setIsFormOpen(true);
  };

  const handleDeleteSensor = (sensorId: string) => {
    const SENSORS_KEY = getSensorsKey();
    if (!SENSORS_KEY) return;

    setSensors(prevSensors => {
        const updatedSensors = prevSensors.filter(s => s.id !== sensorId);
        try {
            localStorage.setItem(SENSORS_KEY, JSON.stringify(updatedSensors));
        } catch (e) {
            // This is less likely to happen on delete, but good to have
            if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                toast({
                    title: t('sensorsPage.toast.quotaError.title', "Erro de Armazenamento"),
                    description: t('sensorsPage.toast.quotaError.description', "Não foi possível salvar. O armazenamento está cheio. Os dados históricos antigos podem ter sido a causa."),
                    variant: "destructive"
                });
                return prevSensors;
            }
        }
        return updatedSensors;
    });
    toast({
      title: t('sensorsPage.toast.deleted.title', "Sensor Excluído"),
      description: t('sensorsPage.toast.deleted.description', "O sensor foi excluído com sucesso."),
      variant: "destructive"
    });
  };

  const handleFormSubmit = (data: SensorFormData) => {
    const SENSORS_KEY = getSensorsKey();
    if (!SENSORS_KEY) return;

    if (editingSensor) {
      setSensors(prevSensors => {
        const updatedSensors = prevSensors.map(s =>
          s.id === editingSensor.id
            ? { 
                ...editingSensor,
                ...data,
              }
            : s
        );
        try {
            localStorage.setItem(SENSORS_KEY, JSON.stringify(updatedSensors));
        } catch (e) {
            if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                toast({
                    title: t('sensorsPage.toast.quotaError.title', "Erro de Armazenamento"),
                    description: t('sensorsPage.toast.quotaError.description', "Não foi possível salvar. O armazenamento está cheio. Os dados históricos antigos podem ter sido a causa."),
                    variant: "destructive"
                });
                return prevSensors; // Return original sensors if save fails
            }
        }
        return updatedSensors;
      });
      toast({
        title: t('sensorsPage.toast.updated.title', "Sensor Atualizado"),
        description: t('sensorsPage.toast.updated.description', "O sensor \"{sensorName}\" foi atualizado com sucesso.", { sensorName: data.name }),
      });
    } else {
      const newSensor: Sensor = {
        id: `sensor-${Date.now()}`,
        ...data,
        currentTemperature: 25, // Default temp in Celsius
        historicalData: [],
      };
      setSensors(prevSensors => {
          const updatedSensors = [newSensor, ...prevSensors];
          try {
            localStorage.setItem(SENSORS_KEY, JSON.stringify(updatedSensors));
          } catch (e) {
             if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                toast({
                    title: t('sensorsPage.toast.quotaError.title', "Erro de Armazenamento"),
                    description: t('sensorsPage.toast.quotaError.description', "Não foi possível salvar. O armazenamento está cheio. Os dados históricos antigos podem ter sido a causa."),
                    variant: "destructive"
                });
                return prevSensors; // Return original sensors if save fails
            }
          }
          return updatedSensors;
      });
      toast({
        title: t('sensorsPage.toast.added.title', "Sensor Adicionado"),
        description: t('sensorsPage.toast.added.description', "O sensor \"{sensorName}\" foi adicionado com sucesso.", { sensorName: data.name }),
      });
    }
    setIsFormOpen(false);
    setEditingSensor(null);
  };
  
  if (isLoading || authState === 'loading' || !currentUser) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold font-headline text-primary">{t('sensorsPage.title', 'Gerenciamento de Sensores')}</h1>
        <div className="flex items-center gap-2 flex-wrap justify-center">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> {t('sensorsPage.addSensorButton', 'Adicionar Sensor')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleAddSensor} className="cursor-pointer">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('sensorsPage.addManually', 'Adicionar Manualmente')}
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/wifi-discovery">
                  <Wifi className="mr-2 h-4 w-4" />
                  {t('sensorsPage.discoverWifiButton', 'Descobrir via WiFi')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/bluetooth-discovery">
                  <Bluetooth className="mr-2 h-4 w-4" />
                  {t('sensorsPage.discoverButton', 'Descobrir via Bluetooth')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SensorTable
        sensors={sensors}
        onEdit={handleEditSensor}
        onDelete={handleDeleteSensor}
      />

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingSensor(null);
        }}>
        <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] flex flex-col p-0">
          <SensorForm
            sensor={editingSensor}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingSensor(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
