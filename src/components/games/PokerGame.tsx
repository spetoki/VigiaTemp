
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { PokerGameState, PokerPlayer, Card, PlayerAction } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/context/SettingsContext';
import { setupGame, dealCards, evaluateHands, getNextPlayerIndex, advanceToNextStage, checkEndOfBettingRound, getBotAction } from '@/lib/poker';
import { Card as UICard, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Coins, Spade, Heart, Diamond, Club, ChevronsRight, Undo } from 'lucide-react';

const suitIcons: Record<Card['suit'], React.ReactNode> = {
  Spades: <Spade className="h-4 w-4 fill-current" />,
  Hearts: <Heart className="h-4 w-4 text-red-500 fill-current" />,
  Diamonds: <Diamond className="h-4 w-4 text-red-500 fill-current" />,
  Clubs: <Club className="h-4 w-4 fill-current" />,
};

const CardComponent = ({ card, faceUp = false }: { card: Card | null; faceUp?: boolean }) => (
  <div className={`relative flex items-center justify-center w-12 h-16 md:w-16 md:h-24 rounded-lg border-2 shadow-md transition-transform duration-500 ${faceUp ? 'bg-white' : 'bg-red-700 border-red-900'}`}>
    {faceUp && card ? (
      <>
        <span className={`absolute top-1 left-1 text-lg font-bold ${card.suit === 'Hearts' || card.suit === 'Diamonds' ? 'text-red-500' : 'text-black'}`}>{card.rank}</span>
        <div className={`absolute ${card.suit === 'Hearts' || card.suit === 'Diamonds' ? 'text-red-500' : 'text-black'}`}>{suitIcons[card.suit]}</div>
      </>
    ) : (
      <div className="absolute text-primary-foreground">{suitIcons['Spades']}</div>
    )}
  </div>
);

