'use client';

import React, { useEffect, useState } from 'react';
import { FinancialStats, EventMeta, Guest } from '@/lib/types';
import { PrintableReport } from '@/components/PrintableReport';
import { Printer, ArrowLeft, Copy, Check, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ReportPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [meta, setMeta] = useState<EventMeta | null>(null);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/guests');
      const data = await res.json();
      if (data.success) {
        setGuests(data.guests);
        setMeta(data.meta);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch report data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsApp = () => {
    if (!stats) return;

    const actualCash = stats.actualCashCounted !== null && stats.actualCashCounted !== undefined
      ? stats.actualCashCounted
      : stats.totalCashExpected;

    const text = [
      `🎉 *${meta?.name || 'POOR DECISIONS'} — ZAVRŠNI OBRAČUN*`,
      `📅 Datum: ${new Date().toLocaleDateString('hr-HR')} u ${new Date().toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}`,
      ``,
      `👥 Ukupno prisutnih: *${stats.checkedInGuests}*`,
      `🎟️ Plaćenih narukvica: *${stats.paidGuests}* (× 39 €)`,
      `🎁 Besplatnih gostiju: *${stats.freeOrgGuests + stats.freeCateringGuests}*`,
      `   • Organizacija (Ela/Joe): ${stats.freeOrgGuests}`,
      `   • Ugostiteljstvo (Dupli/Silvaši): ${stats.freeCateringGuests}`,
      ``,
      `💶 *GOTOVINA U BLAGAJNI: ${stats.totalCashExpected.toLocaleString('hr-HR')} €*`,
      stats.actualCashCounted !== null ? `   (Prebrojano: ${actualCash} € ${stats.cashDifference ? `| Razlika: ${stats.cashDifference > 0 ? `+${stats.cashDifference}` : stats.cashDifference} €` : ''})` : '',
      ``,
      `💰 *KONAČNA RASPODJELA IZ BLAGAJNE:*`,
      `🍹 *Ugostiteljstvo (Dupli & Silvaši): ${stats.cateringNet.toLocaleString('hr-HR')} €*`,
      `   (Dio: ${stats.cateringGross} € + Dug Org: +${stats.orgOwesCatering} € - Svoj dug: -${stats.cateringOwesOrg} €)`,
      ``,
      `🎪 *Organizacija (Ela & Joe): ${stats.orgNet.toLocaleString('hr-HR')} €*`,
      `   (Dio: ${stats.orgGross} € + Dug Ugost: +${stats.cateringOwesOrg} € - Svoj dug: -${stats.orgOwesCatering} €)`,
      ``,
      `✓ Zbroj neto isplata: ${stats.cateringNet + stats.orgNet} € === Blagajna: ${stats.totalCashExpected} €`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-2 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-[#FC661B]" />
          <span>Učitavam izvještaj...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4">
        <div className="text-center">
          <p className="text-base font-bold">Nema dostupnih podataka za izvještaj.</p>
          <Link href="/" className="mt-3 inline-block px-4 py-2 rounded-xl bg-blue-600 text-xs font-bold">
            Natrag na početnu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 text-slate-900 print:bg-white print:p-0">
      
      {/* Top Floating Action Bar (Hidden in Print) */}
      <div className="no-print sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Natrag na ulaz</span>
            </Link>
            <span className="text-xs font-bold text-slate-300 hidden sm:inline">
              | Službeni PDF pregled
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopirano!' : 'Kopiraj za WhatsApp'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FC661B] hover:bg-[#e5530b] text-white text-xs font-bold shadow-md shadow-[#FC661B]/30 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>ISPIŠI / SPREMI KAO PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main A4 Printable Paper Container */}
      <div className="max-w-4xl mx-auto my-4 sm:my-8 bg-white shadow-2xl rounded-xl border border-slate-300 p-4 sm:p-10 print:m-0 print:p-0 print:border-none print:shadow-none print:rounded-none">
        <PrintableReport stats={stats} meta={meta} guests={guests} />
      </div>

    </div>
  );
}
