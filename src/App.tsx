import React, { useEffect, useState, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { AssetChart } from './components/AssetChart';
import { AISignalPanel } from './components/AISignalPanel';
import { RiskPanel } from './components/RiskPanel';
import { Portfolio, MarketHistory } from './types';
import { RefreshCcw, Menu, X, LogIn, KeySquare, ChevronDown } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { PolymarketView } from './components/PolymarketView';
import { auth, db, logout } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [marketData, setMarketData] = useState<MarketHistory[]>([]);
  const [activeSymbol, setActiveSymbol] = useState('BTC');
  const [activePage, setActivePage] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userKeys, setUserKeys] = useState<{ polygonKey?: string, oandaKey?: string, polymarketKey?: string }>({});
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthInitialized(true);
      if (u) {
        try {
           const uRef = doc(db, 'users', u.uid);
           const uSnap = await getDoc(uRef);
           if (!uSnap.exists()) {
             await setDoc(uRef, {
               email: u.email || '',
               displayName: u.displayName || '',
               photoURL: u.photoURL || '',
               createdAt: serverTimestamp(),
               updatedAt: serverTimestamp()
             });
           }
           
           const keysRef = doc(db, 'users', u.uid, 'private', 'keys');
           const keysSnap = await getDoc(keysRef);
           if (keysSnap.exists()) {
             setUserKeys(keysSnap.data());
           }
        } catch (e) {
           console.error("Failed to initialize user doc", e);
        }
      }
    });
    return unsub;
  }, []);

  const fetchAllData = async () => {
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => setPortfolio(data));

    fetchMarketData(activeSymbol);
    
    // Also re-fetch keys if Settings just closed
    if (user) {
      try {
         const keysRef = doc(db, 'users', user.uid, 'private', 'keys');
         const keysSnap = await getDoc(keysRef);
         if (keysSnap.exists()) {
           setUserKeys(keysSnap.data());
         }
      } catch (e) { console.error(e); }
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchAllData();
    const interval = setInterval(() => fetchMarketData(activeSymbol), 5000);
    return () => clearInterval(interval);
  }, [activeSymbol, user]);

  const fetchMarketData = (symbol: string) => {
    fetch(`/api/market/${symbol}`)
      .then(res => res.json())
      .then(data => setMarketData(data.history));
  }

  // Click outside to close mobile menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  if (!authInitialized) {
     return <div className="h-screen w-full bg-[#0A0A0B] flex items-center justify-center">
       <div className="flex flex-col items-center justify-center space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tighter animate-pulse text-center">
            INSIDER <span className="text-blue-500 font-normal">TRADER</span> <span className="text-blue-500 font-normal ml-1 text-[10px] tracking-normal opacity-70">PRO</span>
          </h2>
       </div>
     </div>;
  }

  if (!user) {
    return <AuthModal onLogin={() => {}} />;
  }

  const renderPageContent = () => {
    if (activePage === 'Settings') {
      return (
        <div className="p-8 flex flex-col items-center justify-center h-full text-slate-500 text-center">
          <KeySquare className="w-12 h-12 mb-4 opacity-50 text-blue-500" />
          <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Settings</h2>
          <p className="text-sm max-w-md leading-relaxed mb-6">Manage your API keys, preferences, and account details here.</p>
          <button onClick={() => setIsSettingsOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white transition-colors py-2 px-6 rounded font-bold text-sm tracking-widest uppercase">
            Open Settings Panel
          </button>
        </div>
      );
    }

    if (!['Dashboard', 'Stocks', 'Forex', 'Polymarket'].includes(activePage)) {
      return (
        <div className="p-8 flex flex-col items-center justify-center h-full text-slate-500 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <RefreshCcw className="w-6 h-6 animate-spin opacity-50" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">{activePage}</h2>
          <p className="text-sm max-w-md leading-relaxed">This module is currently initializing. Connect to the core node to access trading functionalities.</p>
        </div>
      );
    }

    if (activePage === 'Polymarket') {
      return (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <PolymarketView hasKey={!!userKeys.polymarketKey} onOpenSettings={() => setIsSettingsOpen(true)} />
          {/* Right Sidebar / Modules */}
          <aside className="w-full lg:w-72 bg-[#0F0F12] flex flex-col shrink-0 overflow-y-auto border-t lg:border-t-0 border-slate-800">
            <div className="p-4 space-y-4">
              <RiskPanel />
            </div>
          </aside>
        </div>
      );
    }

    const requiresKeyOverlay = 
      (activePage === 'Stocks' && !userKeys.polygonKey) || 
      (activePage === 'Forex' && !userKeys.oandaKey);
    const missingKeysMsg = activePage === 'Stocks' 
          ? 'Polygon.io API Key Required for Live Equities'
          : 'OANDA API Key Required for Forex Pairs';

    return (
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Chart Column */}
        <div className="flex-1 flex flex-col border-r border-slate-800 overflow-y-auto relative">
          {requiresKeyOverlay && (
             <div className="absolute inset-0 bg-[#0A0A0B]/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
                <KeySquare className="w-12 h-12 text-blue-500 mb-4 opacity-80" />
                <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">{missingKeysMsg}</h2>
                <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">Please connect your integration credentials in settings to unlock live real-time chart rendering and strategy execution for {activePage}.</p>
                <button onClick={() => setIsSettingsOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white transition-colors py-2 px-6 rounded font-bold text-sm tracking-widest uppercase shadow-lg shadow-blue-500/20">
                  Configure Integrations
                </button>
             </div>
          )}
          {/* Top Dashboard Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-b border-slate-800 shrink-0">
             <div className="p-3 border-r border-slate-800 border-b lg:border-b-0">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Margin Utils</div>
                <div className="text-sm font-mono text-white mt-1 font-bold">14.2%</div>
             </div>
             <div className="p-3 border-r border-slate-800 border-b lg:border-b-0">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Strategies</div>
                <div className="text-sm font-mono text-white mt-1 font-bold">4 Running</div>
             </div>
             <div className="p-3 border-r border-slate-800 flex flex-col justify-center space-y-1 overflow-x-auto border-b lg:border-b-0">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Active Feed</div>
                <div className="flex items-center space-x-2">
                {['BTC', 'AAPL', 'EURUSD', 'POLY'].map(sym => (
                  <button
                    key={sym}
                    onClick={() => setActiveSymbol(sym === 'POLY' ? 'POLY_YES_AI' : sym)}
                    className={`px-2 py-1 text-[10px] rounded font-bold uppercase whitespace-nowrap transition-all ${
                      (activeSymbol === sym || (activeSymbol === 'POLY_YES_AI' && sym === 'POLY'))
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
                </div>
             </div>
             <div className="p-3">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Risk State</div>
                <div className="text-sm font-mono text-white mt-1 font-bold">LOW (0.12)</div>
             </div>
          </div>

          <div className="flex-1 p-4 flex flex-col min-h-[450px]">
            {/* Chart Area */}
            <div className="bg-[#0D0D10] border border-slate-800 rounded-lg flex-1 shadow-inner flex flex-col p-1 mb-4 h-[300px] lg:h-auto min-h-[300px]">
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
                        <th className="px-3 py-2">Size</th>
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
                            <td className="px-3 py-2 text-slate-400 font-mono">{asset.shares.toLocaleString()}</td>
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
    );
  };

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
      
      {/* Sidebar Wrapper (Desktop only) */}
      <div className="hidden md:block md:relative md:translate-x-0 z-40">
        <Sidebar 
          activePage={activePage}
          setActivePage={setActivePage}
          onOpenSettings={() => setIsSettingsOpen(true)} 
        />
      </div>
      
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full max-w-full">
        {/* Topbar / Header */}
        <header className="h-14 border-b border-slate-800 bg-[#0F0F12] shrink-0 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <h2 className="text-xs lg:text-sm font-bold text-white tracking-tighter">INSIDER <span className="text-blue-500 font-normal">TRADER</span> <span className="text-blue-500 font-normal ml-1 text-[10px] tracking-normal opacity-70">PRO</span></h2>
            <div className="hidden lg:block h-4 w-[1px] bg-slate-800"></div>
            <div className="hidden md:flex text-[10px] text-slate-500 uppercase tracking-widest font-semibold items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Matrix</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 lg:space-x-6">
            {portfolio && (
              <div className="hidden lg:flex items-center space-x-6 text-[10px]">
                <div className="flex flex-col items-end">
                  <span className="text-slate-500 uppercase tracking-widest font-semibold">Total Equity</span>
                  <span className="text-xs lg:text-sm font-mono font-bold text-white">${portfolio.balance.toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-slate-500 uppercase tracking-widest font-semibold">Today's P&L</span>
                  <span className={`text-xs lg:text-sm font-mono font-bold ${portfolio.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {portfolio.pnl >= 0 ? '+' : '-'}${Math.abs(portfolio.pnl).toLocaleString()} ({portfolio.pnlPercent}%)
                  </span>
                </div>
              </div>
            )}
            
            {/* User Profile and Mobile Menu */}
            <div className="flex items-center space-x-3 relative" ref={mobileMenuRef}>
               {user.photoURL ? (
                 <img src={user.photoURL} alt="Profile" className="w-7 h-7 rounded-full border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer" onClick={() => setIsSettingsOpen(true)}/>
               ) : (
                 <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-[10px] cursor-pointer" onClick={() => setIsSettingsOpen(true)}>
                   {user.email?.charAt(0).toUpperCase()}
                 </div>
               )}
               
               <button 
                 className="md:hidden flex items-center justify-center w-8 h-8 rounded hover:bg-slate-800 text-slate-400 transition-colors"
                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               >
                 <Menu className="w-5 h-5" />
               </button>

               {isMobileMenuOpen && (
                 <div className="absolute top-10 right-0 w-48 bg-[#0F0F12] border border-slate-800 rounded-md shadow-2xl z-50 flex flex-col py-2 overflow-hidden">
                    <div className="px-4 py-2 border-b border-slate-800 mb-2">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{user.email}</p>
                    </div>
                    {['Dashboard', 'Stocks', 'Forex', 'Polymarket', 'AI Strategies', 'Backtesting'].map(page => (
                      <button
                        key={page}
                        onClick={() => { setActivePage(page); setIsMobileMenuOpen(false); }}
                        className={`text-left px-4 py-2 text-xs font-bold transition-colors ${activePage === page ? 'bg-blue-600/10 text-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        {page}
                      </button>
                    ))}
                    <div className="border-t border-slate-800 mt-2 mb-2"></div>
                    <button onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }} className="text-left px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">Settings</button>
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors">Sign Out</button>
                 </div>
               )}
            </div>
          </div>
        </header>

        {renderPageContent()}
      </main>
    </div>
  );
}
