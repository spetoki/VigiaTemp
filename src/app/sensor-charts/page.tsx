
"use client";

import React, { useState, useEffect } from 'react';
import type { Sensor } from '@/types';
import MultiSensorTemperatureChart from '@/components/dashboard/MultiSensorTemperatureChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SensorChartsPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authState, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.push('/login');
    }
  }, [authState, router]);

  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      const SENSORS_KEY = `sensors_${currentUser.email}`;
      try {
        const storedSensors = localStorage.getItem(SENSORS_KEY);
        if (storedSensors) {
          setSensors(JSON.parse(storedSensors));
        } else {
          setSensors([]);
        }
      } catch (error) {
        console.error("Failed to load sensors for charts", error);
        setSensors([]);
      }
      setIsLoading(false);
    }
  }, [currentUser]);

  if (isLoading || authState === 'loading' || !currentUser) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-2">
          <LineChart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline text-primary">Gráficos dos Sensores</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Visualize os dados históricos de temperatura para todos os seus sensores em um único gráfico.
        </p>
        <div className="space-y-6">
          <Skeleton className="h-[500px] w-full" /> 
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
            <LineChart className="h-8 w-8 text-primary hidden sm:block" />
            <div>
                <h1 className="text-3xl font-bold font-headline text-primary">Gráficos Comparativos dos Sensores</h1>
                <p className="text-muted-foreground mt-1">
                  Visualize os dados históricos de temperatura de todos os seus sensores em um único gráfico.
                </p>
            </div>
        </div>
      </div>

      {sensors.length === 0 && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum Sensor Disponível</CardTitle>
            <CardDescription>
              Não há sensores cadastrados para exibir gráficos. Adicione sensores na página de Gerenciamento de Sensores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Adicione sensores para visualizar seus dados aqui.</p>
          </CardContent>
        </Card>
      )}

      {sensors.length > 0 && (
        <div className="space-y-6">
          <MultiSensorTemperatureChart sensors={sensors} initialTimePeriod="day" />
        </div>
      )}
    </div>
  );
}
