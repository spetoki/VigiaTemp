
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BrainCircuit, Lightbulb, Loader2, Thermometer, AlertCircle, Sparkles, Download } from 'lucide-react';
import { optimizeFermentation, OptimizeFermentationOutput } from '@/ai/flows/optimize-fermentation-flow';
import { getSensors, getHistoricalData } from '@/services/sensor-service';
import type { HistoricalDataPoint } from '@/types';


const formSchema = z.object({
  cacaoVariety: z.string().min(3, "A variedade do cacau é obrigatória."),
  microclimateInfo: z.string().min(20, "A descrição do microclima é obrigatória (mín. 20 caracteres)."),
  historicalData: z.string().refine((data) => {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 && 'timestamp' in parsed[0] && 'temperature' in parsed[0];
    } catch (e) {
      return false;
    }
  }, "Os dados históricos são obrigatórios e devem ser um JSON válido com 'timestamp' e 'temperature'."),
});

export default function AIOptimizationPage() {
  const { t, storageKeys } = useSettings();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [result, setResult] = useState<OptimizeFermentationOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cacaoVariety: '',
      microclimateInfo: '',
      historicalData: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setResult(null);

    try {
      const input = {
        ...values,
        historicalData: JSON.parse(values.historicalData),
      };
      
      const aiResult = await optimizeFermentation(input);
      setResult(aiResult);
      
      toast({
        title: t('optimizeAlarmsForm.optimizationSuccess', "Otimização bem-sucedida!"),
      });

    } catch (error: any) {
      console.error("AI Optimization failed:", error);
      toast({
        variant: 'destructive',
        title: t('optimizeAlarmsForm.errorTitle', "Erro na Otimização"),
        description: error.message || t('optimizeAlarmsForm.unknownError', "Ocorreu um erro desconhecido."),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleLoadHistoricalData = async () => {
    setIsLoadingData(true);
    try {
        const sensors = await getSensors(storageKeys.sensors);
        if (sensors.length === 0) {
            toast({
                variant: 'destructive',
                title: "Nenhum Sensor Encontrado",
                description: "É preciso ter pelo menos um sensor cadastrado para carregar dados.",
            });
            return;
        }

        // Fetch data for the last 30 days
        const allDataPromises = sensors.map(sensor => getHistoricalData(storageKeys.sensors, sensor.id, 'month'));
        const allDataArrays = await Promise.all(allDataPromises);
        let combinedData = allDataArrays.flat().sort((a, b) => a.timestamp - b.timestamp); // Sort oldest to newest

        if (combinedData.length === 0) {
            toast({
                title: "Sem Dados Históricos",
                description: "Não foram encontrados registros de temperatura nos últimos 30 dias para os sensores.",
            });
            form.setValue('historicalData', '[]');
            return;
        }
        
        const MAX_SIZE_KB = 900;
        const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;
        let jsonData = JSON.stringify(combinedData, null, 2);
        let wasTruncated = false;

        // If size exceeds limit, truncate oldest entries
        while (new TextEncoder().encode(jsonData).length > MAX_SIZE_BYTES && combinedData.length > 1) {
            combinedData.shift(); // Remove the oldest entry
            jsonData = JSON.stringify(combinedData, null, 2);
            wasTruncated = true;
        }
        
        form.setValue('historicalData', jsonData);

        let toastDescription = `${combinedData.length} registros de temperatura foram carregados.`;
        if (wasTruncated) {
            toastDescription += ` Os dados foram limitados a ~${MAX_SIZE_KB}KB para otimização.`;
        }
        
        toast({
            title: "Dados Carregados com Sucesso",
            description: toastDescription,
        });

    } catch (error) {
        toast({
            variant: 'destructive',
            title: "Erro ao Carregar Dados",
            description: "Não foi possível buscar os dados históricos dos sensores.",
        });
    } finally {
        setIsLoadingData(false);
    }
  };


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <BrainCircuit className="mr-3 h-8 w-8" />
          {t('optimizeAlarms.pageTitle', 'Otimização de Alarmes com IA')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('optimizeAlarms.pageDescription', 'Use inteligência artificial para ajustar os limites de temperatura e otimizar seu processo de fermentação.')}
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('optimizeAlarmsForm.title', 'Análise de Fermentação com IA')}</CardTitle>
          <CardDescription>
            {t('optimizeAlarmsForm.description', 'Forneça os detalhes sobre seu processo para receber sugestões de limites de temperatura.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="cacaoVariety"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('optimizeAlarmsForm.cacaoVarietyLabel', 'Variedade do Cacau')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('optimizeAlarmsForm.cacaoVarietyPlaceholder', 'Ex: Criollo, Forastero, Trinitario')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="microclimateInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('optimizeAlarmsForm.microclimateInfoLabel', 'Informações do Microclima')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('optimizeAlarmsForm.microclimateInfoPlaceholder', 'Descreva a umidade, ventilação, exposição solar, etc.')} {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="historicalData"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>{t('optimizeAlarmsForm.historicalDataLabel', 'Dados Históricos de Temperatura (JSON)')}</FormLabel>
                      <Button type="button" variant="outline" size="sm" onClick={handleLoadHistoricalData} disabled={isLoadingData}>
                        {isLoadingData ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        Carregar Dados (máx. 900KB)
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea placeholder={t('optimizeAlarmsForm.historicalDataPlaceholder', 'Ex: [{"timestamp": 1672531200000, "temperature": 25.5}, ...]')} {...field} rows={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CardFooter className="px-0 pt-6">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('optimizeAlarmsForm.submittingButton', 'Otimizando...')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {t('optimizeAlarmsForm.submitButton', 'Otimizar Limites de Alarme')}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isSubmitting && (
         <div className="flex justify-center items-center flex-col gap-4 p-8">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-muted-foreground">{t('optimizeAlarmsForm.submittingButton', 'Otimizando...')}</p>
        </div>
      )}

      {result && (
        <Card className="shadow-xl border-primary/50 animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <Lightbulb className="mr-2" />
              {t('optimizationResultCard.title', 'Sugestões de Limites Otimizados')}
            </CardTitle>
            <CardDescription>
              {t('optimizationResultCard.description', 'Com base nos dados fornecidos, a IA recomenda os seguintes limites:')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20">
                <CardDescription className="flex items-center gap-2"><Thermometer className="h-4 w-4"/> {t('optimizationResultCard.highThresholdLabel', 'Limite Superior Sugerido')}</CardDescription>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{result.highThreshold.toFixed(1)}°C</p>
              </Card>
              <Card className="p-4 flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/20">
                <CardDescription className="flex items-center gap-2"><Thermometer className="h-4 w-4"/> {t('optimizationResultCard.lowThresholdLabel', 'Limite Inferior Sugerido')}</CardDescription>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{result.lowThreshold.toFixed(1)}°C</p>
              </Card>
            </div>
            <div>
              <h4 className="font-semibold">{t('optimizationResultCard.explanationLabel', 'Justificativa da IA:')}</h4>
              <p className="text-muted-foreground whitespace-pre-wrap mt-2 p-4 bg-muted/50 rounded-md">{result.explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    