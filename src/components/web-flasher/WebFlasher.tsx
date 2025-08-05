
"use client";

import React, { useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Usb, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

// This component uses the <esp-web-flasher> web component.
// We need to declare its type for TypeScript to recognize it in JSX.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'esp-web-flasher': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
          manifest: string;
      };
    }
  }
}

export default function WebFlasher() {
  const flasherRef = useRef<HTMLElement>(null);
  const [isClient, setIsClient] = React.useState(false);

  useEffect(() => {
    // This ensures the component only renders on the client
    setIsClient(true);

    const importAndInitializeFlasher = async () => {
      try {
        await import('esp-web-tools');
        await customElements.whenDefined('esp-web-flasher');
        
        if (flasherRef.current) {
            // Set the manifest path. This tells the component where to find firmware info.
            (flasherRef.current as any).manifest = "/firmware/manifest.json";
        }
      } catch (error) {
        console.error("Failed to load or initialize esp-web-tools:", error);
      }
    };
    
    importAndInitializeFlasher();
  }, []);

  if (!isClient) {
    // Render nothing on the server
    return null;
  }

  return (
    // The web component's initial state might not have visible content until the manifest loads.
    // We provide content for its "slots" to define what the UI looks like.
    <div className="min-h-[250px] flex flex-col items-center justify-center text-center">
      <esp-web-flasher ref={flasherRef}>
        {/* This slot is used for the main action button */}
        <div slot="activate">
            <Button size="lg">
                <Usb />
                Conectar
            </Button>
        </div>

        {/* This slot is shown if the browser doesn't support Web Serial */}
        <div slot="unsupported">
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Navegador não suportado</AlertTitle>
                <AlertDescription>
                    Seu navegador não suporta a Web Serial API. Por favor, use Google Chrome ou Microsoft Edge em um computador.
                </AlertDescription>
            </Alert>
        </div>

        {/* This slot is shown if the user denies access to the serial port */}
        <div slot="not-allowed">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Permissão Negada</AlertTitle>
                <AlertDescription>
                   Você precisa permitir o acesso à porta serial para continuar. Por favor, recarregue a página e tente novamente.
                </AlertDescription>
            </Alert>
        </div>
      </esp-web-flasher>
    </div>
  );
}
