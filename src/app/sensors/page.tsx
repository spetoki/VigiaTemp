
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Sensor } from '@/types';
import SensorTable from '@/components/sensors/SensorTable';
import SensorForm, { SensorFormData } from '@/components/sensors/SensorForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PlusCircle, Bluetooth, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/context/SettingsContext';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { addSensor, deleteSensor, getSensors, updateSensor } from '@/services/sensor-service';

export default function SensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t, storageKeys } = useSettings();

  const fetchSensors = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedSensors = await getSensors(storageKeys.sensors);
      setSensors(fetchedSensors);
    } catch (error) {
      console.error("Falha ao buscar sensores:", error);
      toast({
        title: t('sensorsPage.toast.fetchError.title', "Erro ao Buscar Sensores"),
        description: t('sensorsPage.toast.fetchError.description', "Não foi possível carregar os sensores."),
        variant: "destructive",
      });
      setSensors([]);
    } finally {
      setIsLoading(false);
    }
  }, [storageKeys.sensors, t, toast]);

  useEffect(() => {
    fetchSensors();
  }, [fetchSensors]);

  const handleAddSensor = () => {
    setEditingSensor(null);
    setIsFormOpen(true);
  };

  const handleEditSensor = (sensor: Sensor) => {
    setEditingSensor(sensor);
    setIsFormOpen(true);
  };

  const handleDeleteSensor = async (sensorId: string) => {
    try {
      await deleteSensor(storageKeys.sensors, sensorId);
      setSensors(prevSensors => prevSensors.filter(s => s.id !== sensorId));
      toast({
        title: t('sensorsPage.toast.deleted.title', "Sensor Excluído"),
        description: t('sensorsPage.toast.deleted.description', "O sensor foi excluído com sucesso."),
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: t('sensorsPage.toast.deleteError.title', "Erro ao Excluir"),
        description: t('sensorsPage.toast.deleteError.description', "Não foi possível excluir o sensor."),
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (data: SensorFormData) => {
    if (editingSensor) {
      // Update existing sensor
      try {
        await updateSensor(storageKeys.sensors, editingSensor.id, data);
        // We refetch all sensors to ensure the view is consistent with the in-memory store
        fetchSensors();
        toast({
          title: t('sensorsPage.toast.updated.title', "Sensor Atualizado"),
          description: t('sensorsPage.toast.updated.description', "O sensor \"{sensorName}\" foi atualizado com sucesso.", { sensorName: data.name }),
        });
      } catch (error) {
        toast({
          title: t('sensorsPage.toast.updateError.title', "Erro ao Atualizar"),
          description: t('sensorsPage.toast.updateError.description', "Não foi possível atualizar o sensor."),
          variant: "destructive",
        });
      }
    } else {
      // Add new sensor
      try {
        await addSensor(storageKeys.sensors, data);
        // We refetch all sensors to ensure the view is consistent with the in-memory store
        fetchSensors();
        toast({
          title: t('sensorsPage.toast.added.title', "Sensor Adicionado"),
          description: t('sensorsPage.toast.added.description', "O sensor \"{sensorName}\" foi adicionado com sucesso.", { sensorName: data.name }),
        });
      } catch (error) {
        toast({
          title: t('sensorsPage.toast.addError.title', "Erro ao Adicionar"),
          description: t('sensorsPage.toast.addError.description', "Não foi possível adicionar o sensor."),
          variant: "destructive",
        });
      }
    }
    setIsFormOpen(false);
    setEditingSensor(null);
  };
  
  if (isLoading) {
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
