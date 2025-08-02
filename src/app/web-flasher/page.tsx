
"use client";
import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Chip, Usb, Info, UploadCloud, Rocket } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// A interface ESP-Web-Tools não tem tipos TypeScript oficiais, então usaremos 'any'.
// Mover a declaração de tipos e a variável para dentro do componente evita conflitos globais.
let espWebTool: any;

export default function WebFlasherPage() {
  const { t } = useSettings();
  const [isFlashing, setIsFlashing] = useState(false);
  const [status, setStatus] = useState(t('webFlasher.status.awaiting', 'Aguardando...'));
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const manifestUrl = 'https://raw.githubusercontent.com/irineubartnik/vigia-temp-firmware/main/esp32-manifest.json';

  const handleConnect = async () => {
    setError(null);
    if (typeof window === 'undefined' || !window.navigator.serial) {
      setError(t('webFlasher.error.noWebSerial', 'Seu navegador não suporta a Web Serial API. Use o Google Chrome ou Microsoft Edge em um computador.'));
      return;
    }
    
    // Importa dinamicamente a biblioteca quando o usuário clica em conectar
    if (!espWebTool) {
      try {
        const espWebToolsModule = await import('esp-web-tools');
        // @ts-ignore
        espWebTool = new espWebToolsModule.ESPLoader(window.navigator.serial, {
            log: (...args: any[]) => console.log(...args),
            debug: (...args: any[]) => console.debug(...args),
            error: (...args: any[]) => console.error(...args),
        });
      } catch (e) {
          console.error("Failed to load esp-web-tools", e);
          setError("Could not load the ESP Web Tools library.");
          return;
      }
    }

    try {
      await espWebTool.connect();
      setIsConnected(true);
      setStatus(t('webFlasher.status.connected', 'Placa conectada! Chip: {chipFamily}', { chipFamily: espWebTool.chipFamily }));
    } catch (err: any) {
      console.error(err);
      setError(t('webFlasher.error.connectionFailed', 'Falha ao conectar: {message}', { message: err.message }));
    }
  };

  const handleFlash = async () => {
    if (!isConnected) {
      setError(t('webFlasher.error.notConnected', 'Placa não conectada. Conecte primeiro.'));
      return;
    }
    setIsFlashing(true);
    setError(null);
    setStatus(t('webFlasher.status.starting', 'Iniciando gravação...'));
    setProgress(0);
    try {
      await espWebTool.flash(manifestUrl, (bytesWritten: number, totalBytes: number) => {
        const percentage = Math.round((bytesWritten / totalBytes) * 100);
        setProgress(percentage);
        setStatus(t('webFlasher.status.writing', 'Gravando... {percentage}%', { percentage }));
      });
      setStatus(t('webFlasher.status.done', 'Gravação concluída com sucesso! A placa será reiniciada.'));
    } catch (err: any) {
      console.error(err);
      setError(t('webFlasher.error.flashFailed', 'Falha na gravação: {message}', { message: err.message }));
      setStatus(t('webFlasher.status.error', 'Erro na gravação.'));
    } finally {
      setIsFlashing(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <Chip className="mr-3 h-8 w-8" />
          {t('webFlasher.title', 'Gravador Web para ESP32')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('webFlasher.description', 'Grave o firmware do VigiaTemp diretamente na sua placa ESP32, sem precisar da Arduino IDE ou outros programas.')}
        </p>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>{t('webFlasher.info.title', 'Como Funciona?')}</AlertTitle>
        <AlertDescription>
          <ol className="list-decimal list-inside space-y-1">
            <li>{t('webFlasher.info.step1', 'Conecte sua placa ESP32 ao computador via cabo USB.')}</li>
            <li>{t('webFlasher.info.step2', 'Clique em "Conectar" e selecione a porta serial correta (ex: COM3, /dev/ttyUSB0).')}</li>
            <li>{t('webFlasher.info.step3', 'Após conectar, clique em "Gravar Firmware".')}</li>
            <li>{t('webFlasher.info.step4', 'Aguarde o processo terminar. A placa será reiniciada automaticamente.')}</li>
          </ol>
        </AlertDescription>
      </Alert>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>{t('webFlasher.card.title', 'Painel de Gravação')}</CardTitle>
          <CardDescription>{t('webFlasher.card.description', 'Firmware oficial do VigiaTemp com WiFiManager.')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleConnect} disabled={isConnected || isFlashing} className="flex-1" size="lg">
              <Usb className="mr-2" />
              {isConnected ? t('webFlasher.button.connected', 'Conectado') : t('webFlasher.button.connect', '1. Conectar')}
            </Button>
            <Button onClick={handleFlash} disabled={!isConnected || isFlashing} className="flex-1 bg-green-600 hover:bg-green-700" size="lg">
              {isFlashing ? <UploadCloud className="mr-2 animate-bounce" /> : <Rocket className="mr-2" />}
              {isFlashing ? t('webFlasher.button.flashing', 'Gravando...') : t('webFlasher.button.flash', '2. Gravar Firmware')}
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertTitle>{t('webFlasher.error.title', 'Ocorreu um Erro')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <div className="w-full text-center">
            <p className="text-sm font-medium text-muted-foreground">{t('webFlasher.status.label', 'Status')}</p>
            <p className={cn("font-bold", error && "text-destructive")}>{status}</p>
          </div>
          <Progress value={progress} className={cn(isFlashing && "animate-pulse")} />
        </CardFooter>
      </Card>
    </div>
  );
}
