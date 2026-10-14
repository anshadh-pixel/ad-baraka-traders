import React from 'react';
import { Package, Users, BarChart3, Building2 } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export default function BottomNav({ activeTab, onTabChange, pendingDeliveryCount }) {
  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users, badge: pendingDeliveryCount > 0 ? pendingDeliveryCount : null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Business', icon: Building2 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-safe pt-2 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="glass-panel bg-[#0d1322]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-1.5 shadow-2xl shadow-black/80 flex items-center justify-between">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic('light');
                  onTabChange(tab.id);
                }}
                className={`relative flex-1 py-2 px-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Active Glowing Background */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/10 rounded-2xl border border-emerald-500/30 glow-emerald" />
                )}

                <div className="relative flex items-center justify-center">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-emerald-400' : ''}`} />
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 flex items-center justify-center shadow-md">
                      {tab.badge}
                    </span>
                  )}
                </div>

                <span className={`relative text-[11px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
