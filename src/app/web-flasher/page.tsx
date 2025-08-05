"use client";

import WebFlasher from '@/components/web-flasher/WebFlasher';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Usb, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function WebFlasherPage() {
  const { t } = useSettings();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <Usb className="mr-3 h-8 w-8" />
          {t('nav.webFlasher', 'Instalador Web de Firmware')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('webFlasher.description', 'Grave o firmware no seu ESP32 diretamente do seu navegador. Conecte o dispositivo, clique em "Conectar" e siga as instruções.')}
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('webFlasher.compatibilityTitle', 'Navegadores Compatíveis')}</AlertTitle>
        <AlertDescription>
          {t('webFlasher.compatibilityDescription', 'Esta ferramenta funciona melhor no Google Chrome, Microsoft Edge ou outros navegadores baseados em Chromium. O Firefox e o Safari não são suportados.')}
        </AlertDescription>
      </Alert>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('webFlasher.cardTitle', 'Instalador de Firmware VigiaTemp')}</CardTitle>
          <CardDescription>
            {t('webFlasher.cardDescription', 'Este instalador irá gravar o software necessário no seu ESP32 para se conectar ao VigiaTemp.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WebFlasher />
        </CardContent>
      </Card>
    </div>
  );
}
