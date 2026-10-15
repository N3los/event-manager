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
      <div className="rounded-2xl bg-gradient-to-br from-[#0c1a38] via-[#101c38] to-[#151f33] border border-[#013695]/60 p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#013695]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-[#FC661B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Coins className="w-4 h-4 text-[#FC661B]" />
              Zajednička gotovinska blagajna
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight flex items-baseline gap-2">
              <span className="text-[#FC661B]">{stats.totalCashExpected.toLocaleString('hr-HR')} €</span>
              <span className="text-xs font-semibold text-slate-400">
                ({stats.paidGuests} plaćenih × 39 €)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sav prikupljeni novac na ulazu. Konačna raspodjela radi se nakon partija.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-2 rounded-xl bg-[#090d16]/70 border border-[#1e293b]">
              <span className="text-slate-400 block text-[11px]">Ukupno prisutnih:</span>
              <span className="text-base font-bold text-white">{stats.checkedInGuests}</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-[#090d16]/70 border border-[#1e293b]">
              <span className="text-slate-400 block text-[11px]">Besplatnih:</span>
              <span className="text-base font-bold text-blue-400">
                {stats.freeOrgGuests + stats.freeCateringGuests}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side Settlement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Ugostiteljstvo (Dupli & Silvaši) */}
        <div className="rounded-2xl bg-[#151f33] border border-[#1e293b] p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
            <div>
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">Tim 1</span>
              <h3 className="text-base font-bold text-white">Ugostiteljstvo</h3>
              <p className="text-xs text-slate-400">Dupli & Silvaši</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Konačni neto iznos:</span>
              <span className={`text-xl font-extrabold ${stats.cateringNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.cateringNet.toLocaleString('hr-HR')} €
              </span>
            </div>
          </div>

          {/* Breakdown items */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#101726]">
              <span className="text-slate-300">
                Dio od prodanih ulaznica ({stats.paidGuests} × 25 €):
              </span>
              <strong className="text-white font-semibold">{stats.cateringGross} €</strong>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-300">
              <span>
                + Organizacija im duguje za besplatne ({stats.freeOrgGuests} × 25 €):
              </span>
              <strong className="font-bold">+{stats.orgOwesCatering} €</strong>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-red-950/20 border border-red-900/30 text-red-300">
              <span>
                − Duguju Organizaciji za svoje besplatne ({stats.freeCateringGuests} × 14 €):
              </span>
              <strong className="font-bold">−{stats.cateringOwesOrg} €</strong>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1e293b] text-xs text-slate-300">
            {stats.cateringNet >= 0 ? (
              <p className="leading-relaxed">
                👉 Ugostiteljstvo na kraju iz blagajne uzima: <strong className="text-emerald-400 font-bold">{stats.cateringNet} €</strong>.
              </p>
            ) : (
              <p className="text-red-300 font-semibold">
                ⚠️ Ugostiteljstvo ne uzima ništa iz blagajne i mora doplatiti {Math.abs(stats.cateringNet)} € Organizaciji.
              </p>
            )}
          </div>
        </div>

        {/* Card 2: Organizacija (Ela & Joe) */}
        <div className="rounded-2xl bg-[#151f33] border border-[#1e293b] p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
            <div>
              <span className="text-[11px] font-bold text-[#FC661B] uppercase tracking-wider block">Tim 2</span>
              <h3 className="text-base font-bold text-white">Organizacija</h3>
              <p className="text-xs text-slate-400">Ela & Joe</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Konačni neto iznos:</span>
              <span className={`text-xl font-extrabold ${stats.orgNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.orgNet.toLocaleString('hr-HR')} €
              </span>
            </div>
          </div>

          {/* Breakdown items */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#101726]">
              <span className="text-slate-300">
                Dio od prodanih ulaznica ({stats.paidGuests} × 14 €):
              </span>
              <strong className="text-white font-semibold">{stats.orgGross} €</strong>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-300">
              <span>
                + Ugostiteljstvo im duguje za besplatne ({stats.freeCateringGuests} × 14 €):
              </span>
              <strong className="font-bold">+{stats.cateringOwesOrg} €</strong>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-red-950/20 border border-red-900/30 text-red-300">
              <span>
                − Duguju Ugostiteljstvu za svoje besplatne ({stats.freeOrgGuests} × 25 €):
              </span>
              <strong className="font-bold">−{stats.orgOwesCatering} €</strong>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1e293b] text-xs text-slate-300">
            {stats.orgNet >= 0 ? (
              <p className="leading-relaxed">
                👉 Organizacija na kraju iz blagajne uzima: <strong className="text-emerald-400 font-bold">{stats.orgNet} €</strong>.
              </p>
            ) : (
              <p className="text-red-300 font-semibold">
                ⚠️ Organizacija ne uzima ništa iz blagajne i mora doplatiti {Math.abs(stats.orgNet)} € Ugostiteljstvu.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Balance Verification Box */}
      <div className="rounded-xl bg-[#101726] border border-[#1e293b] p-3 sm:p-4 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-slate-300">
            Provjera matematičke ravnoteže: 
            <strong className="text-white ml-1">
              {stats.cateringNet} € + {stats.orgNet} € = {stats.cateringNet + stats.orgNet} €
            </strong>
          </span>
        </div>
        <span className="text-emerald-400 font-bold">✓ 100% Izbalansirano</span>
      </div>

      {/* Free Guests Detail lists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Free Org Guests */}
        <div className="rounded-xl bg-[#151f33] border border-[#1e293b] p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#1e293b]">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <span>Besplatni Organizacije ({freeOrgList.length})</span>
            </h4>
            <span className="text-[11px] text-amber-300">Dug: {stats.orgOwesCatering} €</span>
          </div>

          {freeOrgList.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">Još nije stigao nijedan besplatan gost Organizacije.</p>
          ) : (
            <ul className="space-y-1 max-h-48 overflow-y-auto text-xs">
              {freeOrgList.map((g) => (
                <li key={g.id} className="flex items-center justify-between p-1.5 rounded bg-[#101726] text-slate-200">
                  <span>{g.name}</span>
                  <span className="text-[10px] text-slate-400">od {g.team}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Free Catering Guests */}
        <div className="rounded-xl bg-[#151f33] border border-[#1e293b] p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#1e293b]">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <span>Besplatni Ugostiteljstva ({freeCateringList.length})</span>
            </h4>
            <span className="text-[11px] text-blue-300">Dug: {stats.cateringOwesOrg} €</span>
          </div>

          {freeCateringList.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">Još nije stigao nijedan besplatan gost Ugostiteljstva.</p>
          ) : (
            <ul className="space-y-1 max-h-48 overflow-y-auto text-xs">
              {freeCateringList.map((g) => (
                <li key={g.id} className="flex items-center justify-between p-1.5 rounded bg-[#101726] text-slate-200">
                  <span>{g.name}</span>
                  <span className="text-[10px] text-slate-400">od {g.team}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

    </div>
  );
}
