import React, { useState } from 'react';
import { BrainCircuit, Play, Square, Settings, ShieldAlert, Cpu } from 'lucide-react';
import { AiSignal } from '../types';

interface AISignalPanelProps {
  symbol: string;
}

export function AISignalPanel({ symbol }: AISignalPanelProps) {
  const [signal, setSignal] = useState<AiSignal | null>(null);
  const [loading, setLoading] = useState(false);
  const [botActive, setBotActive] = useState(false);

  const fetchSignal = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          timeframe: '15m',
          context: { volatility: 'High', trend: 'Bullish', rsi: 65, macd: 'Crossover' }
        })
      });
      const data = await res.json();
      setSignal(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center space-x-2">
           <BrainCircuit className="w-4 h-4 text-blue-500" />
           <span>AI Strategy Engine</span>
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${botActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
            {botActive ? 'Active' : 'Standby'}
          </span>
          <button 
            onClick={() => setBotActive(!botActive)}
            className={`p-1 rounded transition-colors ${botActive ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'}`}
          >
            {botActive ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg min-h-[140px] flex flex-col justify-center relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center text-slate-400 animate-pulse py-4">
              <Cpu className="w-6 h-6 mb-2 opacity-50" />
              <p className="text-[10px] uppercase tracking-widest font-mono">Running Models...</p>
            </div>
          ) : signal ? (
            <div className="flex flex-col h-full justify-between gap-3">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-white uppercase">{symbol} / TRADE</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${signal.signal === 'BUY' ? 'bg-green-500/20 text-green-400' : signal.signal === 'SELL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-500'}`}>
                  {signal.signal} Signal
                </span>
              </div>
              
              <div className="text-[11px] text-slate-300 leading-tight">
                {signal.reasoning}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500">AI Confidence</span>
                  <span className="text-xs font-mono text-white font-bold">{signal.confidence}%</span>
                </div>
                {signal.signal !== 'HOLD' && (
                   <button className="bg-blue-600 hover:bg-blue-500 text-[10px] text-white px-3 py-1.5 rounded font-bold transition-colors">
                     EXECUTE
                   </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 py-4">
              <Cpu className="w-6 h-6 mb-2 opacity-30" />
              <p className="text-[10px] text-center">Standby.<br/>Run inference.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button 
          onClick={fetchSignal} 
          disabled={loading}
          className="flex-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 disabled:opacity-50 text-white py-1.5 rounded text-[10px] uppercase tracking-widest font-bold transition-colors flex justify-center items-center gap-1.5"
        >
          {loading ? 'Processing...' : 'Generate New Signal'}
        </button>
      </div>
    </div>
  );
}
