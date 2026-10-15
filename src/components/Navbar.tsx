'use client';

import React, { useState } from 'react';
import { FinancialStats } from '@/lib/types';
import {
  RefreshCw, SlidersHorizontal, ChevronDown,
  Coins, Upload, Lock, Unlock, FileText, Check, ArrowRight, LogOut, ArrowLeft
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 py-2 sm:px-6 relative shadow-xs">

      {/* Top subtle active loading progress line */}
      {isRefreshing && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FC661B] to-transparent animate-pulse" />
      )}

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">

        {/* Brand & Left Info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-slate-200 shadow-2xs shrink-0 bg-white">
              <img
                src="/day_drinking_logo.jpeg"
                alt="Poor Decisions Day Drinking Society"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 leading-tight">
                  POOR DECISIONS
                </span>
                {stats?.isClosed && (
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 shrink-0">
                    ZAKLJUČENO
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase hidden xs:inline">
                Day Drinking Society
              </span>
            </div>
          </div>

          {/* Cash counter status - visible on sm+ screens */}
          {stats && (
            <div
              title="Trenutno stanje gotovinske blagajne"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold shrink-0 shadow-2xs"
            >
              <Coins className="w-3.5 h-3.5 text-[#FC661B]" />
              <span className="text-slate-500 font-medium text-[11px]">Blagajna:</span>
              <span className="text-slate-900 font-extrabold">{stats.totalCashExpected} €</span>
            </div>
          )}
        </div>

        {/* Right Actions: Back to door (if in dashboard) + Refresh + Manage Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 relative">

          {/* If activeTab === 'dashboard', show quick back button */}
          {activeTab === 'dashboard' && (
            <button
              type="button"
              onClick={() => setActiveTab('door')}
              className="h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-[#FC661B]" />
              <span className="hidden xs:inline">Natrag na ulaz</span>
              <span className="xs:hidden">Ulaz</span>
            </button>
          )}

          {/* Refresh Action */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing || isLoading}
            aria-label="Osvježi podatke"
            title={justRefreshed ? 'Osvježeno!' : 'Osvježi podatke'}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center transition-all active:scale-95 shrink-0 ${
              isRefreshing
                ? 'bg-orange-50 border-[#FC661B]/60 text-[#FC661B]'
                : justRefreshed
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
            }`}
          >
            {justRefreshed ? (
              <Check className="w-4 h-4 text-emerald-600 stroke-[3] animate-fade-in" />
            ) : (
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#FC661B]' : 'text-slate-600'}`} />
            )}
          </button>

          {/* Manage Menu Trigger Button */}
          <button
            type="button"
            onClick={() => setIsManageOpen(!isManageOpen)}
            aria-expanded={isManageOpen}
            aria-haspopup="menu"
            className={`h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition-all active:scale-95 shrink-0 ${
              isManageOpen
                ? 'bg-[#013695] text-white border-[#024ec4] shadow-md shadow-[#013695]/20 ring-2 ring-[#013695]/20'
                : activeTab === 'dashboard'
                  ? 'bg-blue-50 border-blue-200 text-[#013695]'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-[#FC661B]" />
            <span>Manage</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isManageOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Manage Dropdown Menu */}
          {isManageOpen && (
            <>
              {/* Click-outside Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[1px]"
                onClick={() => setIsManageOpen(false)}
              />

              {/* Menu Container */}
              <div 
                role="menu"
                className="absolute right-0 top-12 sm:top-13 z-50 w-72 sm:w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl ring-1 ring-slate-900/5 p-2 space-y-2 animate-scale-in"
              >

                {/* Header info */}
                <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                      Upravljanje
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Postavke & završni obračun
                    </span>
                  </div>
                  {stats && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#013695]/10 text-[#013695] text-xs font-black">
                      <Coins className="w-3 h-3 text-[#FC661B]" />
                      <span>{stats.totalCashExpected} €</span>
                    </div>
                  )}
                </div>

                {/* Section 1: Kraj eventa (Obračun) */}
                <div className="space-y-1">
                  <div className="px-2 pt-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Kraj eventa (Završno)
                  </div>

                  {/* 1. Obračun (Live financial settlement) */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setActiveTab('dashboard');
                      setIsManageOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-all group ${
                      activeTab === 'dashboard'
                        ? 'bg-[#013695] text-white shadow-sm'
                        : 'text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        activeTab === 'dashboard'
                          ? 'bg-white/20 text-white'
                          : 'bg-[#FC661B]/15 text-[#FC661B]'
                      }`}>
                        <Coins className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate">Obračun & Financije</span>
                        <span className={`block text-[10px] font-normal truncate ${
                          activeTab === 'dashboard' ? 'text-white/80' : 'text-slate-500'
                        }`}>
                          Konačna zarada i raspodjela
                        </span>
                      </div>
                    </div>
                    {activeTab === 'dashboard' ? (
                      <Check className="w-4 h-4 text-white shrink-0" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                    )}
                  </button>

                  {/* 2. Zaključi event */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onOpenCloseEvent();
                      setIsManageOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-colors group ${
                      stats?.isClosed
                        ? 'text-amber-700 hover:bg-amber-50'
                        : 'text-red-700 hover:bg-red-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        stats?.isClosed
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {stats?.isClosed ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate">
                          {stats?.isClosed ? 'Ponovno otvori event' : 'Zaključi event'}
                        </span>
                        <span className="block text-[10px] font-normal text-slate-500 truncate">
                          {stats?.isClosed ? 'Event je trenutno zaključen' : 'Brojanje gotovine & PIN'}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>

                  {/* 3. Službeni PDF Izvještaj */}
                  <Link
                    href="/report"
                    target="_blank"
                    role="menuitem"
                    onClick={() => setIsManageOpen(false)}
                    className="w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate">Službeni PDF izvještaj</span>
                        <span className="block text-[10px] font-normal text-slate-500 truncate">
                          A4 pregled, print & WhatsApp
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                </div>

                <div className="border-t border-slate-100" />

                {/* Section 2: Priprema i alati */}
                <div className="space-y-1">
                  <div className="px-2 pt-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Postavke & Podaci
                  </div>

                  {/* 4. Uvoz (CSV / Google Sheets) */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onOpenImport();
                      setIsManageOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#013695]/10 text-[#013695] flex items-center justify-center shrink-0">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate">Uvoz popisa gostiju</span>
                        <span className="block text-[10px] font-normal text-slate-500 truncate">
                          CSV ili Google Sheet link
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                </div>

                <div className="border-t border-slate-100" />

                {/* Section 3: Odjava */}
                <div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsManageOpen(false);
                      onLogout();
                    }}
                    className="w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold text-red-600 hover:bg-red-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate">Odjava (Zaključaj)</span>
                        <span className="block text-[10px] font-normal text-slate-500 truncate">
                          Zahtijeva PIN za ponovni ulaz
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                </div>

              </div>
            </>
          )}

        </div>

      </div>
    </header>
  );
}
