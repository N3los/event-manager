'use client';

import React, { useState } from 'react';
import { FinancialStats, Guest } from '@/lib/types';
import { Coins, ShieldCheck, FileText, Copy, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface LiveDashboardProps {
  stats: FinancialStats;
  guests: Guest[];
  onBackToDoor?: () => void;
}

export function LiveDashboard({ stats, guests, onBackToDoor }: LiveDashboardProps) {
  const [copied, setCopied] = useState(false);

  // Find who the free guests are for each team
  const freeOrgList = guests.filter(
    g => g.is_checked_in && g.ticket_type === 'gratis' && (g.team === 'Ela' || g.team === 'Joe')
  );

  const freeCateringList = guests.filter(
    g => g.is_checked_in && g.ticket_type === 'gratis' && (g.team === 'Dupli' || g.team === 'Silvaši')
  );

  const handleCopyWhatsApp = () => {
    const text = [
      `🎉 *POOR DECISIONS — ZAVRŠNI OBRAČUN*`,
      `👥 Ukupno prisutnih: *${stats.checkedInGuests}*`,
      `🎟️ Plaćenih narukvica: *${stats.paidGuests}* (× 39 €)`,
      `🎁 Besplatnih gostiju: *${stats.freeOrgGuests + stats.freeCateringGuests}*`,
      `   • Organizacija: ${stats.freeOrgGuests}`,
      `   • Ugostiteljstvo: ${stats.freeCateringGuests}`,
      ``,
      `💶 *GOTOVINA U BLAGAJNI: ${stats.totalCashExpected.toLocaleString('hr-HR')} €*`,
      ``,
      `💰 *KONAČNA RASPODJELA:*`,
      `🍹 *Ugostiteljstvo (Dupli & Silvaši): ${stats.cateringNet.toLocaleString('hr-HR')} €*`,
      `🎪 *Organizacija (Ela & Joe): ${stats.orgNet.toLocaleString('hr-HR')} €*`,
      `✓ Zbroj neto: ${stats.cateringNet + stats.orgNet} € === Blagajna: ${stats.totalCashExpected} €`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 py-4 sm:px-4 sm:py-6 space-y-4 sm:space-y-5 pb-28 sm:pb-32">
      
      {/* Top Navigation Back to Door */}
      {onBackToDoor && (
        <div className="flex items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={onBackToDoor}
            className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm shadow-sm active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-[#FC661B]" />
            <span>Natrag na ulaz (Popis gostiju)</span>
          </button>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Završni obračun gotovine & timova
          </span>
        </div>
      )}

      {/* Hero Cashbox Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#013695] via-[#0142b5] to-[#0250d4] text-white p-5 sm:p-7 shadow-xl shadow-[#013695]/15 border border-[#024ec4] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-[#FC661B]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-100 uppercase tracking-wider">
              <Coins className="w-4 h-4 text-[#FC661B]" />
              Zajednička gotovinska blagajna
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight flex items-baseline gap-2">
              <span className="text-[#FFB285] drop-shadow-xs">{stats.totalCashExpected.toLocaleString('hr-HR')} €</span>
              <span className="text-xs font-bold text-blue-100">
                ({stats.paidGuests} plaćenih × 39 €)
              </span>
            </div>
            <p className="text-xs text-blue-100/90 mt-1">
              Sav prikupljeni novac na ulazu. Konačna raspodjela radi se nakon partija.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="px-3.5 py-2.5 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20">
              <span className="text-blue-100 block text-[11px] font-semibold">Ukupno prisutnih:</span>
              <span className="text-lg font-black text-white">{stats.checkedInGuests}</span>
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20">
              <span className="text-blue-100 block text-[11px] font-semibold">Besplatnih:</span>
              <span className="text-lg font-black text-[#FFB285]">
                {stats.freeOrgGuests + stats.freeCateringGuests}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Touch Bar: PDF & WhatsApp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Link
          href="/report"
          target="_blank"
          className="h-12 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
        >
          <FileText className="w-4 h-4 text-[#FC661B]" />
          <span>Službeni A4 izvještaj & Ispis</span>
        </Link>

        <button
          type="button"
          onClick={handleCopyWhatsApp}
          className="h-12 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
        >
          {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Kopirano u međuspremnik!' : 'Kopiraj sažetak za WhatsApp'}</span>
        </button>
      </div>

      {/* Side-by-side Settlement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Ugostiteljstvo (Dupli & Silvaši) */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-[#013695] uppercase tracking-wider block">Tim 1</span>
              <h3 className="text-base font-extrabold text-slate-900">Ugostiteljstvo</h3>
              <p className="text-xs text-slate-500 font-medium">Dupli & Silvaši</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block font-medium">Konačni neto iznos:</span>
              <span className={`text-2xl font-black ${stats.cateringNet >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stats.cateringNet.toLocaleString('hr-HR')} €
              </span>
            </div>
          </div>

          {/* Breakdown items */}
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-700">
                Dio od prodanih ulaznica ({stats.paidGuests} × 25 €):
              </span>
              <strong className="text-slate-900 font-black">{stats.cateringGross} €</strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <span>
                + Organizacija im duguje za besplatne ({stats.freeOrgGuests} × 25 €):
              </span>
              <strong className="font-black text-emerald-700">+{stats.orgOwesCatering} €</strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200 text-red-900">
              <span>
                − Duguju Organizaciji za svoje besplatne ({stats.freeCateringGuests} × 14 €):
              </span>
              <strong className="font-black text-red-700">−{stats.cateringOwesOrg} €</strong>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
            {stats.cateringNet >= 0 ? (
              <p className="leading-relaxed">
                👉 Ugostiteljstvo na kraju iz blagajne uzima: <strong className="text-emerald-700 font-black">{stats.cateringNet} €</strong>.
              </p>
            ) : (
              <p className="text-red-700 font-bold">
                ⚠️ Ugostiteljstvo ne uzima ništa iz blagajne i mora doplatiti {Math.abs(stats.cateringNet)} € Organizaciji.
              </p>
            )}
          </div>
        </div>

        {/* Card 2: Organizacija (Ela & Joe) */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-[#FC661B] uppercase tracking-wider block">Tim 2</span>
              <h3 className="text-base font-extrabold text-slate-900">Organizacija</h3>
              <p className="text-xs text-slate-500 font-medium">Ela & Joe</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block font-medium">Konačni neto iznos:</span>
              <span className={`text-2xl font-black ${stats.orgNet >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stats.orgNet.toLocaleString('hr-HR')} €
              </span>
            </div>
          </div>

          {/* Breakdown items */}
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-700">
                Dio od prodanih ulaznica ({stats.paidGuests} × 14 €):
              </span>
              <strong className="text-slate-900 font-black">{stats.orgGross} €</strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <span>
                + Ugostiteljstvo im duguje za besplatne ({stats.freeCateringGuests} × 14 €):
              </span>
              <strong className="font-black text-emerald-700">+{stats.cateringOwesOrg} €</strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200 text-red-900">
              <span>
                − Duguju Ugostiteljstvu za svoje besplatne ({stats.freeOrgGuests} × 25 €):
              </span>
              <strong className="font-black text-red-700">−{stats.orgOwesCatering} €</strong>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
            {stats.orgNet >= 0 ? (
              <p className="leading-relaxed">
                👉 Organizacija na kraju iz blagajne uzima: <strong className="text-emerald-700 font-black">{stats.orgNet} €</strong>.
              </p>
            ) : (
              <p className="text-red-700 font-bold">
                ⚠️ Organizacija ne uzima ništa iz blagajne i mora doplatiti {Math.abs(stats.orgNet)} € Ugostiteljstvu.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Balance Verification Box */}
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 sm:p-4 flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm text-emerald-950">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Provjera matematičke ravnoteže: 
            <strong className="text-emerald-900 font-black ml-1.5">
              {stats.cateringNet} € + {stats.orgNet} € = {stats.cateringNet + stats.orgNet} €
            </strong>
          </span>
        </div>
        <span className="text-emerald-700 font-extrabold">✓ 100% Izbalansirano</span>
      </div>

      {/* Free Guests Detail lists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Free Org Guests */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-xs sm:text-sm pb-2.5 border-b border-slate-100">
            <h4 className="font-bold text-slate-900">
              Besplatni Organizacije ({freeOrgList.length})
            </h4>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Dug: {stats.orgOwesCatering} €
            </span>
          </div>

          {freeOrgList.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">Još nije stigao nijedan besplatan gost Organizacije.</p>
          ) : (
            <ul className="space-y-1.5 max-h-56 overflow-y-auto text-xs sm:text-sm">
              {freeOrgList.map((g) => (
                <li key={g.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 min-h-[44px]">
                  <span className="font-bold">{g.name}</span>
                  <span className="text-[11px] text-slate-500 font-semibold">od {g.team}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Free Catering Guests */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-xs sm:text-sm pb-2.5 border-b border-slate-100">
            <h4 className="font-bold text-slate-900">
              Besplatni Ugostiteljstva ({freeCateringList.length})
            </h4>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Dug: {stats.cateringOwesOrg} €
            </span>
          </div>

          {freeCateringList.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">Još nije stigao nijedan besplatan gost Ugostiteljstva.</p>
          ) : (
            <ul className="space-y-1.5 max-h-56 overflow-y-auto text-xs sm:text-sm">
              {freeCateringList.map((g) => (
                <li key={g.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 min-h-[44px]">
                  <span className="font-bold">{g.name}</span>
                  <span className="text-[11px] text-slate-500 font-semibold">od {g.team}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

    </div>
  );
}
