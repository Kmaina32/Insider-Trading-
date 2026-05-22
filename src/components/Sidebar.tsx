import React from 'react';
import { Activity, BarChart2, Cpu, Globe, Settings, Crosshair, Terminal, LogOut } from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
  onOpenSettings?: () => void;
}

export function Sidebar({ onCloseMobile, onOpenSettings }: SidebarProps) {
  const navItems = [
    { icon: Activity, label: 'Dashboard', active: true },
    { icon: BarChart2, label: 'Stocks', active: false },
    { icon: Globe, label: 'Forex', active: false },
    { icon: Crosshair, label: 'Polymarket', active: false },
    { icon: Cpu, label: 'AI Strategies', active: false },
    { icon: Terminal, label: 'Backtesting', active: false },
    { icon: Settings, label: 'Settings', active: false, action: 'SETTINGS' },
  ];

  return (
    <nav className="w-16 flex-shrink-0 bg-[#0F0F12] border-r border-slate-800 flex flex-col items-center py-4 space-y-6 h-screen overflow-y-auto flex">
      <div className="p-2 text-white bg-blue-600 rounded flex items-center justify-center font-bold text-xs">IT</div>
      
      <div className="flex-1 w-full flex flex-col items-center space-y-4 mt-4">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              title={item.label}
              onClick={() => {
                if (item.action === 'SETTINGS' && onOpenSettings) onOpenSettings();
                else if (onCloseMobile) onCloseMobile();
              }}
              className={`p-2 transition-all rounded-lg ${
                item.active 
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
         <button onClick={() => window.location.reload()} className="p-2 text-slate-500 hover:text-red-400 transition-colors" title="Logout">
           <LogOut className="w-4 h-4" />
         </button>
         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="System Online"></div>
      </div>
    </nav>
  );
}
