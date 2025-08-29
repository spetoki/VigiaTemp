
"use client";

import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import dynamic from 'next/dynamic';
import { Button } from '../ui/button';
import { Loader2, Usb } from 'lucide-react';

// O `esp-web-tools` é uma biblioteca que interage diretamente com as APIs do navegador (Web Serial).
// Para evitar problemas durante a renderização no servidor do Next.js (SSR), onde `window` e `document` não existem,
// usamos `next/dynamic` com a opção `ssr: false`.
// Isso garante que o componente Flasher só será carregado e renderizado no navegador do cliente.

const Flasher = dynamic(
  () => import('./FlasherComponent').then(mod => mod.FlasherComponent),
  {
    ssr: false,
    loading: () => {
      // Usamos um componente React simples para o estado de carregamento,
      // para evitar que o botão de "Aguarde..." do FlasherComponent seja mostrado prematuramente.
      const { t } = useSettings();
      return (
        <div className="flex flex-col items-center justify-center text-center p-6">
            <Button size="lg" disabled={true}>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('webFlasher.connectButton.loading', 'Aguarde...')}
            </Button>
        </div>
      );
    },
  }
);


export default function WebFlasher() {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center">
        <Flasher />
    </div>
  );
}
