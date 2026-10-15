'use client';

import React from 'react';
import { Ticket, MapPin, UserPlus } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'door' | 'tables' | 'dashboard';
  setActiveTab: (tab: 'door' | 'tables' | 'dashboard') => void;
  onOpenAddGuest: () => void;
}

export function BottomNav({
  activeTab,
  setActiveTab,
  onOpenAddGuest,
}: BottomNavProps) {
  return (
    <div className="fixed bottom-3 sm:bottom-5 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav 
        aria-label="Glavna navigacija"
        className="pointer-events-auto w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200 p-1.5 rounded-2xl shadow-xl shadow-slate-300/40 flex items-center justify-between gap-1.5 ring-1 ring-slate-900/5"
      >
        
        {/* Tab 1: Ulaz */}
        <button
          type="button"
          onClick={() => setActiveTab('door')}
          className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'door'
              ? 'bg-[#013695] text-white shadow-md shadow-[#013695]/30 border border-[#024ec4]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Ticket className={`w-4 h-4 ${activeTab === 'door' ? 'text-white' : 'text-slate-500'}`} />
          <span>Ulaz</span>
        </button>

        {/* Tab 2: Stolovi */}
        <button
          type="button"
          onClick={() => setActiveTab('tables')}
          className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'tables'
              ? 'bg-[#013695] text-white shadow-md shadow-[#013695]/30 border border-[#024ec4]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MapPin className={`w-4 h-4 ${activeTab === 'tables' ? 'text-white' : 'text-slate-500'}`} />
          <span>Stolovi</span>
        </button>

        {/* Action: Novi gost (Accent Button) */}
        <button
          type="button"
          onClick={onOpenAddGuest}
          className="flex-[1.2] sm:flex-1 h-12 px-3 rounded-xl bg-[#FC661B] hover:bg-[#e5530b] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-[#FC661B]/30 border border-white/30 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Novi gost</span>
        </button>

      </nav>
    </div>
  );
}
