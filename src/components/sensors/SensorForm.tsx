
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
import { convertTemperature } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Wifi, WifiOff, Music, Trash } from 'lucide-react';
import React from 'react';
import { Separator } from '../ui/separator';

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

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB
const ACCEPTED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/x-m4a"];

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
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
  criticalAlertSound: z.any()
    .refine((file) => !file || (file instanceof File && file.size <= MAX_FILE_SIZE), `O tamanho máximo do arquivo é de 1GB.`)
    .refine((file) => !file || (file instanceof File && ACCEPTED_AUDIO_TYPES.includes(file.type)), "Apenas formatos .mp3, .wav, .ogg e .m4a são suportados.")
    .optional(),
}).refine(data => data.highThreshold > data.lowThreshold, {
  message: "O limite superior deve ser maior que o limite inferior",
  path: ["highThreshold"],
}).refine(data => {
    // Make macAddress required if model is 'WiFi Generic'
    if (data.model === 'WiFi Generic' && (!data.macAddress || data.macAddress.trim() === '')) {
      return false;
    }
    return true;
}, {
    message: "O endereço MAC é obrigatório para sensores do tipo WiFi.",
    path: ["macAddress"],
});


export type SensorFormData = Omit<z.infer<typeof formSchema>, 'criticalAlertSound'> & {
    criticalAlertSound?: string; // Store as base64 string
};

interface SensorFormProps {
  sensor?: Sensor | null; // For editing
  onSubmit: (data: SensorFormData) => void;
  onCancel: () => void;
}

// Helper function to convert file to Base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};


export default function SensorForm({ sensor, onSubmit, onCancel }: SensorFormProps) {
  const { temperatureUnit, t } = useSettings();
  const { toast } = useToast();
  const [isCheckingConnection, setIsCheckingConnection] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<'online' | 'offline' | null>(null);


  const defaultValues = sensor
    ? {
        name: sensor.name,
        location: sensor.location,
        model: sensor.model || '',
        ipAddress: sensor.ipAddress || '',
        macAddress: sensor.macAddress || '',
        lowThreshold: parseFloat(convertTemperature(sensor.lowThreshold, temperatureUnit).toFixed(1)),
        highThreshold: parseFloat(convertTemperature(sensor.highThreshold, temperatureUnit).toFixed(1)),
        criticalAlertSound: undefined, // Don't pre-fill file input
      }
    : {
        name: '',
        location: '',
        model: '',
        ipAddress: '',
        macAddress: '',
        lowThreshold: temperatureUnit === 'C' ? 20 : 68,
        highThreshold: temperatureUnit === 'C' ? 30 : 86,
        criticalAlertSound: undefined,
      };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  const [soundPreview, setSoundPreview] = React.useState<string | undefined>(sensor?.criticalAlertSound);

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    let soundAsBase64: string | undefined = soundPreview; // Keep existing sound if not changed

    if (data.criticalAlertSound instanceof File) {
        soundAsBase64 = await fileToBase64(data.criticalAlertSound);
    } else if (data.criticalAlertSound === undefined) {
        // This means the "Clear" button was pressed
        soundAsBase64 = undefined;
    }

    const finalData = {
      name: data.name,
      location: data.location,
      model: data.model,
      ipAddress: data.ipAddress,
      macAddress: data.macAddress,
      lowThreshold: parseFloat(convertTemperature(data.lowThreshold, 'C', temperatureUnit).toFixed(1)),
      highThreshold: parseFloat(convertTemperature(data.highThreshold, 'C', temperatureUnit).toFixed(1)),
      criticalAlertSound: soundAsBase64,
    };
    onSubmit(finalData);
  };

  const handleCheckConnection = async () => {
    setIsCheckingConnection(true);
    setConnectionStatus(null);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    const isOnline = Math.random() > 0.3; // Simulate success rate
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>{sensor ? t('sensorForm.editTitle', 'Editar Sensor') : t('sensorForm.addTitle', 'Adicionar Novo Sensor')}</DialogTitle>
          <DialogDescription>
            {sensor 
              ? t('sensorForm.editDescription', 'Atualize os detalhes deste sensor. Os limites estão em °{unit}.', { unit: temperatureUnit })
              : t('sensorForm.addDescription', 'Insira os detalhes para o novo sensor. Os limites estão em °{unit}.', { unit: temperatureUnit })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 md:space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('sensorForm.nameLabel', 'Nome do Sensor')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('sensorForm.namePlaceholder', "Ex: Estufa Alpha - Zona 1")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('sensorForm.locationLabel', 'Localização')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('sensorForm.locationPlaceholder', "Ex: Canto Nordeste")} {...field} />
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
                    {t('sensorForm.modelDescription', 'Especifique o modelo ou tipo do sensor.')}
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
                    <FormLabel>{t('sensorForm.macAddressLabel', 'Endereço MAC (Opcional)')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('sensorForm.placeholder.mac', "Ex: 00:1A:2B:3C:4D:5E")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-2">
              <Label className="text-base font-semibold">{t('sensorForm.thresholdsTitle', 'Limites de Temperatura')}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="lowThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('sensorForm.lowThresholdLabel', 'Limite Inferior (°{unit})', { unit: temperatureUnit })}</FormLabel>
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
                      <FormLabel>{t('sensorForm.highThresholdLabel', 'Limite Superior (°{unit})', { unit: temperatureUnit })}</FormLabel>
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
            
            <div className="space-y-2">
              <Label className="text-base font-semibold">{t('sensorForm.alertSoundsTitle', 'Sons de Alerta')}</Label>
              <FormField
                control={form.control}
                name="criticalAlertSound"
                render={({ field: { onChange, ...fieldRest } }) => (
                  <FormItem>
                    <FormLabel>{t('sensorForm.criticalAlertSoundLabel', 'Som de Alerta Crítico (Opcional)')}</FormLabel>
                     <FormControl>
                        <Input
                          type="file"
                          accept={ACCEPTED_AUDIO_TYPES.join(',')}
                          className="text-sm"
                          {...fieldRest}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            onChange(file); // Update react-hook-form state
                            setSoundPreview(file ? URL.createObjectURL(file) : undefined);
                          }}
                        />
                    </FormControl>
                    {soundPreview && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                            <Music className="h-4 w-4 text-green-600" />
                            <span>{t('sensorForm.customSoundLoaded', 'Som customizado carregado.')}</span>
                            <Button variant="ghost" size="sm" type="button" onClick={() => {
                                form.setValue('criticalAlertSound', undefined, { shouldValidate: true });
                                setSoundPreview(undefined);
                                const fileInput = document.getElementById('criticalAlertSound') as HTMLInputElement;
                                if(fileInput) fileInput.value = "";
                            }} className="text-destructive hover:text-destructive">
                              <Trash className="mr-1 h-4 w-4" />
                              {t('sensorForm.clearButton', 'Limpar')}
                            </Button>
                        </div>
                    )}
                    <FormDescription>
                      {t('sensorForm.criticalAlertSoundDescription', 'Carregue um arquivo de áudio (MP3, WAV, OGG, M4A) de até 1GB.')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
