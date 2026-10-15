'use client';

import React, { useState } from 'react';
import { FinancialStats } from '@/lib/types';
import { 
  Sparkles, RefreshCw, SlidersHorizontal, ChevronDown, 
  Coins, Upload, Lock, Unlock, FileText, Check, ArrowRight, LogOut
} from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  stats: FinancialStats | null;
  activeTab: 'door' | 'tables' | 'dashboard';
  setActiveTab: (tab: 'door' | 'tables' | 'dashboard') => void;
  onOpenImport: () => void;
  onOpenCloseEvent: () => void;
  onRefresh: () => void;
  onLogout: () => void;
  isLoading: boolean;
  isRefreshing?: boolean;
  justRefreshed?: boolean;
}

export function Navbar({
  stats,
  activeTab,
  setActiveTab,
  onOpenImport,
  onOpenCloseEvent,
  onRefresh,
  onLogout,
  isLoading,
  isRefreshing = false,
  justRefreshed = false,
}: NavbarProps) {
  const [isManageOpen, setIsManageOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#0c1220]/95 backdrop-blur-md border-b border-[#1e293b] px-3 py-2.5 sm:px-6 relative">
      
      {/* Top subtle active loading progress line */}
      {isRefreshing && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FC661B] to-transparent animate-pulse" />
      )}

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand & Live Counter */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#013695] border border-[#024ec4] flex items-center justify-center shadow-md shadow-[#013695]/30 shrink-0">
              <Sparkles className="w-4 h-4 text-[#FC661B]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-none truncate flex items-center gap-1.5">
                <span>POOR DECISIONS</span>
                {stats?.isClosed && (
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                    ZAKLJUČENO
                  </span>
                )}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 leading-none mt-0.5">
                Ulaz & Obračun
              </p>
            </div>
          </div>

          {/* Cash Counter */}
          {stats && (
            <div 
              title={`Ukupno u blagajni: ${stats.totalCashExpected} €`}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#013695]/20 border border-[#013695]/40 text-[#60a5fa] text-xs shrink-0"
            >
              <Coins className="w-3.5 h-3.5 text-[#FC661B]" />
              <span className="font-extrabold text-[#FC661B] text-xs">{stats.totalCashExpected} €</span>
            </div>
          )}
        </div>

        {/* Right Actions: Refresh + Quick Lock + Manage Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2 relative">
          
          {/* Refresh Action with Clear Loading & Success Indicator */}
          <div className="flex items-center gap-1.5">
            {justRefreshed && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold animate-fade-in">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Osvježeno</span>
              </span>
            )}

            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing || isLoading}
              title="Osvježi podatke"
              className={`h-9 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                isRefreshing
                  ? 'bg-[#151f33] border-[#FC661B]/60 shadow-md shadow-[#FC661B]/20 text-[#FC661B]'
                  : justRefreshed
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                    : 'bg-[#151f33] hover:bg-[#1a253d] border-[#1e293b] text-slate-300 hover:text-white'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#FC661B]' : ''}`} />
              {isRefreshing ? (
                <span className="text-[11px] font-bold text-[#FC661B] hidden sm:inline">Osvježavam...</span>
              ) : justRefreshed ? (
                <span className="text-[11px] font-bold text-emerald-400 sm:hidden">✓</span>
              ) : null}
            </button>
          </div>

          {/* Quick Lock / Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            title="Odjavi se / Zaključaj ekran (Zahtijeva PIN)"
            className="w-9 h-9 rounded-xl bg-[#151f33] hover:bg-red-950/40 border border-[#1e293b] hover:border-red-500/40 text-slate-400 hover:text-red-300 flex items-center justify-center transition-colors active:scale-95"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>

          {/* Manage Menu Trigger Button */}
          <button
            type="button"
            onClick={() => setIsManageOpen(!isManageOpen)}
            className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
              isManageOpen || activeTab === 'dashboard'
                ? 'bg-[#013695] text-white border-[#024ec4] shadow-md shadow-[#013695]/30'
                : 'bg-[#151f33] hover:bg-[#1a253d] border-[#1e293b] text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#FC661B]" />
            <span>Manage</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isManageOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Manage Dropdown Menu */}
          {isManageOpen && (
            <>
              {/* Invisible Click-outside Backdrop */}
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsManageOpen(false)} 
              />

              {/* Menu Container */}
              <div className="absolute right-0 top-11 z-40 w-64 rounded-2xl bg-[#111827] border border-[#1e293b] shadow-2xl p-1.5 space-y-1 animate-scale-in">
                
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#1e293b]">
                  Upravljanje & Opcije
                </div>

                {/* 1. Obračun (Live financial settlement) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('dashboard');
                    setIsManageOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-[#013695] text-white'
                      : 'text-slate-200 hover:bg-[#151f33]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#FC661B]/20 text-[#FC661B] flex items-center justify-center shrink-0">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block">Obračun & Financije</span>
                      <span className="block text-[10px] font-normal text-slate-400">
                        Zarada i raspodjela timova
                      </span>
                    </div>
                  </div>
                  {activeTab === 'dashboard' ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>

                {/* 2. Uvoz (CSV / Google Sheets) */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenImport();
                    setIsManageOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold text-slate-200 hover:bg-[#151f33] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#013695]/30 text-blue-400 flex items-center justify-center shrink-0">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block">Uvoz gostiju</span>
                      <span className="block text-[10px] font-normal text-slate-400">
                        CSV ili Google Sheet link
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* 3. Zaključaj / Otvori event */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenCloseEvent();
                    setIsManageOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-colors ${
                    stats?.isClosed
                      ? 'text-amber-300 hover:bg-amber-950/30'
                      : 'text-red-300 hover:bg-red-950/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      stats?.isClosed 
                        ? 'bg-amber-500/20 text-amber-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {stats?.isClosed ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="block">
                        {stats?.isClosed ? 'Ponovno otvori event' : 'Zaključi event (Kraj)'}
                      </span>
                      <span className="block text-[10px] font-normal text-slate-400">
                        {stats?.isClosed ? 'Event je trenutno zaključen' : 'Brojanje gotovine & PIN'}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>

                <div className="border-t border-[#1e293b] pt-1" />

                {/* 4. Službeni PDF Izvještaj */}
                <Link
                  href="/report"
                  target="_blank"
                  onClick={() => setIsManageOpen(false)}
                  className="w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white hover:bg-[#151f33] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block">Službeni PDF izvještaj</span>
                      <span className="block text-[10px] font-normal text-slate-400">
                        A4 pregled, print & WhatsApp
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>

                <div className="border-t border-[#1e293b] pt-1" />

                {/* 5. Odjava / Zaključaj ekran */}
                <button
                  type="button"
                  onClick={() => {
                    setIsManageOpen(false);
                    onLogout();
                  }}
                  className="w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold text-red-400 hover:bg-red-950/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block">Odjava (Zaključaj)</span>
                      <span className="block text-[10px] font-normal text-slate-400">
                        Zahtijeva PIN za ponovni ulaz
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>

              </div>
            </>
          )}

        </div>

      </div>
    </header>
  );
}
