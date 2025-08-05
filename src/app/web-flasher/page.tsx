
"use client";

import WebFlasher from '@/components/web-flasher/WebFlasher';
import { useSettings } from '@/context/SettingsContext';
import { Usb, AlertTriangle, LifeBuoy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WebFlasherPage() {
  const { t } = useSettings();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <Usb className="mr-3 h-8 w-8" />
          {t('nav.webFlasher', 'Instalador Web')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('webFlasher.description', 'Grave o firmware no seu ESP32 diretamente do seu navegador. Conecte o dispositivo, clique em "Conectar" e siga as instruções.')}
        </p>
      </div>

       <Alert variant="default" className="border-amber-500/50 text-amber-600 bg-amber-500/5">
        <AlertTriangle className="h-4 w-4 !text-amber-600" />
        <AlertTitle>{t('webFlasher.compatibilityTitle', 'Navegadores Compatíveis')}</AlertTitle>
        <AlertDescription>
          {t('webFlasher.compatibilityDescription', 'Esta ferramenta funciona melhor no Google Chrome, Microsoft Edge ou outros navegadores baseados em Chromium. O Firefox e o Safari não são suportados.')}
        </AlertDescription>
      </Alert>

      <div className="border rounded-lg p-4 md:p-6 shadow-sm bg-card">
         <WebFlasher />
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-primary"/>
            Solução de Problemas
          </CardTitle>
          <CardDescription>
            Se o seu dispositivo ESP32 não está sendo reconhecido, siga estes passos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">1. Instale os Drivers Corretos</h3>
            <p className="text-muted-foreground text-sm">
              A maioria dos problemas de conexão acontece porque o driver USB não está instalado. Identifique o chip USB na sua placa ESP32 (geralmente um chip retangular perto do conector USB) e instale o driver correspondente:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li><strong className="font-semibold">Driver CP210x:</strong> Para a maioria das placas ESP32 (NodeMCU, WEMOS, etc.). Baixe em <a href="https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers" target="_blank" rel="noopener noreferrer" className="text-primary underline">Silicon Labs</a>.</li>
              <li><strong className="font-semibold">Driver CH340:</strong> Para placas mais baratas ou clones. Baixe em <a href="https://www.wch-ic.com/downloads/CH341SER_EXE.html" target="_blank" rel="noopener noreferrer" className="text-primary underline">WCH</a>.</li>
            </ul>
             <p className="text-muted-foreground text-sm mt-2">
              Após instalar, reinicie o seu computador e tente novamente.
            </p>
          </div>
           <div>
            <h3 className="font-semibold">2. Verifique o Cabo USB</h3>
            <p className="text-muted-foreground text-sm">
             Certifique-se de que está usando um cabo USB de **dados**, e não apenas um cabo de carregamento. Muitos cabos baratos não possuem os fios necessários para a comunicação. Tente usar um cabo diferente.
            </p>
          </div>
           <div>
            <h3 className="font-semibold">3. Modo de "Boot"</h3>
            <p className="text-muted-foreground text-sm">
              Algumas placas ESP32 precisam ser colocadas em "modo de boot" para serem gravadas. Para fazer isso, segure o botão **BOOT** na placa, conecte o cabo USB, e então solte o botão. Depois, clique em "Conectar".
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
