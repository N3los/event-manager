'use client';

import React from 'react';
import { FinancialStats, EventMeta, Guest } from '@/lib/types';

interface PrintableReportProps {
  stats: FinancialStats;
  meta: EventMeta | null;
  guests: Guest[];
}

export function PrintableReport({ stats, meta, guests }: PrintableReportProps) {
  const checkedInList = guests.filter((g) => g.is_checked_in);
  const now = new Date();
  const formattedDate = now.toLocaleDateString('hr-HR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('hr-HR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const actualCash =
    stats.actualCashCounted !== null && stats.actualCashCounted !== undefined
      ? stats.actualCashCounted
      : stats.totalCashExpected;

  const difference = stats.cashDifference ?? (actualCash - stats.totalCashExpected);

  return (
    <div className="w-full bg-white text-slate-900 p-8 font-sans print:p-0">
      
      {/* Report Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
            {meta?.name || 'POOR DECISIONS'}
          </h1>
          <p className="text-sm font-bold text-slate-700 tracking-wide mt-0.5">
            ZAVRŠNI FINANCIJSKI OBRAČUN & EVIDENCIJA NARUKVICA
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Datum zaključenja: <strong>{formattedDate}</strong> u <strong>{formattedTime}</strong> sati
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded">
            Službeni zapisnik
          </span>
          <p className="text-xs text-slate-500 mt-1.5">
            Ulaznica: <strong>39,00 €</strong> (25 € Ugostiteljstvo / 14 € Organizacija)
          </p>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3.5 rounded-lg border-2 border-slate-900 bg-slate-50">
          <span className="text-[11px] font-bold uppercase text-slate-600 block">
            Zajednička blagajna (Gotovina)
          </span>
          <span className="text-2xl font-black text-slate-950 block mt-1">
            {stats.totalCashExpected.toLocaleString('hr-HR')} €
          </span>
          <span className="text-[11px] text-slate-600">
            {stats.paidGuests} plaćenih narukvica × 39 €
          </span>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-50">
          <span className="text-[11px] font-bold uppercase text-slate-600 block">
            Ugostiteljstvo Neto
          </span>
          <span className="text-2xl font-black text-slate-950 block mt-1">
            {stats.cateringNet.toLocaleString('hr-HR')} €
          </span>
          <span className="text-[11px] text-slate-600">
            Dupli & Silvaši
          </span>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-50">
          <span className="text-[11px] font-bold uppercase text-slate-600 block">
            Organizacija Neto
          </span>
          <span className="text-2xl font-black text-slate-950 block mt-1">
            {stats.orgNet.toLocaleString('hr-HR')} €
          </span>
          <span className="text-[11px] text-slate-600">
            Ela & Joe
          </span>
        </div>
      </div>

      {/* Mathematical Settlement Table */}
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-300 pb-1">
          Specifikacija obračuna i međusobnih dugovanja
        </h2>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
              <th className="py-2 px-3 text-left font-bold">Stavka obračuna</th>
              <th className="py-2 px-3 text-right font-bold">Ugostiteljstvo</th>
              <th className="py-2 px-3 text-right font-bold">Organizacija</th>
              <th className="py-2 px-3 text-right font-bold">Ukupno blagajna</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="py-2 px-3">
                Redovni dio od prodanih ulaznica ({stats.paidGuests} plaćenih × 25 € / 14 €)
              </td>
              <td className="py-2 px-3 text-right font-semibold">{stats.cateringGross.toLocaleString('hr-HR')} €</td>
              <td className="py-2 px-3 text-right font-semibold">{stats.orgGross.toLocaleString('hr-HR')} €</td>
              <td className="py-2 px-3 text-right font-bold">{stats.totalCashExpected.toLocaleString('hr-HR')} €</td>
            </tr>
            <tr>
              <td className="py-2 px-3">
                Dug Organizacije za besplatne goste ({stats.freeOrgGuests} os. [Ela/Joe] × 25 €)
              </td>
              <td className="py-2 px-3 text-right font-semibold text-emerald-700">+{stats.orgOwesCatering} €</td>
              <td className="py-2 px-3 text-right font-semibold text-red-700">−{stats.orgOwesCatering} €</td>
              <td className="py-2 px-3 text-right font-medium text-slate-400">0,00 €</td>
            </tr>
            <tr>
              <td className="py-2 px-3">
                Dug Ugostiteljstva za besplatne goste ({stats.freeCateringGuests} os. [Dupli/Silvaši] × 14 €)
              </td>
              <td className="py-2 px-3 text-right font-semibold text-red-700">−{stats.cateringOwesOrg} €</td>
              <td className="py-2 px-3 text-right font-semibold text-emerald-700">+{stats.cateringOwesOrg} €</td>
              <td className="py-2 px-3 text-right font-medium text-slate-400">0,00 €</td>
            </tr>
            <tr className="bg-slate-50 border-t-2 border-slate-900 font-bold">
              <td className="py-2.5 px-3 uppercase text-slate-900">
                KONAČNI NETO IZNOS ZA PREUZIMANJE IZ BLAGAJNE
              </td>
              <td className="py-2.5 px-3 text-right text-sm text-slate-950 font-black">
                {stats.cateringNet.toLocaleString('hr-HR')} €
              </td>
              <td className="py-2.5 px-3 text-right text-sm text-slate-950 font-black">
                {stats.orgNet.toLocaleString('hr-HR')} €
              </td>
              <td className="py-2.5 px-3 text-right text-sm text-slate-950 font-black">
                {stats.totalCashExpected.toLocaleString('hr-HR')} €
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Cashbox Count vs System Log */}
      <div className="mb-6 p-4 rounded-lg border border-slate-300 bg-slate-50 text-xs">
        <h2 className="font-bold text-slate-900 uppercase tracking-wider mb-2">
          Stanje gotovine u blagajni pri zaključenju
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="text-slate-500 block">Evidentirani iznos:</span>
            <strong className="text-sm text-slate-900">{stats.totalCashExpected.toLocaleString('hr-HR')} €</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Stvarno prebrojano:</span>
            <strong className="text-sm text-slate-900">{actualCash.toLocaleString('hr-HR')} €</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Razlika (Manjak / Višak):</span>
            <strong className={`text-sm ${difference === 0 ? 'text-emerald-700' : difference < 0 ? 'text-red-700' : 'text-blue-700'}`}>
              {difference === 0 ? '0,00 € (Savršen balans)' : `${difference > 0 ? `+${difference}` : difference} €`}
            </strong>
          </div>
        </div>
        {meta?.closed_notes && (
          <p className="mt-2 text-slate-600 border-t border-slate-200 pt-2 italic">
            Napomena pri zaključivanju: "{meta.closed_notes}"
          </p>
        )}
      </div>

      {/* Summary of People */}
      <div className="mb-6 grid grid-cols-4 gap-2 text-center text-xs border border-slate-200 rounded p-2.5 bg-slate-50">
        <div>
          <span className="text-slate-500 block">Ukupno na popisu</span>
          <strong className="text-sm text-slate-900">{stats.totalGuests}</strong>
        </div>
        <div>
          <span className="text-slate-500 block">Stiglo u dvoranu</span>
          <strong className="text-sm text-slate-900">{stats.checkedInGuests}</strong>
        </div>
        <div>
          <span className="text-slate-500 block">Plaćenih narukvica</span>
          <strong className="text-sm text-emerald-700">{stats.paidGuests}</strong>
        </div>
        <div>
          <span className="text-slate-500 block">Besplatnih gostiju</span>
          <strong className="text-sm text-blue-700">{stats.freeOrgGuests + stats.freeCateringGuests}</strong>
        </div>
      </div>

      {/* Detailed Guest List Table */}
      <div className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-300 pb-1">
          Popis svih evidentiranih osoba ({checkedInList.length})
        </h2>
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
              <th className="py-1 px-2 text-left font-bold">R.br.</th>
              <th className="py-1 px-2 text-left font-bold">Ime i prezime</th>
              <th className="py-1 px-2 text-left font-bold">Kategorija</th>
              <th className="py-1 px-2 text-left font-bold">Ulaznica</th>
              <th className="py-1 px-2 text-left font-bold">Stol</th>
              <th className="py-1 px-2 text-left font-bold">Vrijeme ulaska</th>
              <th className="py-1 px-2 text-left font-bold">Napomena</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {checkedInList.map((g, idx) => (
              <tr key={g.id} className="break-inside-avoid">
                <td className="py-1 px-2 text-slate-500">{idx + 1}.</td>
                <td className="py-1 px-2 font-bold text-slate-950">{g.name}</td>
                <td className="py-1 px-2 text-slate-700">{g.team}</td>
                <td className="py-1 px-2 font-medium">
                  {g.ticket_type === 'gratis' ? (
                    <span className="text-blue-700 font-bold">Gratis (0 €)</span>
                  ) : (
                    <span className="text-emerald-700 font-bold">Plaća (39 €)</span>
                  )}
                </td>
                <td className="py-1 px-2 text-slate-700">{g.table_name || '—'}</td>
                <td className="py-1 px-2 text-slate-500">
                  {g.checked_in_at
                    ? new Date(g.checked_in_at).toLocaleTimeString('hr-HR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'}
                </td>
                <td className="py-1 px-2 text-slate-500 italic">{g.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signature Section at bottom */}
      <div className="pt-8 mt-12 border-t-2 border-slate-900 grid grid-cols-2 gap-12 text-xs break-inside-avoid">
        <div className="text-center">
          <div className="border-b border-slate-400 h-10 mb-2"></div>
          <p className="font-bold text-slate-900">UGOSTITELJSTVO</p>
          <p className="text-[11px] text-slate-500">Dupli / Silvaši</p>
        </div>

        <div className="text-center">
          <div className="border-b border-slate-400 h-10 mb-2"></div>
          <p className="font-bold text-slate-900">ORGANIZACIJA</p>
          <p className="text-[11px] text-slate-500">Ela / Joe</p>
        </div>
      </div>

    </div>
  );
}
