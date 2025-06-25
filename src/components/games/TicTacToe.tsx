"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';
import { RefreshCw, User, Bot } from 'lucide-react';

const Square = ({ value, onClick, isWinning }: { value: 'X' | 'O' | null, onClick: () => void, isWinning: boolean }) => (
  <Button
    variant="outline"
    onClick={onClick}
    className={cn(
      "h-20 w-20 md:h-24 md:w-24 text-4xl md:text-5xl font-bold flex items-center justify-center p-0",
      value === 'X' ? 'text-blue-500' : 'text-red-500',
      isWinning ? 'bg-primary/20 border-primary' : ''
    )}
    aria-label={`Square with value ${value || 'empty'}`}
  >
    {value}
  </Button>
);

const calculateWinner = (squares: Array<'X' | 'O' | null>): { winner: 'X' | 'O' | 'Draw' | null, line: number[] | null } => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  if (squares.every(square => square !== null)) {
    return { winner: 'Draw', line: null };
  }
  return { winner: null, line: null };
};

const minimax = (newBoard: Array<'X' | 'O' | null>, player: 'X' | 'O'): { score: number, index?: number } => {
    const human = 'X';
    const ai = 'O';

    const result = calculateWinner(newBoard);
    if (result.winner === human) {
        return { score: -10 };
    } else if (result.winner === ai) {
        return { score: 10 };
    } else if (result.winner === 'Draw') {
        return { score: 0 };
    }

    const moves: { score: number, index: number }[] = [];
    newBoard.forEach((square, index) => {
        if (square === null) {
            const tempBoard = [...newBoard];
            tempBoard[index] = player;
            const g = minimax(tempBoard, player === ai ? human : ai);
            moves.push({ score: g.score, index });
        }
    });

    let bestMoveIndex = -1;
    let bestScore: number;

    if (player === ai) {
        bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMoveIndex = i;
            }
        }
    } else {
        bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMoveIndex = i;
            }
        }
    }

    return moves[bestMoveIndex];
};


export default function TicTacToe() {
  const { t } = useSettings();
  const [board, setBoard] = useState(Array(9).fill(null));
  // 'X' is the human, 'O' is the AI. We alternate who starts.
  const [xStarts, setXStarts] = useState(true); 
  const [isXNext, setIsXNext] = useState(true);
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  const { winner, line: winningLine } = calculateWinner(board);

  const resetGame = useCallback(() => {
    // Decide who starts the next game by toggling the `xStarts` state.
    const newXStarts = !xStarts;
    setXStarts(newXStarts);

    // And then immediately reset the board and set the turn for the new game.
    setBoard(Array(9).fill(null));
    setIsXNext(newXStarts);
    setIsAiThinking(false);
  }, [xStarts]);

  useEffect(() => {
    if (!isXNext && !winner && !isAiThinking) {
        setIsAiThinking(true);
        setTimeout(() => {
            // The bot is almost perfect, but has a small chance to make a random move.
            const mistakeProbability = 0.02; // 2% chance to make a mistake.
            let moveIndex = -1;

            if (Math.random() < mistakeProbability) {
                // --- Mistake Move ---
                const availableMoves: number[] = [];
                board.forEach((square, index) => {
                    if (square === null) availableMoves.push(index);
                });
                if (availableMoves.length > 0) {
                    moveIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
                }
            } else {
                // --- Optimal Move ---
                const bestMove = minimax([...board], 'O');
                if (bestMove && bestMove.index !== undefined) {
                    moveIndex = bestMove.index;
                }
            }
            
            const newBoard = [...board];
            // Apply the chosen move if valid, otherwise pick a random one as a fallback.
            if (moveIndex !== -1 && newBoard[moveIndex] === null) {
                newBoard[moveIndex] = 'O';
            } else {
                 const availableMoves: number[] = [];
                 board.forEach((square, index) => {
                     if (square === null) availableMoves.push(index);
                 });
                 if (availableMoves.length > 0) {
                     const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
                     newBoard[randomMove] = 'O';
                 }
            }
            setBoard(newBoard);
            
            setIsXNext(true);
            setIsAiThinking(false);
        }, 800);
    }
  }, [isXNext, winner, board, isAiThinking]);


  const handleClick = (i: number) => {
    if (winner || board[i] || !isXNext || isAiThinking) {
      return;
    }
    const newBoard = [...board];
    newBoard[i] = 'X';
    setBoard(newBoard);
    setIsXNext(false);
  };

  let status;
  if (winner) {
    if (winner === 'Draw') {
      status = t('games.ticTacToe.draw', 'Empate!');
    } else {
      status = t('games.ticTacToe.winner', 'Vencedor: {winner}', { winner });
    }
  } else {
     status = isXNext ? t('games.ticTacToe.yourTurn', 'Sua vez (X)') : t('games.ticTacToe.aiTurn', 'Vez da IA (O)...');
  }

  return (
    <Card className="w-full max-w-sm mx-auto shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">{t('games.ticTacToe.title', 'Jogo da Velha')}</CardTitle>
        <CardDescription>{t('games.ticTacToe.description', 'Desafie a nossa IA imbatível.')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="grid grid-cols-3 gap-2">
          {board.map((square, i) => (
            <Square key={i} value={square} onClick={() => handleClick(i)} isWinning={winningLine?.includes(i) || false} />
          ))}
        </div>
        <div className="text-lg font-semibold min-h-[28px] flex items-center gap-2">
            {winner === 'X' && <User className="h-5 w-5 text-blue-500" />}
            {winner === 'O' && <Bot className="h-5 w-5 text-red-500" />}
            {status}
        </div>
        <Button onClick={resetGame}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('games.ticTacToe.playAgain', 'Jogar Novamente')}
        </Button>
      </CardContent>
    </Card>
  );
}
