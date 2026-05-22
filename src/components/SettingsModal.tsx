import React, { useState, useEffect } from 'react';
import { X, Key, Shield, Database, Settings } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onKeysSaved: () => void;
}

export function SettingsModal({ onClose, onKeysSaved }: SettingsModalProps) {
  const [polymarketKey, setPolymarketKey] = useState('');
  const [polygonKey, setPolygonKey] = useState('');
  const [oandaKey, setOandaKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/keys')
      .then(r => r.json())
      .then(data => {
         if (data.polymarket) setPolymarketKey('********');
         if (data.polygon) setPolygonKey('********');
         if (data.oanda) setOandaKey('********');
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          polymarketKey: polymarketKey === '********' ? undefined : polymarketKey, 
          polygonKey: polygonKey === '********' ? undefined : polygonKey, 
          oandaKey: oandaKey === '********' ? undefined : oandaKey 
        })
      });
      onKeysSaved();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F0F12] border border-slate-800 rounded-xl max-w-lg w-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            Integrations & API Keys
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
             <div className="flex items-start gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                <Database className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <label className="block text-[11px] text-slate-300 font-bold uppercase mb-1">Polymarket API Key</label>
                  <p className="text-[10px] text-slate-500 mb-2">Required for prediction market data and automated execution on Polymarket.</p>
                  <input type="password" value={polymarketKey} onChange={e => setPolymarketKey(e.target.value)} className="w-full bg-[#0A0A0B] border border-slate-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono placeholder:text-slate-700" placeholder="poly_live_..." />
                </div>
             </div>
             
             <div className="flex items-start gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                <Shield className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <label className="block text-[11px] text-slate-300 font-bold uppercase mb-1">Polygon.io API Key (Stocks)</label>
                  <p className="text-[10px] text-slate-500 mb-2">Provides institutional-grade live stock market data feeds.</p>
                  <input type="password" value={polygonKey} onChange={e => setPolygonKey(e.target.value)} className="w-full bg-[#0A0A0B] border border-slate-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono placeholder:text-slate-700" placeholder="Enter Polygon Key" />
                </div>
             </div>

             <div className="flex items-start gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                <Key className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <label className="block text-[11px] text-slate-300 font-bold uppercase mb-1">OANDA API Key (Forex)</label>
                  <p className="text-[10px] text-slate-500 mb-2">Connect to OANDA v20 for live forex pairs and trading.</p>
                  <input type="password" value={oandaKey} onChange={e => setOandaKey(e.target.value)} className="w-full bg-[#0A0A0B] border border-slate-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono placeholder:text-slate-700" placeholder="Enter OANDA Token" />
                </div>
             </div>
        </div>
        
        <div className="p-4 border-t border-slate-800 bg-[#0A0A0B] flex justify-end gap-3 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors disabled:opacity-50 flex items-center">
            {isSaving ? 'Validating Keys...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
