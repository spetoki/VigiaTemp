
"use client";

import React from 'react';
import { FlasherComponent } from './FlasherComponent';

// Este componente agora serve apenas como um invólucro para o FlasherComponent.
// A lógica de carregamento dinâmico foi movida para dentro do FlasherComponent
// para um controle mais refinado.
export default function WebFlasher() {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center">
        <FlasherComponent />
    </div>
  );
}
