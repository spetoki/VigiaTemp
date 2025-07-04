
"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleOptimizeAlarms, OptimizeFormState } from '@/app/optimize-alarms/actions';
import { BrainCircuit, AlertCircle, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import OptimizationResultCard from './OptimizationResultCard';

export default function OptimizeAlarmsForm() {
  const [state, setState] = useState<Partial<OptimizeFormState>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setState({}); // Clear previous state

    const formData = new FormData(event.currentTarget);
    const rawFormData = {
      historicalData: formData.get('historicalData') as string,
      cacaoVariety: formData.get('cacaoVariety') as string,
      microclimateInfo: formData.get('microclimateInfo') as string,
    };
    
    const result = await handleOptimizeAlarms(rawFormData);
    setState(result);
    setIsLoading(false);
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <BrainCircuit className="mr-2 h-6 w-6 text-primary" />
            Otimização de Alarme com IA
          </CardTitle>
          <CardDescription>
            Forneça detalhes sobre seu cultivo de cacau para receber recomendações baseadas em IA para os limites ideais de alarme de temperatura. Todos os dados são processados com segurança.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {state?.message && !state.success && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro na Otimização</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
                {state.issues && (
                  <ul className="mt-2 list-disc list-inside text-sm">
                    {state.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                )}
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="cacaoVariety">Variedade de Cacau</Label>
              <Input
                id="cacaoVariety"
                name="cacaoVariety"
                placeholder="Ex: Criollo, Forastero, Trinitario"
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="microclimateInfo">Informações do Microclima</Label>
              <Textarea
                id="microclimateInfo"
                name="microclimateInfo"
                placeholder="Descreva os níveis de umidade, exposição solar, sistemas de ventilação, tamanho da estufa, etc."
                rows={4}
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="historicalData">Dados Históricos de Temperatura (formato JSON)</Label>
              <Textarea
                id="historicalData"
                name="historicalData"
                placeholder='Ex: [{"timestamp": 1672531200000, "temperature": 25.5}, ...]'
                rows={6}
                required
                className="bg-background font-code text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Forneça um array JSON de objetos, cada um com os campos "timestamp" (milissegundos Unix) e "temperature" (Celsius).
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
             <Button type="submit" disabled={isLoading} className="w-full sm:w-auto" aria-disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Otimizando...
                </>
              ) : (
                <>
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  Otimizar Configurações de Alarme
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {state.success && state.data && (
        <div className="mt-12">
          <OptimizationResultCard result={state.data} />
        </div>
      )}
    </>
  );
}
