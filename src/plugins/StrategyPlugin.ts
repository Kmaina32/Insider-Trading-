import { MarketHistory, AiSignal } from '../types';

export interface MarketContext {
  symbol: string;
  timeframe: string;
  history: MarketHistory[];
  sentimentScore?: number;
  sentimentDrivers?: string[];
}

export interface RiskConfig {
  maxDrawdown: number;
  positionSizeLimit: number;
  stopLossPercent: number;
}

export interface IStrategyPlugin {
  name: string;
  version: string;
  description: string;
  
  // Lifecycle hooks
  onInitialize(config: any): void;
  
  // Core logic
  evaluate(context: MarketContext, riskConfig: RiskConfig): Promise<AiSignal>;
  
  // Feedback loop for Reinforcement Learning
  onTradeExecution(tradeId: string, result: 'WIN' | 'LOSS', pnl: number): void;
}
