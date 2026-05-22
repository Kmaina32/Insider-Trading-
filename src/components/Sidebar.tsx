import React from 'react';
import { Activity, BarChart2, Cpu, Globe, Settings, Crosshair, Terminal, LogOut } from 'lucide-react';
import { logout } from '../lib/firebase';

interface SidebarProps {
  activePage: string;
  setActivePage: (p: string) => void;
  onOpenSettings?: () => void;
}

export function Sidebar({ activePage, setActivePage, onOpenSettings }: SidebarProps) {
  const navItems = [
    { icon: Activity, label: 'Dashboard' },
    { icon: BarChart2, label: 'Stocks' },
    { icon: Globe, label: 'Forex' },
    { icon: Crosshair, label: 'Polymarket' },
    { icon: Cpu, label: 'AI Strategies' },
    { icon: Terminal, label: 'Backtesting' },
    { icon: Settings, label: 'Settings', action: 'SETTINGS' },
  ];

  return (
    <nav className="w-16 flex-shrink-0 bg-[#0F0F12] border-r border-slate-800 flex flex-col items-center py-4 space-y-6 h-screen overflow-y-auto flex">
      <div 
        className="w-10 h-10 bg-slate-900 border border-slate-700 hover:border-blue-500 transition-colors rounded-lg flex items-center justify-center cursor-pointer flex-col shadow-inner" 
        onClick={() => setActivePage('Dashboard')}
        title="Insider Trader Pro"
      >
        <span className="text-white font-bold text-[10px] leading-tight">INSIDER</span>
        <span className="text-blue-500 font-normal text-[8px] leading-tight">TRADER</span>
      </div>
      
      <div className="flex-1 w-full flex flex-col items-center space-y-4 mt-4">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = item.action === 'SETTINGS' ? false : activePage === item.label;
          return (
            <button
              key={idx}
              title={item.label}
              onClick={() => {
                if (item.action === 'SETTINGS' && onOpenSettings) onOpenSettings();
                else setActivePage(item.label);
              }}
              className={`p-2 transition-all rounded-lg ${
                isActive 
                  ? 'text-blue-500 bg-blue-500/10' 
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 pointer-events-none" />
            </button>
          )
        })}
      </div>

      <div className="pb-4 flex flex-col items-center space-y-4">
         <button onClick={() => logout()} className="p-2 text-slate-500 hover:text-red-400 transition-colors" title="Logout">
           <LogOut className="w-4 h-4" />
         </button>
         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="System Online"></div>
      </div>
    </nav>
  );
}
