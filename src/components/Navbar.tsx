'use client';

import React, { useState } from 'react';
import { FinancialStats } from '@/lib/types';
import {
  RefreshCw, SlidersHorizontal, ChevronDown,
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 py-2.5 sm:px-6 relative shadow-xs">

      {/* Top subtle active loading progress line */}
      {isRefreshing && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FC661B] to-transparent animate-pulse" />
      )}

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">

        {/* Brand & Cash Counter */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-slate-200 shadow-2xs shrink-0 bg-white">
              <img
                src="/day_drinking_logo.jpeg"
                alt="Poor Decisions Day Drinking Society"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 leading-none truncate flex items-center gap-1.5">
              <span>POOR <br /> DECISIONS</span>
              {stats?.isClosed && (
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 shrink-0">
                  ZAKLJUČENO
                </span>
              )}
            </h1>
          </div>

          {/* Cash Counter - Quick link to finances */}
          {stats && (
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              title="Otvori obračun blagajne"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#013695]/10 hover:bg-[#013695]/15 border border-[#013695]/20 text-[#013695] text-xs font-extrabold shrink-0 transition-colors active:scale-95 shadow-xs"
            >
              <Coins className="w-3.5 h-3.5 text-[#FC661B]" />
              <span>{stats.totalCashExpected} €</span>
            </button>
          )}
        </div>

        {/* Right Actions: Refresh + Manage Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2 relative">

          {/* Refresh Action */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing || isLoading}
            title={justRefreshed ? 'Osvježeno!' : 'Osvježi podatke'}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${isRefreshing
              ? 'bg-orange-50 border-[#FC661B]/60 text-[#FC661B]'
              : justRefreshed
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
          >
            {justRefreshed ? (
              <Check className="w-4 h-4 text-emerald-600 stroke-[3] animate-fade-in" />
            ) : (
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#FC661B]' : ''}`} />
            )}
          </button>

          {/* Manage Menu Trigger Button */}
          <button
            type="button"
            onClick={() => setIsManageOpen(!isManageOpen)}
            className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${isManageOpen || activeTab === 'dashboard'
              ? 'bg-[#013695] text-white border-[#024ec4] shadow-md shadow-[#013695]/20'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
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
              <div className="absolute right-0 top-11 z-40 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl p-1.5 space-y-1 animate-scale-in">

                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Upravljanje & Opcije
                </div>

                {/* 1. Obračun (Live financial settlement) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('dashboard');
                    setIsManageOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-all ${activeTab === 'dashboard'
                    ? 'bg-[#013695] text-white'
                    : 'text-slate-800 hover:bg-slate-100'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#FC661B]/15 text-[#FC661B] flex items-center justify-center shrink-0">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block">Obračun & Financije</span>
                      <span className={`block text-[10px] font-normal ${activeTab === 'dashboard' ? 'text-white/80' : 'text-slate-500'}`}>
                        Zarada i raspodjela timova
                      </span>
                    </div>
                  </div>
                  {activeTab === 'dashboard' ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {/* 2. Uvoz (CSV / Google Sheets) */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenImport();
                    setIsManageOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#013695]/10 text-[#013695] flex items-center justify-center shrink-0">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block">Uvoz gostiju</span>
                      <span className="block text-[10px] font-normal text-slate-500">
                        CSV ili Google Sheet link
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* 3. Zaključaj / Otvori event */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenCloseEvent();
                    setIsManageOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-colors ${stats?.isClosed
                    ? 'text-amber-700 hover:bg-amber-50'
                    : 'text-red-700 hover:bg-red-50'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${stats?.isClosed
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                      }`}>
                      {stats?.isClosed ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="block">
                        {stats?.isClosed ? 'Ponovno otvori event' : 'Zaključi event (Kraj)'}
                      </span>
                      <span className="block text-[10px] font-normal text-slate-500">
                        {stats?.isClosed ? 'Event je trenutno zaključen' : 'Brojanje gotovine & PIN'}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <div className="border-t border-slate-100 pt-1" />

                {/* 4. Službeni PDF Izvještaj */}
                <Link
                  href="/report"
                  target="_blank"
                  onClick={() => setIsManageOpen(false)}
                  className="w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block">Službeni PDF izvještaj</span>
                      <span className="block text-[10px] font-normal text-slate-500">
                        A4 pregled, print & WhatsApp
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <div className="border-t border-slate-100 pt-1" />

                {/* 5. Odjava / Zaključaj ekran */}
                <button
                  type="button"
                  onClick={() => {
                    setIsManageOpen(false);
                    onLogout();
                  }}
                  className="w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block">Odjava (Zaključaj)</span>
                      <span className="block text-[10px] font-normal text-slate-500">
                        Zahtijeva PIN za ponovni ulaz
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

              </div>
            </>
          )}

        </div>

      </div>
    </header>
  );
}
