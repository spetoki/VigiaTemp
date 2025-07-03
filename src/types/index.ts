
export type TemperatureUnit = 'C' | 'F';
export type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES';

// A User type that is used across the application
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // For user creation by admin; not for secure storage in this demo.
  role: 'Admin' | 'User';
  status: 'Active' | 'Inactive' | 'Pending';
  joinedDate: string;
  subscriptionTier?: 'Free' | 'VIP1' | 'VIP2' | 'VIP4' | null;
  subscriptionEndDate?: string | null;
  tempCoins?: number;
}


export interface HistoricalDataPoint {
  timestamp: number; // Unix timestamp
  temperature: number; // Always in Celsius for storage
}

export type SensorStatus = 'normal' | 'warning' | 'critical';

export interface Sensor {
  id: string;
  name: string;
  location: string;
  currentTemperature: number; // Always in Celsius for storage
  highThreshold: number; // Always in Celsius
  lowThreshold: number; // Always in Celsius
  historicalData: HistoricalDataPoint[];
  model?: string;
  ipAddress?: string;
  macAddress?: string;
  criticalAlertSound?: string; // Data URI for the sound
}

export interface Alert {
  id: string;
  sensorId: string;
  sensorName: string;
  timestamp: number;
  level: 'warning' | 'critical';
  message: string;
  acknowledged: boolean;
  reason?: 'high' | 'low';
}

// --- Poker Game Types ---
export type Suit = 'Spades' | 'Hearts' | 'Diamonds' | 'Clubs';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type HandRank = 'High Card' | 'Pair' | 'Two Pair' | 'Three of a Kind' | 'Straight' | 'Flush' | 'Full House' | 'Four of a Kind' | 'Straight Flush' | 'Royal Flush';

export interface EvaluatedHand {
    rank: HandRank;
    value: number; // A numeric value for comparing hands of the same rank
    description: string;
    cards: Card[];
}


export type PlayerAction = 'Fold' | 'Check' | 'Call' | 'Bet' | 'Raise';
export type PlayerStatus = 'Playing' | 'Folded' | 'All-in' | 'Sat Out';

export interface PokerPlayer {
  id: string;
  name: string;
  isBot: boolean;
  chips: number;
  cards: Card[];
  currentBet: number;
  status: PlayerStatus;
  isDealer: boolean;
  hand?: EvaluatedHand;
}

export type GameStage = 'pre-deal' | 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface PokerGameState {
  players: PokerPlayer[];
  deck: Card[];
  communityCards: Card[];
  stage: GameStage;
  pot: number;
  currentBet: number;
  activePlayerIndex: number;
  lastRaiserIndex?: number;
  winnerInfo: { winners: PokerPlayer[], hand: EvaluatedHand | null } | null;
  log: string[];
  handCount: number;
}
