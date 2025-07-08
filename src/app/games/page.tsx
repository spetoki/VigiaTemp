
"use client";

import React from 'react';
import TicTacToe from '@/components/games/TicTacToe';
import { useSettings } from '@/context/SettingsContext';
import { Gamepad2 } from 'lucide-react';

export default function GamesPage() {
  const { t } = useSettings();

  return (
    <div className="space-y-8 flex flex-col items-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center justify-center">
          <Gamepad2 className="mr-3 h-8 w-8" />
          {t('games.pageTitle', 'Central de Jogos')}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          {t('games.pageDescription', 'Um pequeno easter-egg para relaxar. Desafie a IA no Jogo da Velha!')}
        </p>
      </div>
      
      <TicTacToe />
      
    </div>
  );
}
