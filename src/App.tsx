import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { AssetChart } from './components/AssetChart';
import { AISignalPanel } from './components/AISignalPanel';
import { RiskPanel } from './components/RiskPanel';
import { Portfolio, MarketHistory } from './types';
import { RefreshCcw, Menu, X, LogIn, KeySquare } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [marketData, setMarketData] = useState<MarketHistory[]>([]);
  const [activeSymbol, setActiveSymbol] = useState('BTC');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Re-fetch data function
  const fetchAllData = () => {
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => setPortfolio(data));

    fetchMarketData(activeSymbol);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAllData();
    const interval = setInterval(() => fetchMarketData(activeSymbol), 5000);
    return () => clearInterval(interval);
  }, [activeSymbol, isAuthenticated]);

  const fetchMarketData = (symbol: string) => {
    fetch(`/api/market/${symbol}`)
      .then(res => res.json())
      .then(data => setMarketData(data.history));
  }

  if (!isAuthenticated) {
    return <AuthModal onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-[#0A0A0B] overflow-hidden font-sans text-slate-300 relative">
      {isSettingsOpen && (
        <SettingsModal 
          onClose={() => setIsSettingsOpen(false)} 
          onKeysSaved={() => {
            fetchAllData(); 
          }} 
        />
      )}
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar Wrapper */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          onCloseMobile={() => setIsMobileMenuOpen(false)} 
          onOpenSettings={() => setIsSettingsOpen(true)} 
        />
      </div>
      
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full max-w-full">
        {/* Topbar / Header */}
        <header className="h-14 border-b border-slate-800 bg-[#0F0F12] shrink-0 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <button 
              className="md:hidden text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xs lg:text-sm font-bold text-white tracking-tighter">INSIDER <span className="text-blue-500 font-normal">TRADER</span> <span className="text-blue-500 font-normal ml-1 text-[10px] tracking-normal opacity-70">PRO</span></h2>
            <div className="hidden lg:block h-4 w-[1px] bg-slate-800"></div>
            <p className="hidden lg:flex text-[10px] text-slate-500 uppercase tracking-widest font-semibold items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Matrix</span>
            </p>
          </div>
          
          {portfolio && (
            <div className="flex items-center space-x-4 lg:space-x-6 text-[10px]">
              <div className="flex flex-col items-end">
                <span className="text-slate-500 uppercase tracking-widest font-semibold">Total Equity</span>
                <span className="text-xs lg:text-sm font-mono font-bold text-white">${portfolio.balance.toLocaleString()}</span>
              </div>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-slate-500 uppercase tracking-widest font-semibold">Today's P&L</span>
                <span className={`text-xs lg:text-sm font-mono font-bold ${portfolio.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {portfolio.pnl >= 0 ? '+' : '-'}${Math.abs(portfolio.pnl).toLocaleString()} ({portfolio.pnlPercent}%)
                </span>
              </div>
            </div>
          )}
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main Chart Column */}
          <div className="flex-1 flex flex-col border-r border-slate-800 overflow-y-auto">
            
            {/* Top Dashboard Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-slate-800 shrink-0">
               <div className="p-3 border-r border-slate-800 border-b md:border-b-0">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Margin Utils</div>
                  <div className="text-sm font-mono text-white mt-1 font-bold">14.2%</div>
               </div>
               <div className="p-3 border-r border-slate-800 border-b md:border-b-0">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Strategies</div>
                  <div className="text-sm font-mono text-white mt-1 font-bold">4 Running</div>
               </div>
               <div className="p-3 border-r border-slate-800 flex items-center space-x-2 overflow-x-auto">
                  {/* Asset Selector */}
                  {['BTC', 'AAPL', 'EURUSD', 'POLY'].map(sym => (
                    <button
                      key={sym}
                      onClick={() => setActiveSymbol(sym === 'POLY' ? 'POLY_YES_AI' : sym)}
                      className={`px-3 py-1 text-[10px] rounded font-bold uppercase whitespace-nowrap transition-all ${
                        (activeSymbol === sym || (activeSymbol === 'POLY_YES_AI' && sym === 'POLY'))
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
               </div>
               <div className="p-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Risk</div>
                  <div className="text-sm font-mono text-white mt-1 font-bold">LOW (0.12)</div>
               </div>
            </div>

            <div className="flex-1 p-4 flex flex-col min-h-[450px]">
              {/* Chart Area */}
              <div className="bg-[#0D0D10] border border-slate-800 rounded-lg flex-1 shadow-inner flex flex-col p-1 mb-4 h-[300px] lg:h-auto">
              {marketData.length > 0 ? (
                <AssetChart data={marketData} symbol={activeSymbol} />
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500">
                  <RefreshCcw className="w-8 h-8 animate-spin opacity-50" />
                </div>
              )}
              </div>

              {/* Open Positions Table */}
              <div className="border border-slate-800 rounded-lg overflow-hidden shrink-0 mt-2 bg-[#0F0F12]">
                <div className="px-3 py-2 border-b border-slate-800 bg-[#0F0F12] flex justify-between items-center">
                   <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Open Positions</h3>
                </div>
                <div className="overflow-x-auto">
                  {portfolio && portfolio.assets && portfolio.assets.length > 0 ? (
                    <table className="w-full text-[11px] text-left">
                      <thead className="text-[10px] text-slate-500 uppercase bg-[#0A0A0B] border-b border-slate-800">
                        <tr>
                          <th className="px-3 py-2">Asset</th>
                          <th className="px-3 py-2 hidden sm:table-cell">Size</th>
                          <th className="px-3 py-2">Current</th>
                          <th className="px-3 py-2 text-right">P&L</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#0F0F12]">
                        {portfolio.assets.map((asset, i) => {
                          const isUp = asset.currentPrice > asset.avgPrice;
                          const pnl = ((asset.currentPrice - asset.avgPrice) * asset.shares);
                          return (
                            <tr key={i} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/40 transition-colors">
                              <td className="px-3 py-2 font-bold text-white uppercase">{asset.symbol === 'POLY_YES_AI' ? 'POLY' : asset.symbol}</td>
                              <td className="px-3 py-2 text-slate-400 font-mono hidden sm:table-cell">{asset.shares.toLocaleString()}</td>
                              <td className="px-3 py-2 font-mono font-bold text-slate-300">${asset.currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                              <td className={`px-3 py-2 font-mono font-bold text-right ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                                {isUp ? '+' : '-'}${Math.abs(pnl).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 flex flex-col items-center justify-center text-slate-500 text-center">
                      <KeySquare className="w-8 h-8 mb-3 opacity-30 text-blue-500" />
                      <p className="text-[10px] uppercase tracking-widest font-semibold mb-2 text-slate-400">No Integrations Configured</p>
                      <p className="text-[11px] max-w-xs leading-relaxed">Connect your API keys in Settings to unlock live streaming feeds and autonomous trading for Stocks, Forex, and Prediction Markets.</p>
                      <button onClick={() => setIsSettingsOpen(true)} className="mt-4 bg-blue-600/10 text-blue-400 border border-blue-500/20 px-4 py-2 rounded text-[10px] font-bold tracking-widest uppercase hover:bg-blue-600/20 transition-colors">
                        Configure Integrations
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar / Modules */}
          <aside className="w-full lg:w-72 bg-[#0F0F12] flex flex-col shrink-0 overflow-y-auto border-t lg:border-t-0 border-slate-800">
            <div className="p-4 space-y-4">
              <AISignalPanel symbol={activeSymbol} />
              <RiskPanel />
            </div>
          </aside>
        </div>
        
        {/* Footer Status Bar */}
        <footer className="h-8 border-t border-slate-800 bg-[#0F0F12] flex items-center justify-between px-4 text-[10px] text-slate-500 shrink-0 mt-auto hidden sm:flex">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>POLYGON FEED</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>OANDA V20</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>POLYMKT API</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span>NODE-64 (DOCKER-CLUSTER-B)</span>
            <span className="font-mono">v1.2.0-STABLE</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
