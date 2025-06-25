
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/context/SettingsContext';
import TicTacToe from '@/components/games/TicTacToe';
import { Gamepad2, Users, Coins } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PokerGame from '@/components/games/PokerGame';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function GamesPage() {
  const { authState } = useAuth();
  const router = useRouter();
  const { t } = useSettings();

  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.push('/login');
    }
  }, [authState, router]);
  
  if (authState === 'loading' || authState === 'unauthenticated') {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <Skeleton className="h-9 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
        </div>
        <Skeleton className="h-96 w-full max-w-sm mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center justify-center">
            <Gamepad2 className="mr-3 h-8 w-8" />
            {t('games.pageTitle', 'Jogos Offline')}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          {t('games.pageDescription', 'Relaxe e divirta-se com alguns jogos clássicos.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="text-yellow-500" />
              {t('games.tempCoinInfo.title', 'TempCoins: A Moeda do Jogo')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('games.tempCoinInfo.description', 'TempCoins são a moeda virtual usada nos jogos. Seu saldo pode ser visualizado no seu perfil e é gerenciado por administradores. Em breve, você poderá usá-las para apostar contra outros jogadores!')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="text-primary" />
              {t('games.multiplayerComingSoon.title', 'Multiplayer em Breve!')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('games.multiplayerComingSoon.description', 'No momento, os jogos são contra bots controlados pelo computador. Estamos trabalhando para adicionar a funcionalidade de jogar com outros usuários online no futuro!')}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="poker" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="poker">{t('games.poker.title', 'Pôquer')}</TabsTrigger>
          <TabsTrigger value="tictactoe">{t('games.ticTacToe.title', 'Jogo da Velha')}</TabsTrigger>
        </TabsList>
        <TabsContent value="poker" className="mt-6">
          <PokerGame />
        </TabsContent>
        <TabsContent value="tictactoe" className="mt-6">
          <TicTacToe />
        </TabsContent>
      </Tabs>
      
    </div>
  );
}
