import React, { useEffect, useState } from 'react';
import { KeySquare, Activity, ShieldAlert, Cpu } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  volume: number;
  image: string;
  markets: {
    id: string;
    question: string;
    outcomePrices: string; // JSON array of string floats
    outcomes: string; // JSON array of strings
  }[];
}

export function PolymarketView({ hasKey, onOpenSettings }: { hasKey: boolean, onOpenSettings: () => void }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchMarkets = async () => {
      try {
        const res = await fetch('https://gamma-api.polymarket.com/events?active=true&closed=false&limit=15');
        const data = await res.json();
        if (active) {
          setEvents(data);
          setLoading(false);
        }
      } catch (e) {
        console.error("Polymarket fetch error:", e);
        if (active) setLoading(false);
      }
    };
    fetchMarkets();
    return () => { active = false; };
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {!hasKey && (
         <div className="absolute inset-0 bg-[#0A0A0B]/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
            <KeySquare className="w-12 h-12 text-blue-500 mb-4 opacity-80" />
            <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Polymarket API Key Required</h2>
            <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">Please connect your integration credentials in settings to unlock live prediction markets data, trading, and strategy execution.</p>
            <button onClick={onOpenSettings} className="bg-blue-600 hover:bg-blue-500 text-white transition-colors py-2 px-6 rounded font-bold text-sm tracking-widest uppercase shadow-lg shadow-blue-500/20">
              Configure Integrations
            </button>
         </div>
      )}
      
      <div className="p-4 border-b border-slate-800 bg-[#0D0D10] shrink-0 flex items-center justify-between">
         <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
           <Activity className="w-4 h-4 text-blue-500" />
           Live Polymarket Events
         </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
           <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center justify-center text-slate-500 animate-pulse">
                <Cpu className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-[10px] uppercase tracking-widest font-mono">Syncing Markets...</p>
              </div>
           </div>
        ) : (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {events.map((ev) => (
                <div key={ev.id} className="bg-[#0F0F12] border border-slate-800 rounded-lg p-4 hover:border-blue-500/50 transition-colors flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                     {ev.image && <img src={ev.image} alt={ev.title} className="w-12 h-12 rounded object-cover" />}
                     <div className="flex-1">
                        <h3 className="text-xs font-bold text-white mb-1 line-clamp-2 leading-snug">{ev.title}</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">${Math.floor(ev.volume).toLocaleString()} Vol</p>
                     </div>
                  </div>
                  
                  <div className="space-y-2 flex-1 flex flex-col justify-end">
                     {ev.markets && ev.markets[0] && (
                        <div className="bg-[#0A0A0B] border border-slate-800 rounded p-3">
                           <p className="text-[11px] text-slate-300 mb-2 truncate">{ev.markets[0].question}</p>
                           <div className="flex gap-2">
                             {(() => {
                               try {
                                 const outcomes = JSON.parse(ev.markets[0].outcomes) as string[];
                                 const prices = JSON.parse(ev.markets[0].outcomePrices) as string[];
                                 return outcomes.slice(0,2).map((out, idx) => (
                                   <div key={idx} className="flex-1 flex justify-between items-center bg-slate-900 border border-slate-800 rounded px-2 py-1">
                                      <span className={`text-[10px] font-bold ${out.toUpperCase()==='YES' ? 'text-green-500' : out.toUpperCase()==='NO' ? 'text-red-500' : 'text-slate-400'}`}>{out}</span>
                                      <span className="text-[10px] font-mono text-white">{(parseFloat(prices[idx])*100).toFixed(1)}%</span>
                                   </div>
                                 ));
                               } catch (e) { return null; }
                             })()}
                           </div>
                        </div>
                     )}
                  </div>
                </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
}
