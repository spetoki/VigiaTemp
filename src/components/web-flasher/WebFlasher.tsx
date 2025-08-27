
"use client";

import React from 'react';
import { Button } from '../ui/button';
import { Usb, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useSettings } from '@/context/SettingsContext';
import dynamic from 'next/dynamic';

// O `esp-web-tools` é uma biblioteca que interage diretamente com as APIs do navegador (Web Serial).
// Para evitar problemas durante a renderização no servidor do Next.js (SSR), onde `window` e `document` não existem,
// usamos `next/dynamic` com a opção `ssr: false`.
// Isso garante que o componente Flasher só será carregado e renderizado no navegador do cliente.

const Flasher = dynamic(
  () => import('./FlasherComponent').then(mod => mod.FlasherComponent),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Carregando instalador...</p>
      </div>
    ),
  }
);


export default function WebFlasher() {
  const { t } = useSettings();

  return (
    <div className="w-full flex flex-col items-center justify-center text-center">
        <Flasher />
    </div>
  );
}

