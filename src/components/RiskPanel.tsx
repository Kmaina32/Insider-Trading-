import React from 'react';
import { AlertTriangle, ShieldCheck, TrendingDown } from 'lucide-react';

export function RiskPanel() {
  return (
    <div className="flex flex-col mt-4">
       <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center space-x-2">
         <ShieldCheck className="w-4 h-4 text-slate-400" />
         <span>Risk Guard</span>
       </h3>
       
       <div className="space-y-2">
         <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex justify-between items-center text-[11px]">
           <div className="flex items-center space-x-2 text-white">
             <AlertTriangle className="w-3 h-3 text-amber-500" />
             <span>Global Drawdown Limit</span>
           </div>
           <span className="font-mono text-amber-500 font-bold">-5.00%</span>
         </div>
         
         <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex justify-between items-center text-[11px]">
           <div className="flex items-center space-x-2 text-white">
             <TrendingDown className="w-3 h-3 text-green-500" />
             <span>Trailing TP</span>
           </div>
           <span className="font-mono text-green-500 font-bold">1.5X ATR</span>
         </div>

         <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg mt-4">
            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Auto-Trader Active</h4>
            <p className="text-[9px] text-slate-400 mt-1">Strategy: "RL-Institutional-G6" is currently managing 4 open positions.</p>
         </div>
       </div>
    </div>
  );
}
