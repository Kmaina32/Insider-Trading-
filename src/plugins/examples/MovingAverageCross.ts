import { IStrategyPlugin, MarketContext, RiskConfig } from '../StrategyPlugin';
import { AiSignal } from '../../types';

export class MovingAverageCross implements IStrategyPlugin {
  name = "MA Cross RL Agent";
  version = "1.0.0";
  description = "A basic moving average crossover strategy with mock RL feedback weighting.";
  
  private shortWindow = 10;
  private longWindow = 20;

  onInitialize(config: any): void {
    if (config.shortWindow) this.shortWindow = config.shortWindow;
    if (config.longWindow) this.longWindow = config.longWindow;
  }

  async evaluate(context: MarketContext, riskConfig: RiskConfig): Promise<AiSignal> {
    const prices = context.history.map(h => h.price);
    
    if (prices.length < this.longWindow) {
      return { signal: 'HOLD', confidence: 0, reasoning: 'Insufficient data for MA window.' };
    }

    const shortMA = prices.slice(-this.shortWindow).reduce((a,b) => a+b, 0) / this.shortWindow;
    const longMA = prices.slice(-this.longWindow).reduce((a,b) => a+b, 0) / this.longWindow;

    let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 50;
    
    // Simple logic
    if (shortMA > longMA * 1.001) {
      signal = 'BUY';
      confidence = 75;
    } else if (shortMA < longMA * 0.999) {
      signal = 'SELL';
      confidence = 75;
    }

    // Adjust based on sentiment
    if (context.sentimentScore) {
       if (context.sentimentScore > 0.6 && signal === 'BUY') confidence += 15;
       if (context.sentimentScore < -0.6 && signal === 'SELL') confidence += 15;
    }

    confidence = Math.min(confidence, 99);

    return {
      signal,
      confidence,
      reasoning: `Short MA (${shortMA.toFixed(2)}) vs Long MA (${longMA.toFixed(2)}). NLP sentiment factor applied.`,
      strategyId: this.name
    } as any;
  }

  onTradeExecution(tradeId: string, result: 'WIN' | 'LOSS', pnl: number): void {
    // In a real RL agent, this would update Q-tables or model weights via a backend call.
    console.log(`[Plugin: ${this.name}] Trade ${tradeId} completed. Result: ${result}, PNL: ${pnl}. Updating weights...`);
  }
}
