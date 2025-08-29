
"use client";

import React, { useEffect } from 'react';
import { Button } from '../ui/button';
import { Usb, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useSettings } from '@/context/SettingsContext';

// Define o tipo para o web component, garantindo que o TypeScript o reconheça.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'esp-web-flasher': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

// Este componente é o responsável por carregar a biblioteca e renderizar o botão.
export function FlasherComponent() {
  const { t } = useSettings();
  
  // Importa a biblioteca `esp-web-tools` dinamicamente no lado do cliente.
  useEffect(() => {
    import('esp-web-tools');
  }, []);

  // Renderiza o componente `esp-web-flasher` real.
  // Os "slots" são pontos de customização fornecidos pela biblioteca `esp-web-tools`.
  return (
    <esp-web-flasher>
      <div slot="manifest">/firmware/manifest.json</div>
      {/* Este `div` é substituído pelo botão "Conectar" */}
      <div slot="activate">
          <Button size="lg">
            <Usb className="mr-2 h-4 w-4" />
            {t('webFlasher.connectButton', 'Conectar')}
          </Button>
      </div>
      {/* Slots para mensagens de erro, caso o navegador não seja compatível */}
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
              <AlertTitle>{t('webFlasher.permissionDenied.title', 'Permissão Negada')}</AlertTitle>
              <AlertDescription>
                 {t('webFlasher.permissionDenied.description', 'Você precisa permitir o acesso à porta serial para continuar. Por favor, recarregue a página e tente novamente.')}
              </AlertDescription>
          </Alert>
      </div>
    </esp-web-flasher>
  );
}
