
"use client";

import type { Sensor } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { Wifi, WifiOff } from 'lucide-react';
import React from 'react';
import { Separator } from '../ui/separator';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import type { SensorFormData } from '@/types';

const ipAddressRegex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
const macAddressRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

const supportedSensorModels = [
  'TermoX 5000',
  'AmbientePro II',
  'AgriSense X1',
  'HydroTemp Advanced',
  'ClimaProbe Z',
  'TempGuard Standard',
  'Greenhouse Sentry MK3',
  'totolink ex750',
  'WiFi Generic',
  'Bluetooth Generic',
];

const formSchema = z.object({
  sensorType: z.enum(['grouped', 'individual']).default('individual'),
  name: z.string().optional(),
  greenhouse: z.string().optional(),
  level: z.string().optional(),
  location: z.string().min(1, "A localização é obrigatória"),
  model: z.string().min(1, "O modelo do sensor é obrigatório"),
  ipAddress: z.string().optional().refine(val => !val || ipAddressRegex.test(val), {
    message: "Endereço IP inválido",
  }),
  macAddress: z.string().optional().refine(val => !val || macAddressRegex.test(val), {
    message: "Endereço MAC inválido",
  }),
  lowThreshold: z.number({ coerce: true }).min(-100, "Valor muito baixo").max(200, "Valor muito alto"),
  highThreshold: z.number({ coerce: true }).min(-100, "Valor muito baixo").max(200, "Valor muito alto"),
}).refine(data => data.highThreshold > data.lowThreshold, {
  message: "O limite superior deve ser maior que o limite inferior",
  path: ["highThreshold"],
}).refine(data => {
    if (data.sensorType === 'individual' && (!data.name || data.name.trim() === '')) {
        return false;
    }
    return true;
}, {
    message: "O nome é obrigatório para sensores individuais.",
    path: ["name"],
}).refine(data => {
    if (data.sensorType === 'grouped' && (!data.greenhouse || !data.level)) {
        return false;
    }
    return true;
}, {
    message: "Estufa e Nível são obrigatórios para sensores agrupados.",
    path: ["greenhouse"],
});

export type { SensorFormData };

interface SensorFormProps {
  sensor?: Sensor | null; // For editing
  onSubmit: (data: SensorFormData) => void;
  onCancel: () => void;
}

