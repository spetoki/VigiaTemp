
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Loader2, Usb, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useSettings } from '@/context/SettingsContext';

// Este componente agora lida com o carregamento e a montagem manual do web component.
export function FlasherComponent() {
  const { t } = useSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Esta função será executada apenas no cliente.
    const loadAndMountFlasher = async () => {
      try {
        // Importa a biblioteca.
        await import('esp-web-tools');
        
        // Espera até que o navegador confirme que o componente está pronto.
        await customElements.whenDefined('esp-web-flasher');

        // Se o contêiner existe e ainda não foi preenchido.
        if (containerRef.current && containerRef.current.childElementCount === 0) {
          // Cria o elemento flasher manualmente.
          const flasher = document.createElement('esp-web-flasher');
          
          // Cria os slots para o manifesto e botões
          const manifestDiv = document.createElement('div');
          manifestDiv.slot = 'manifest';
          manifestDiv.textContent = '/firmware/manifest.json';

          const activateButton = document.createElement('button');
          activateButton.slot = 'activate';
          activateButton.className = 'custom-flasher-button'; // Usamos uma classe para estilizar
          activateButton.innerHTML = `<span class="lucide-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-usb"><path d="M12 19v-4"/><path d="M10 11v-2a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v2"/><path d="M7 11v-2a5 5 0 0 1 10 0v2"/><path d="M12 19h-4a4 4 0 0 1 0-8h8a4 4 0 0 1 0 8h-4Z"/></svg></span> ${t('webFlasher.connectButton', 'Conectar')}`;

          const unsupportedDiv = document.createElement('div');
          unsupportedDiv.slot = 'unsupported';
          unsupportedDiv.innerHTML = `<div class="custom-alert destructive"><strong>${t('webFlasher.compatibilityTitle', 'Navegador não suportado')}:</strong> ${t('webFlasher.compatibilityDescription', 'Seu navegador não suporta a Web Serial API. Por favor, use Google Chrome ou Microsoft Edge em um computador.')}</div>`;

          const notAllowedDiv = document.createElement('div');
          notAllowedDiv.slot = 'not-allowed';
          notAllowedDiv.innerHTML = `<div class="custom-alert destructive"><strong>${t('webFlasher.permissionDenied.title', 'Permissão Negada')}:</strong> ${t('webFlasher.permissionDenied.description', 'Você precisa permitir o acesso à porta serial para continuar. Por favor, recarregue a página e tente novamente.')}</div>`;

          // Adiciona os slots ao componente flasher
          flasher.appendChild(manifestDiv);
          flasher.appendChild(activateButton);
          flasher.appendChild(unsupportedDiv);
          flasher.appendChild(notAllowedDiv);

          // Adiciona o componente flasher totalmente configurado ao DOM.
          containerRef.current.appendChild(flasher);
        }

        setIsReady(true);
      } catch (err) {
        console.error("Failed to load esp-web-tools:", err);
        setError("Não foi possível carregar o componente de instalação.");
      }
    };

    loadAndMountFlasher();
  }, [t]);

  if (error) {
    return (
       <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro Crítico</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <style>
        {`
          .custom-flasher-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            white-space: nowrap;
            border-radius: 0.375rem;
            font-size: 1rem;
            font-weight: 500;
            height: 2.75rem;
            padding: 0.5rem 2rem;
            background-color: hsl(var(--primary));
            color: hsl(var(--primary-foreground));
            transition: background-color 0.2s;
          }
          .custom-flasher-button:hover {
            background-color: hsl(var(--primary) / 0.9);
          }
          .custom-flasher-button .lucide-icon {
            margin-right: 0.5rem;
            width: 1rem;
            height: 1rem;
          }
          .custom-alert {
            position: relative;
            width: 100%;
            border-radius: 0.5rem;
            border: 1px solid;
            padding: 1rem;
            padding-left: 2.5rem;
          }
          .custom-alert.destructive {
            border-color: hsl(var(--destructive) / 0.5);
            color: hsl(var(--destructive));
          }
        `}
      </style>
      <div ref={containerRef} style={{ display: isReady ? 'block' : 'none' }}>
        {/* O Web Component será injetado aqui */}
      </div>
      {!isReady && (
        <Button size="lg" disabled={true}>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('webFlasher.connectButton.loading', 'Aguarde...')}
        </Button>
      )}
    </>
  );
}
