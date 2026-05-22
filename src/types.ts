export interface Asset {
  symbol: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  allocation: number;
}

export interface Portfolio {
  balance: number;
  pnl: number;
  pnlPercent: number;
  assets: Asset[];
}

export interface MarketHistory {
  time: string;
  price: number;
  volume: number;
}

export interface AiSignal {
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
}
