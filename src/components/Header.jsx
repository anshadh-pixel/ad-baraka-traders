import React, { useState } from 'react';
import { Store, RefreshCw, Sun, Moon } from 'lucide-react';

export default function Header({ business, theme, onToggleTheme, onRefreshData }) {
  const isLight = theme === 'light';
  const [isRotating, setIsRotating] = useState(false);

  const handleRefreshClick = () => {
    setIsRotating(true);
    if (onRefreshData) {
      onRefreshData();
    }
    setTimeout(() => {
      setIsRotating(false);
    }, 650);
  };

  return (
    <header className={`${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#111827] border-slate-800 shadow-sm'} border-b px-4 sticky top-0 z-30 transition-colors safe-top-header`}>
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className={`font-bold text-base tracking-tight leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {business?.name || "Ad-Baraka Traders"}
            </h1>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Customer Rate, Delivery & Bill Manager
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              isLight 
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isLight ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <span className="hidden sm:inline font-medium">{isLight ? "Dark" : "Light"}</span>
          </button>

          {/* Sync / Refresh Data Button (Safe: Never deletes data!) */}
          <button
            onClick={handleRefreshClick}
            title="Sync & refresh data"
            className={`text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 ${
              isLight 
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200' 
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-blue-400' : ''}`} />
            <span className="hidden sm:inline font-medium">Sync</span>
          </button>
        </div>
      </div>
    </header>
  );
}