export default function SensorForm({ sensor, onSubmit, onCancel }: SensorFormProps) {
  const { temperatureUnit, t } = useSettings();
  const { toast } = useToast();
  const [isCheckingConnection, setIsCheckingConnection] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<'online' | 'offline' | null>(null);

  const isGroupedSensor = sensor ? /Estufa_\d+-[BMA]$/.test(sensor.name) : false;
  const initialSensorType = isGroupedSensor ? 'grouped' : 'individual';
  
  let initialGreenhouse = '';
  let initialLevel = '';
  if (isGroupedSensor && sensor) {
    const parts = sensor.name.split('-');
    initialGreenhouse = parts[0].replace('_', ' '); // 'Estufa 1'
    initialLevel = parts[1]; // 'B', 'M', or 'A'
  }

  const defaultValues = sensor
    ? {
        sensorType: initialSensorType,
        name: isGroupedSensor ? '' : sensor.name,
        greenhouse: initialGreenhouse,
        level: initialLevel,
        location: sensor.location,
        model: sensor.model || '',
        ipAddress: sensor.ipAddress || '',
        macAddress: sensor.macAddress || '',
        lowThreshold: sensor.lowThreshold,
        highThreshold: sensor.highThreshold,
      }
    : {
        sensorType: 'individual',
        name: '',
        greenhouse: '',
        level: '',
        location: '',
        model: '',
        ipAddress: '',
        macAddress: '',
        lowThreshold: 20,
        highThreshold: 30,
      };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  const sensorType = form.watch('sensorType');

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    let finalName = data.name;
    if (data.sensorType === 'grouped' && data.greenhouse && data.level) {
        finalName = `${data.greenhouse.replace(' ', '_')}-${data.level}`;
    }
    
    // Ensure finalName is set before submitting
    if (!finalName) {
        toast({
            title: "Nome do Sensor Inválido",
            description: "Não foi possível gerar o nome do sensor. Verifique os campos.",
            variant: "destructive",
        });
        return;
    }

    const submissionData: SensorFormData = {
        ...data,
        name: finalName,
    };
    onSubmit(submissionData);
  };

  const handleCheckConnection = async () => {
    setIsCheckingConnection(true);
    setConnectionStatus(null);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const isOnline = Math.random() > 0.3;
    setConnectionStatus(isOnline ? 'online' : 'offline');
    toast({
      title: t('sensorForm.connectionCheckToast.title', "Verificação de Conexão"),
      description: isOnline 
        ? t('sensorForm.connectionCheckToast.success', "Sensor parece estar online!") 
        : t('sensorForm.connectionCheckToast.fail', "Não foi possível conectar ao sensor."),
      variant: isOnline ? "default" : "destructive",
    });
    setIsCheckingConnection(false);
  };
  
  const greenhouses = Array.from({ length: 10 }, (_, i) => `Estufa ${i + 1}`);
  const levels = [
      { value: 'B', label: 'Sensor 1 – Inferior' },
      { value: 'M', label: 'Sensor 2 – Central' },
      { value: 'A', label: 'Sensor 3 – Superior' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>{sensor ? t('sensorForm.editTitle', 'Editar Sensor') : t('sensorForm.addTitle', 'Adicionar Novo Sensor')}</DialogTitle>
          <DialogDescription>
            {t('sensorForm.addDescription', 'Insira os detalhes para o novo sensor. Os limites estão em °{unit}.', { unit: 'C' })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 md:space-y-6">
            <FormField
              control={form.control}
              name="sensorType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Sensor</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                      disabled={!!sensor}
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="individual" />
                        </FormControl>
                        <FormLabel className="font-normal">Individual / Outro</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="grouped" />
                        </FormControl>
                        <FormLabel className="font-normal">Agrupado por Estufa</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {sensorType === 'individual' ? (
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('sensorForm.nameLabel', 'Nome do Sensor')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('sensorForm.namePlaceholder', "Ex: Sensor da Sala de Secagem")} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="greenhouse"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Estufa</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a Estufa" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {greenhouses.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nível na Estufa</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o Nível" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {levels.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            )}
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('sensorForm.locationLabel', 'Localização')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('sensorForm.locationPlaceholder', "Ex: Próximo à porta Leste")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('sensorForm.modelLabel', 'Modelo do Sensor')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('sensorForm.modelPlaceholder', "Selecione um modelo")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supportedSensorModels.map(modelName => (
                        <SelectItem key={modelName} value={modelName}>
                          {modelName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Para placas físicas como ESP32 ou ESP8266, selecione 'WiFi Generic'.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ipAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('sensorForm.ipAddressLabel', 'Endereço IP (Opcional)')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('sensorForm.placeholder.ip', "Ex: 192.168.1.100")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="macAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('sensorForm.macAddressLabel', 'Endereço MAC')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('sensorForm.placeholder.mac', "Ex: 00:1A:2B:3C:4D:5E")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-2">
              <Label className="text-base font-semibold">{t('sensorForm.thresholdsTitle', 'Limites de Temperatura (°C)')}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="lowThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('sensorForm.lowThresholdLabel', 'Limite Inferior (°C)')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="highThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('sensorForm.highThresholdLabel', 'Limite Superior (°C)')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Separator />

            <div className="pt-2 space-y-2">
              <Label className="text-base font-semibold">{t('sensorForm.connectionTestTitle', 'Teste de Conexão')}</Label>
                <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" onClick={handleCheckConnection} disabled={isCheckingConnection}>
                    {isCheckingConnection ? (
                        <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <Wifi className="mr-2 h-4 w-4" />
                    )}
                    {t('sensorForm.checkConnectionButton', 'Verificar Conexão')}
                    </Button>
                    {connectionStatus === 'online' && <Wifi className="h-5 w-5 text-green-500" />}
                    {connectionStatus === 'offline' && <WifiOff className="h-5 w-5 text-red-500" />}
                </div>
                <FormDescription>
                    {t('sensorForm.checkConnectionDescription', 'Clique para tentar se conectar ao sensor usando os dados fornecidos (simulado).')}
                </FormDescription>
            </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t bg-background">
          <Button type="button" variant="outline" onClick={onCancel}>{t('sensorForm.cancelButton', 'Cancelar')}</Button>
          <Button type="submit">{sensor ? t('sensorForm.saveButton', 'Salvar Alterações') : t('sensorForm.addButton', 'Adicionar Sensor')}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
