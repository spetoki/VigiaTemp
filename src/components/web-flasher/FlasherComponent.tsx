
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Usb, AlertCircle, Loader2 } from 'lucide-react';
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
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Usamos uma ref para evitar que a importação seja chamada múltiplas vezes.
  const flasherScriptLoaded = useRef(false);

  useEffect(() => {
    // Só executa no navegador e apenas uma vez.
    if (typeof window === 'undefined' || flasherScriptLoaded.current) return;

    const loadScript = async () => {
      try {
        await import('esp-web-tools');
        // `whenDefined` retorna uma promessa que resolve quando o custom element está registrado.
        // Isso garante que o componente está 100% pronto antes de tentarmos usá-lo.
        await customElements.whenDefined('esp-web-flasher');
        setIsReady(true);
      } catch (err) {
        console.error("Failed to load esp-web-tools:", err);
        setError("Não foi possível carregar a ferramenta de gravação. Verifique sua conexão ou recarregue a página.");
      }
    };

    loadScript();
    flasherScriptLoaded.current = true;
  }, []);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao Carregar Ferramenta</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Se a biblioteca ainda não estiver pronta, mostramos um botão de "Aguarde..." genérico
  if (!isReady) {
     return (
        <Button size="lg" disabled={true}>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('webFlasher.connectButton.loading', 'Aguarde...')}
        </Button>
     )
  }

  // Renderiza o componente `esp-web-flasher` real apenas quando estiver 100% pronto.
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
      <div slot="provision">
          <Button size="lg" variant="outline">
            {t('webFlasher.provisionButton', 'Provisionar')}
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
