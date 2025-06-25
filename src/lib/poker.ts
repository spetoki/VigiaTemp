
import type { Suit, Rank, Card, PokerPlayer, PokerGameState, EvaluatedHand, HandRank, PlayerAction } from '@/types';

export const initialPlayerNames = ["User", "Alice", "Bob", "Charlie"]; // 4 players total

const SUITS: Suit[] = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES: { [key in Rank]: number } = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };

const createDeck = (): Card[] => {
  return SUITS.flatMap(suit => RANKS.map(rank => ({ suit, rank })));
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getNextPlayerIndex = (players: PokerPlayer[], currentIndex: number): number => {
  let nextIndex = (currentIndex + 1) % players.length;
  let guard = 0;
  // A player can act if they are 'Playing' and have chips. All-in players cannot act.
  while (players[nextIndex].status !== 'Playing') {
    nextIndex = (nextIndex + 1) % players.length;
    guard++;
    if (guard > players.length * 2) return currentIndex; // Prevent infinite loop
  }
  return nextIndex;
};


export function setupGame(existingPlayers?: PokerPlayer[], lastDealerIndex = -1, handCount = 0): PokerGameState {
  let players: PokerPlayer[];
    const smallBlind = 5;
    const bigBlind = 10;

  if (existingPlayers && existingPlayers.length > 0) {
      players = existingPlayers.map(p => ({
          ...p,
          cards: [],
          currentBet: 0,
          status: p.chips > 0 ? 'Playing' : 'Sat Out',
          hand: undefined,
          isDealer: false,
      })).filter(p => p.status !== 'Sat Out');
  } else {
      players = initialPlayerNames.map((name, index) => ({
          id: name === "User" ? 'user' : `bot-${index}`,
          name: name,
          isBot: name !== "User",
          chips: 1000,
          cards: [],
          currentBet: 0,
          status: 'Playing',
          isDealer: false,
      }));
  }
  
  const dealerIndex = (lastDealerIndex + 1) % players.length;
  players[dealerIndex].isDealer = true;
  
  const smallBlindIndex = getNextPlayerIndex(players, dealerIndex);
  players[smallBlindIndex].chips -= smallBlind;
  players[smallBlindIndex].currentBet = smallBlind;
  
  const bigBlindIndex = getNextPlayerIndex(players, smallBlindIndex);
  players[bigBlindIndex].chips -= bigBlind;
  players[bigBlindIndex].currentBet = bigBlind;
  
  const pot = smallBlind + bigBlind;
  const activePlayerIndex = getNextPlayerIndex(players, bigBlindIndex);

  return {
    players,
    deck: [],
    communityCards: [],
    stage: 'pre-deal',
    pot,
    currentBet: bigBlind,
    activePlayerIndex,
    lastRaiserIndex: bigBlindIndex,
    winnerInfo: null,
    log: [`New hand (#${handCount + 1}). ${players[dealerIndex].name} is the dealer.`],
    handCount: handCount + 1,
  };
}

export const dealCards = (initialState: PokerGameState): PokerGameState => {
  const newState = JSON.parse(JSON.stringify(initialState));
  let deck = shuffleDeck(createDeck());
  const players: PokerPlayer[] = newState.players.map((p: PokerPlayer) => ({...p, cards: []}));

  // Fair deal for everyone
  players.forEach((player) => {
    if (player.status === 'Playing') {
      if (deck.length >= 2) {
        player.cards.push(deck.pop()!, deck.pop()!);
      }
    }
  });
  
  newState.players = players;
  newState.deck = deck;
  newState.stage = 'pre-flop';
  return newState;
};


const getCombinations = (arr: Card[], size: number): Card[][] => {
    const result: Card[][] = [];
    const f = (prefix: Card[], arr: Card[]) => {
        if (prefix.length === size) {
            result.push(prefix);
            return;
        }
        for (let i = 0; i < arr.length; i++) {
            f([...prefix, arr[i]], arr.slice(i + 1));
        }
    };
    f([], arr);
    return result;
};

const evaluateFiveCardHand = (hand: Card[]): EvaluatedHand => {
    const sortedHand = [...hand].sort((a, b) => RANK_VALUES[a.rank] - RANK_VALUES[b.rank]);
    const ranks = sortedHand.map(c => c.rank);
    const uniqueRanks = [...new Set(ranks)];
    const suits = sortedHand.map(c => c.suit);
    const isFlush = new Set(suits).size === 1;
    
    // Ace-low straight check
    const isWheel = uniqueRanks.length === 5 && uniqueRanks.map(r => RANK_VALUES[r]).sort((a,b) => a-b).join(',') === '2,3,4,5,14';
    const isStraight = (uniqueRanks.length === 5 && (RANK_VALUES[ranks[4]] - RANK_VALUES[ranks[0]] === 4)) || isWheel;

    const rankCounts: { [key: string]: number } = {};
    ranks.forEach(r => rankCounts[r] = (rankCounts[r] || 0) + 1);
    const counts = Object.values(rankCounts).sort((a, b) => b - a);

    let rank: HandRank = 'High Card';
    let description = 'High Card';
    
    if (isStraight && isFlush) {
      rank = (ranks.includes('A') && ranks.includes('K')) ? 'Royal Flush' : 'Straight Flush';
      description = rank + " " + (isWheel ? '5-high' : `${ranks[4]}-high`);
    } else if (counts[0] === 4) {
      rank = 'Four of a Kind';
      description = rank;
    } else if (counts[0] === 3 && counts[1] === 2) {
      rank = 'Full House';
      description = rank;
    } else if (isFlush) {
      rank = 'Flush';
      description = rank + " " + `${ranks[ranks.length-1]}-high`;
    } else if (isStraight) {
      rank = 'Straight';
      description = rank + " " + (isWheel ? '5-high' : `${ranks[4]}-high`);
    } else if (counts[0] === 3) {
      rank = 'Three of a Kind';
      description = rank;
    } else if (counts[0] === 2 && counts[1] === 2) {
      rank = 'Two Pair';
      description = rank;
    } else if (counts[0] === 2) {
      rank = 'Pair';
      description = rank;
    }
    
    const rankOrder = ['High Card', 'Pair', 'Two Pair', 'Three of a Kind', 'Straight', 'Flush', 'Full House', 'Four of a Kind', 'Straight Flush', 'Royal Flush'];
    let value = rankOrder.indexOf(rank) * 1e10;
    
    const sortedCounts = Object.entries(rankCounts).sort(([rankA, countA], [rankB, countB]) => {
      if (countA !== countB) return countB - countA;
      return RANK_VALUES[rankB as Rank] - RANK_VALUES[rankA as Rank];
    });

    let i = 0;
    for (const [r] of sortedCounts) {
      value += RANK_VALUES[r as Rank] * (100 ** (4 - i));
      i++;
    }

    return { rank, value, description, cards: sortedHand };
};

export const evaluateHands = (state: PokerGameState): PokerGameState => {
    const playersInHand = state.players.filter(p => p.status !== 'Folded');
    if (playersInHand.length === 0) return state;

    let bestHand: EvaluatedHand | null = null;
    let winners: PokerPlayer[] = [];

    playersInHand.forEach(player => {
        const allCards = [...player.cards, ...state.communityCards];
        if (allCards.length < 5) return;
        
        const combinations = getCombinations(allCards, 5);
        let playerBestHand: EvaluatedHand | null = null;

        combinations.forEach(combo => {
            const evaluated = evaluateFiveCardHand(combo);
            if (!playerBestHand || evaluated.value > playerBestHand.value) {
                playerBestHand = evaluated;
            }
        });

        player.hand = playerBestHand!;
        
        if (!bestHand || (playerBestHand && playerBestHand.value > bestHand.value)) {
            bestHand = playerBestHand;
            winners = [player];
        } else if (bestHand && playerBestHand && playerBestHand.value === bestHand.value) {
            winners.push(player);
        }
    });

    const potPerWinner = state.pot / winners.length;
    const finalPlayers = state.players.map(p => {
        const isWinner = winners.some(w => w.id === p.id);
        if (isWinner) {
            return { ...p, chips: Math.round(p.chips + potPerWinner) };
        }
        return p;
    });

    return { ...state, players: finalPlayers, winnerInfo: { winners, hand: bestHand }, pot: 0, stage: 'showdown' };
};

export const checkEndOfBettingRound = (state: PokerGameState): boolean => {
    const playersInHand = state.players.filter(p => p.status !== 'Folded');
    // If only one player is left, round is over.
    if (playersInHand.length <= 1) return true;

    // Players who can still act (not folded, not all-in)
    const playersWhoCanAct = playersInHand.filter(p => p.status === 'Playing');
    // If fewer than 2 players can bet, round is over.
    if (playersWhoCanAct.length < 2) return true;

    // Check if everyone who can act has acted on the last raise.
    const allMatched = playersWhoCanAct.every(p => p.currentBet === state.currentBet);
    const isActionOnRaiser = state.activePlayerIndex === state.lastRaiserIndex;

    return allMatched && isActionOnRaiser;
};

export const advanceToNextStage = (state: PokerGameState): PokerGameState => {
  let newState = JSON.parse(JSON.stringify(state));
  
  const playersWhoCanAct = newState.players.filter((p: PokerPlayer) => p.status === 'Playing' && p.chips > 0);
  
  if (playersWhoCanAct.length < 2 && newState.stage !== 'pre-flop') {
      while(newState.communityCards.length < 5) {
          if (newState.deck.length > 0) newState.communityCards.push(newState.deck.pop()!);
          else break;
      }
      newState.stage = 'river';
      return evaluateHands(newState);
  }

  if (newState.stage === 'river') {
    return evaluateHands(newState);
  }

  newState.players.forEach((p: PokerPlayer) => { p.currentBet = 0; });
  
  const stageTransitions = {
    'pre-flop': { nextStage: 'flop', cardsToDeal: 3 },
    'flop': { nextStage: 'turn', cardsToDeal: 1 },
    'turn': { nextStage: 'river', cardsToDeal: 1 },
  };

  const transition = stageTransitions[newState.stage as keyof typeof stageTransitions];
  if (!transition) return newState;
  
  newState.stage = transition.nextStage;
  for (let i = 0; i < transition.cardsToDeal; i++) {
    if (newState.deck.length > 0) newState.communityCards.push(newState.deck.pop()!);
  }

  newState.currentBet = 0;
  const dealerIndex = newState.players.findIndex((p: PokerPlayer) => p.isDealer);
  newState.activePlayerIndex = getNextPlayerIndex(newState.players, dealerIndex);
  newState.lastRaiserIndex = newState.activePlayerIndex;
  
  return newState;
}

export const getBotAction = (state: PokerGameState, bot: PokerPlayer): { action: PlayerAction, amount: number } => {
    const callAmount = state.currentBet - bot.currentBet;
    
    // If no bet, check
    if (callAmount === 0) {
        // Small chance to bet
        if (Math.random() < 0.2) {
            return { action: 'Bet', amount: 20 };
        }
        return { action: 'Check', amount: 0 };
    }
    
    // Simple bot: always call if it's less than 20% of their stack, otherwise fold.
    if (callAmount > bot.chips) {
        return { action: 'Fold', amount: 0 };
    }

    if (callAmount > bot.chips * 0.3) {
        return { action: 'Fold', amount: 0 };
    }

    return { action: 'Call', amount: 0 };
}
    