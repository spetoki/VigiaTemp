
"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleOptimizeAlarms, OptimizeFormState } from '@/app/optimize-alarms/actions';
import { BrainCircuit, AlertCircle } from 'lucide-react';
import React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import OptimizationResultCard from './OptimizationResultCard';

const initialState: OptimizeFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto" aria-disabled={pending}>
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Otimizando...
        </>
      ) : (
        <>
          <BrainCircuit className="mr-2 h-4 w-4" />
          Otimizar Configurações de Alarme
        </>
      )}
    </Button>
  );
}

export default function OptimizeAlarmsForm() {
  const [state, formAction] = useFormState(handleOptimizeAlarms, initialState);

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
        <form action={formAction}>
          <CardContent className="space-y-6">
            {state?.message && !state.data && (
              <Alert variant={state.issues || state.message?.includes("falhou") || state.message?.includes("Erro:") ? "destructive" : "default"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{state.issues || state.message?.includes("falhou") || state.message?.includes("Erro:") ? "Erro" : "Aviso"}</AlertTitle>
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
                defaultValue={state?.fields?.cacaoVariety}
                aria-describedby="cacaoVariety-error"
                className="bg-background"
              />
              {state?.issues && state.issues.some(issue => issue.toLowerCase().includes('cacau')) && <p id="cacaoVariety-error" className="text-sm text-destructive">A variedade de cacau é obrigatória.</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="microclimateInfo">Informações do Microclima</Label>
              <Textarea
                id="microclimateInfo"
                name="microclimateInfo"
                placeholder="Descreva os níveis de umidade, exposição solar, sistemas de ventilação, tamanho da estufa, etc."
                rows={4}
                defaultValue={state?.fields?.microclimateInfo}
                aria-describedby="microclimateInfo-error"
                className="bg-background"
              />
              {state?.issues && state.issues.some(issue => issue.toLowerCase().includes('microclima')) && <p id="microclimateInfo-error" className="text-sm text-destructive">As informações do microclima são obrigatórias.</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="historicalData">Dados Históricos de Temperatura (formato JSON)</Label>
              <Textarea
                id="historicalData"
                name="historicalData"
                placeholder='Ex: [{"timestamp": 1672531200000, "temperature": 25.5}, ...]'
                rows={6}
                defaultValue={state?.fields?.historicalData}
                aria-describedby="historicalData-error"
                className="bg-background font-code text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Forneça um array JSON de objetos, cada um com os campos "timestamp" (milissegundos Unix) e "temperature" (Celsius).
              </p>
              {state?.issues && state.issues.some(issue => issue.toLowerCase().includes('históricos')) && <p id="historicalData-error" className="text-sm text-destructive">Os dados históricos são obrigatórios e devem ser um JSON válido.</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state?.data && (
        <div className="mt-12">
          <OptimizationResultCard result={state.data} />
        </div>
      )}
    </>
  );
}
