
"use client";

import type { OptimizeAlarmSettingsOutput } from '@/ai/flows/optimize-alarm-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Thermometer } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { formatTemperature } from '@/lib/utils';

interface OptimizationResultCardProps {
  result: OptimizeAlarmSettingsOutput;
}

export default function OptimizationResultCard({ result }: OptimizationResultCardProps) {
  const { temperatureUnit } = useSettings();
  const { optimalThresholds, explanation } = result;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-primary ring-2 ring-primary/50">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center text-primary">
          <CheckCircle2 className="mr-2 h-6 w-6" />
          Configurações de Alarme Otimizadas
        </CardTitle>
        <CardDescription>
          Com base nos dados fornecidos, aqui estão os limites de alarme de temperatura recomendados pela IA.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-primary/5 rounded-lg">
          <div className="flex flex-col items-center p-4 bg-background rounded-md shadow">
            <Thermometer className="h-10 w-10 text-red-500 mb-2" />
            <p className="text-sm text-muted-foreground">Limite Superior</p>
            <p className="text-3xl font-bold text-red-600">
              {formatTemperature(optimalThresholds.highTemperatureThreshold, temperatureUnit)}
            </p>
          </div>
          <div className="flex flex-col items-center p-4 bg-background rounded-md shadow">
            <Thermometer className="h-10 w-10 text-blue-500 mb-2" />
            <p className="text-sm text-muted-foreground">Limite Inferior</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatTemperature(optimalThresholds.lowTemperatureThreshold, temperatureUnit)}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Explicação:</h3>
          <div className="prose prose-sm max-w-none p-4 bg-muted/50 rounded-md text-foreground">
            <p>{explanation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
