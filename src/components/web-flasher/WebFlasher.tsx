
"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Usb, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useSettings } from '@/context/SettingsContext';

// Declare the type for the web component for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'esp-web-flasher': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
          manifest?: string;
          overrides?: string;
      };
    }
  }
}

export default function WebFlasher() {
  const { t } = useSettings();
  
  const [flasherState, setFlasherState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const initializeFlasher = async () => {
      if (typeof window === 'undefined') return;
      try {
        await import('esp-web-tools');
        await customElements.whenDefined('esp-web-flasher');
        setFlasherState('ready');
      } catch (error) {
        console.error("Failed to load or initialize esp-web-tools:", error);
        setFlasherState('error');
      }
    };
    
    initializeFlasher();
  }, []); 

  if (flasherState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Carregando instalador...</p>
      </div>
    );
  }

  if (flasherState === 'error') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao Carregar Ferramenta</AlertTitle>
        <AlertDescription>
          Não foi possível carregar o instalador web. Verifique sua conexão com a internet ou tente recarregar a página.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center text-center">
      <esp-web-flasher manifest="/firmware/manifest.json">
        <div slot="activate">
            <Button size="lg">
                <Usb className="mr-2 h-4 w-4" />
                {t('webFlasher.connectButton', 'Conectar')}
            </Button>
        </div>
        <Button slot="provision" size="lg" variant="outline">
            Provisionar
        </Button>
        <div slot="unsupported">
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('webFlasher.compatibilityTitle', 'Navegador não suportado')}</AlertTitle>
                <AlertDescription>
                   {t('webFlasher.compatibilityDescription', 'Seu navegador não suporta a Web Serial API. Por favor, use Google Chrome ou Microsoft Edge em um computador.')}
                </AlertDescription>
            </Alert>
        </div>
        <div slot="not-allowed">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('lockScreen.error.incorrectKey', 'Permissão Negada')}</AlertTitle>
                <AlertDescription>
                   {t('traceability.qrCodeErrorDescription', 'Você precisa permitir o acesso à porta serial para continuar. Por favor, recarregue a página e tente novamente.')}
                </AlertDescription>
            </Alert>
        </div>
      </esp-web-flasher>
    </div>
  );
}
