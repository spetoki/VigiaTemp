
"use client";

import React, { useEffect, useRef, useState } from 'react';
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
      };
    }
  }
}

export default function WebFlasher() {
  const flasherRef = useRef<HTMLElement>(null);
  const { t } = useSettings();
  
  // State to manage the loading and initialization of the web component
  const [flasherState, setFlasherState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    // This function will handle the dynamic import and initialization
    const initializeFlasher = async () => {
      try {
        // Dynamically import the library only on the client side
        await import('esp-web-tools');
        
        // Wait until the custom element is actually defined in the browser
        await customElements.whenDefined('esp-web-flasher');

        // Once defined, set the component as ready to be rendered
        setFlasherState('ready');

      } catch (error) => {
        console.error("Failed to load or initialize esp-web-tools:", error);
        setFlasherState('error');
      }
    };
    
    // Run the initialization
    initializeFlasher();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to configure the flasher once it's ready and rendered
  useEffect(() => {
    if (flasherState === 'ready' && flasherRef.current) {
        // Now it's safe to set the manifest attribute
        (flasherRef.current as any).manifest = "/firmware/manifest.json";
    }
  }, [flasherState]);

  // Render loading state
  if (flasherState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Carregando instalador...</p>
      </div>
    );
  }

  // Render error state
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

  // Render the flasher component once it's ready
  return (
    <div className="w-full flex flex-col items-center justify-center text-center">
      <esp-web-flasher ref={flasherRef}>
        <div slot="activate">
            <Button size="lg">
                <Usb className="mr-2 h-4 w-4" />
                {t('webFlasher.connectButton', 'Conectar')}
            </Button>
        </div>
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