const Player = ({ player, isActive, stage }: { player: PokerPlayer; isActive: boolean; stage: PokerGameState['stage'] }) => (
  <div className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all duration-300 ${isActive ? 'border-primary shadow-lg scale-105' : 'border-border'}`}>
    <Avatar>
      <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person avatar" />
      <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
    </Avatar>
    <span className="font-semibold text-sm mt-1">{player.name}</span>
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Coins className="h-3 w-3 text-yellow-500" /> ${player.chips}
    </div>
    {player.currentBet > 0 && <Badge variant="outline" className="mt-1">Bet: ${player.currentBet}</Badge>}
    <div className="flex gap-2 mt-2">
      <CardComponent card={player.cards[0] || null} faceUp={!player.isBot || stage === 'showdown'} />
      <CardComponent card={player.cards[1] || null} faceUp={!player.isBot || stage === 'showdown'} />
    </div>
    {player.isDealer && <Badge variant="secondary" className="mt-1">Dealer</Badge>}
    {player.status === 'Folded' && <Badge variant="destructive" className="mt-1">Folded</Badge>}
    {player.status === 'All-in' && <Badge variant="outline" className="mt-1 border-yellow-500 text-yellow-500">All-in</Badge>}
  </div>
);

export default function PokerGame() {
  const { t } = useSettings();
  const [gameState, setGameState] = useState<PokerGameState>(() => setupGame());
  const [betAmount, setBetAmount] = useState(20);
  const [isBotTurn, setIsBotTurn] = useState(false);

  const startNewHand = useCallback(() => {
    let newGameState = setupGame(gameState.players, gameState.players.findIndex(p => p.isDealer), gameState.handCount);
    newGameState = dealCards(newGameState);
    setGameState(newGameState);
  }, [gameState.players, gameState.handCount]);

  useEffect(() => {
    startNewHand();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlayerAction = useCallback((action: PlayerAction, amount: number = 0) => {
    setGameState(currentGameState => {
      if (currentGameState.stage === 'showdown') return currentGameState;

      const newState = JSON.parse(JSON.stringify(currentGameState));
      const playerIndex = newState.activePlayerIndex;
      const player = newState.players[playerIndex];

      switch (action) {
        case 'Fold':
          player.status = 'Folded';
          break;
        case 'Check':
          if (player.currentBet < newState.currentBet) return newState;
          break;
        case 'Call':
          const callAmount = newState.currentBet - player.currentBet;
          const amountToCall = Math.min(callAmount, player.chips);
          player.chips -= amountToCall;
          player.currentBet += amountToCall;
          newState.pot += amountToCall;
          if (player.chips === 0) player.status = 'All-in';
          break;
        case 'Bet':
        case 'Raise':
          const isRaise = action === 'Raise';
          const betValue = isRaise ? amount : amount;
          const amountToPutIn = isRaise ? (newState.currentBet - player.currentBet) + betValue : betValue;
          
          if (player.chips < amountToPutIn || amount <= 0) return newState; // Invalid bet
          
          player.chips -= amountToPutIn;
          newState.pot += amountToPutIn;
          player.currentBet += amountToPutIn;
          newState.currentBet = player.currentBet;
          newState.lastRaiserIndex = playerIndex;
          if (player.chips === 0) player.status = 'All-in';
          break;
      }
      
      const activePlayersInHand = newState.players.filter((p: PokerPlayer) => p.status !== 'Folded').length;
      if (activePlayersInHand <= 1) {
         return evaluateHands(newState);
      }

      newState.activePlayerIndex = getNextPlayerIndex(newState.players, playerIndex);
      
      if (checkEndOfBettingRound(newState)) {
          return advanceToNextStage(newState);
      }
      
      return newState;
    });
  }, []);
  
  useEffect(() => {
     if (gameState.stage === 'showdown' || isBotTurn) return;

     const currentPlayer = gameState.players[gameState.activePlayerIndex];
     if (currentPlayer && currentPlayer.isBot) {
         setIsBotTurn(true);
         setTimeout(() => {
             const botAction = getBotAction(gameState, currentPlayer);
             handlePlayerAction(botAction.action, botAction.amount);
             setIsBotTurn(false);
         }, 1500);
     }
  }, [gameState, handlePlayerAction, isBotTurn]);


  const userPlayer = gameState.players.find(p => !p.isBot);
  if (!userPlayer) return null;

  const isPlayerTurn = !isBotTurn && userPlayer.id === gameState.players[gameState.activePlayerIndex].id && gameState.stage !== 'showdown';
  const canCheck = userPlayer.currentBet === gameState.currentBet;

  return (
    <UICard className="w-full max-w-4xl mx-auto shadow-xl p-4">
      <CardContent className="flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold">{t('games.poker.hand', 'Mão {handNumber}', {handNumber: gameState.handCount})}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {gameState.players.filter(p => p.isBot).map(p => <Player key={p.id} player={p} isActive={gameState.activePlayerIndex === gameState.players.indexOf(p)} stage={gameState.stage} />)}
        </div>
        
        <div className="flex flex-col items-center gap-2 my-4 p-4 rounded-lg border w-full">
            <h3 className="font-bold text-lg">{t('games.poker.pot', 'Pot')}: ${gameState.pot}</h3>
            <div className="flex gap-2 h-24">
                {Array(5).fill(null).map((_, i) => (
                    <CardComponent key={i} card={gameState.communityCards[i] || null} faceUp={!!gameState.communityCards[i]} />
                ))}
            </div>
            {gameState.winnerInfo && (
              <div className="text-center font-bold text-primary mt-2">
                  <p>{t('games.poker.winnerIs', '{winnerName} wins with a {handRank}!', { winnerName: gameState.winnerInfo.winners.map(w => w.name).join(', '), handRank: gameState.winnerInfo.hand?.description || t('games.poker.thePot', 'o pote') })}</p>
              </div>
            )}
        </div>

        <div className="flex justify-center w-full">
            <Player player={userPlayer} isActive={gameState.activePlayerIndex === gameState.players.indexOf(userPlayer)} stage={gameState.stage} />
        </div>
        
        <div className="flex flex-col items-center gap-4 mt-4 w-full">
          {gameState.stage === 'showdown' ? (
            <Button onClick={startNewHand}>
                <Undo className="mr-2 h-4 w-4" />
                {t('games.poker.newHand', 'Nova Mão')}
            </Button>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
                <Button variant="destructive" onClick={() => handlePlayerAction('Fold')} disabled={!isPlayerTurn}>{t('games.poker.fold', 'Desistir')}</Button>
                {canCheck ? (
                     <Button variant="secondary" onClick={() => handlePlayerAction('Check')} disabled={!isPlayerTurn}>{t('games.poker.check', 'Passar')}</Button>
                ) : (
                    <Button variant="secondary" onClick={() => handlePlayerAction('Call')} disabled={!isPlayerTurn}>
                        {t('games.poker.call', 'Pagar')} ${gameState.currentBet - userPlayer.currentBet}
                    </Button>
                )}
                <div className="flex items-center gap-2">
                    <Input type="number" value={betAmount} onChange={e => setBetAmount(parseInt(e.target.value) || 0)} className="w-24" disabled={!isPlayerTurn} />
                    <Button onClick={() => handlePlayerAction(gameState.currentBet > 0 ? 'Raise' : 'Bet', betAmount)} disabled={!isPlayerTurn}>
                      {t(gameState.currentBet > 0 ? 'games.poker.raise' : 'games.poker.bet', gameState.currentBet > 0 ? 'Aumentar' : 'Apostar')}
                    </Button>
                </div>
            </div>
          )}
           <div className="text-sm text-muted-foreground mt-2 h-4">
             {isPlayerTurn && t('games.poker.yourTurn', 'Sua Vez')}
             {isBotTurn && t('games.poker.botThinking', 'O bot está pensando...')}
          </div>
        </div>
      </CardContent>
    </UICard>
  );
}

    