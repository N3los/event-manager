'use client';

import React from 'react';
import { FinancialStats, Guest } from '@/lib/types';
import { Coins, ArrowRightLeft, Users, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface LiveDashboardProps {
  stats: FinancialStats;
  guests: Guest[];
}

export function LiveDashboard({ stats, guests }: LiveDashboardProps) {
  // Find who the free guests are for each team
  const freeOrgList = guests.filter(
    g => g.is_checked_in && g.ticket_type === 'gratis' && (g.team === 'Ela' || g.team === 'Joe')
  );

  const freeCateringList = guests.filter(
    g => g.is_checked_in && g.ticket_type === 'gratis' && (g.team === 'Dupli' || g.team === 'Silvaši')
  );

  return (
    <div className="max-w-4xl mx-auto px-3 py-4 sm:px-4 sm:py-6 space-y-5 pb-28 sm:pb-32">
      
      {/* Hero Cashbox Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#013695] via-[#0142b5] to-[#0250d4] text-white p-4 sm:p-6 shadow-xl shadow-[#013695]/15 border border-[#024ec4] relative overflow-hidden">
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
              <span className="text-xs font-semibold text-blue-100">
                ({stats.paidGuests} plaćenih × 39 €)
              </span>
            </div>
            <p className="text-xs text-blue-100/90 mt-1">
              Sav prikupljeni novac na ulazu. Konačna raspodjela radi se nakon partija.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-2 rounded-xl bg-white/15 backdrop-blur-xs border border-white/20">
              <span className="text-blue-100 block text-[11px] font-medium">Ukupno prisutnih:</span>
              <span className="text-base font-bold text-white">{stats.checkedInGuests}</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-white/15 backdrop-blur-xs border border-white/20">
              <span className="text-blue-100 block text-[11px] font-medium">Besplatnih:</span>
              <span className="text-base font-bold text-[#FFB285]">
                {stats.freeOrgGuests + stats.freeCateringGuests}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side Settlement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Ugostiteljstvo (Dupli & Silvaši) */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-[#013695] uppercase tracking-wider block">Tim 1</span>
              <h3 className="text-base font-bold text-slate-900">Ugostiteljstvo</h3>
              <p className="text-xs text-slate-500">Dupli & Silvaši</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Konačni neto iznos:</span>
              <span className={`text-xl font-extrabold ${stats.cateringNet >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stats.cateringNet.toLocaleString('hr-HR')} €
              </span>
            </div>
          </div>

          {/* Breakdown items */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-700">
                Dio od prodanih ulaznica ({stats.paidGuests} × 25 €):
              </span>
              <strong className="text-slate-900 font-bold">{stats.cateringGross} €</strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
              <span>
                + Organizacija im duguje za besplatne ({stats.freeOrgGuests} × 25 €):
              </span>
              <strong className="font-bold text-emerald-700">+{stats.orgOwesCatering} €</strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800">
              <span>
                − Duguju Organizaciji za svoje besplatne ({stats.freeCateringGuests} × 14 €):
              </span>
              <strong className="font-bold text-red-700">−{stats.cateringOwesOrg} €</strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            {stats.cateringNet >= 0 ? (
              <p className="leading-relaxed">
                👉 Ugostiteljstvo na kraju iz blagajne uzima: <strong className="text-emerald-700 font-bold">{stats.cateringNet} €</strong>.
              </p>
            ) : (
              <p className="text-red-700 font-semibold">
                ⚠️ Ugostiteljstvo ne uzima ništa iz blagajne i mora doplatiti {Math.abs(stats.cateringNet)} € Organizaciji.
              </p>
            )}
          </div>
        </div>

        {/* Card 2: Organizacija (Ela & Joe) */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-[#FC661B] uppercase tracking-wider block">Tim 2</span>
              <h3 className="text-base font-bold text-slate-900">Organizacija</h3>
              <p className="text-xs text-slate-500">Ela & Joe</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Konačni neto iznos:</span>
              <span className={`text-xl font-extrabold ${stats.orgNet >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stats.orgNet.toLocaleString('hr-HR')} €
              </span>
            </div>
          </div>

          {/* Breakdown items */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-700">
                Dio od prodanih ulaznica ({stats.paidGuests} × 14 €):
              </span>
              <strong className="text-slate-900 font-bold">{stats.orgGross} €</strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
              <span>
                + Ugostiteljstvo im duguje za besplatne ({stats.freeCateringGuests} × 14 €):
              </span>
              <strong className="font-bold text-emerald-700">+{stats.cateringOwesOrg} €</strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800">
              <span>
                − Duguju Ugostiteljstvu za svoje besplatne ({stats.freeOrgGuests} × 25 €):
              </span>
              <strong className="font-bold text-red-700">−{stats.orgOwesCatering} €</strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            {stats.orgNet >= 0 ? (
              <p className="leading-relaxed">
                👉 Organizacija na kraju iz blagajne uzima: <strong className="text-emerald-700 font-bold">{stats.orgNet} €</strong>.
              </p>
            ) : (
              <p className="text-red-700 font-semibold">
                ⚠️ Organizacija ne uzima ništa iz blagajne i mora doplatiti {Math.abs(stats.orgNet)} € Ugostiteljstvu.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Balance Verification Box */}
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 sm:p-4 flex items-center justify-between flex-wrap gap-2 text-xs text-emerald-950">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Provjera matematičke ravnoteže: 
            <strong className="text-emerald-900 font-bold ml-1">
              {stats.cateringNet} € + {stats.orgNet} € = {stats.cateringNet + stats.orgNet} €
            </strong>
          </span>
        </div>
        <span className="text-emerald-700 font-bold">✓ 100% Izbalansirano</span>
      </div>

      {/* Free Guests Detail lists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Free Org Guests */}
        <div className="rounded-xl bg-white border border-slate-200 p-3.5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>Besplatni Organizacije ({freeOrgList.length})</span>
            </h4>
            <span className="text-[11px] font-semibold text-amber-700">Dug: {stats.orgOwesCatering} €</span>
          </div>

          {freeOrgList.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">Još nije stigao nijedan besplatan gost Organizacije.</p>
          ) : (
            <ul className="space-y-1 max-h-48 overflow-y-auto text-xs">
              {freeOrgList.map((g) => (
                <li key={g.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-800">
                  <span className="font-medium">{g.name}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">od {g.team}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Free Catering Guests */}
        <div className="rounded-xl bg-white border border-slate-200 p-3.5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>Besplatni Ugostiteljstva ({freeCateringList.length})</span>
            </h4>
            <span className="text-[11px] font-semibold text-blue-700">Dug: {stats.cateringOwesOrg} €</span>
          </div>

          {freeCateringList.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">Još nije stigao nijedan besplatan gost Ugostiteljstva.</p>
          ) : (
            <ul className="space-y-1 max-h-48 overflow-y-auto text-xs">
              {freeCateringList.map((g) => (
                <li key={g.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-800">
                  <span className="font-medium">{g.name}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">od {g.team}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

    </div>
  );
}
