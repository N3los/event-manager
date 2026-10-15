'use client';

import React, { useState } from 'react';
import { FinancialStats, EventMeta, Guest } from '@/lib/types';
import { X, Lock, Unlock, Printer, AlertTriangle, CheckCircle, Coins, FileText, ArrowRight } from 'lucide-react';

interface CloseEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: FinancialStats;
  meta: EventMeta | null;
  guests: Guest[];
  onCloseEvent: (actualCash: number, pin: string, notes?: string) => Promise<void>;
  onReopenEvent: (pin: string) => Promise<void>;
}

export function CloseEventModal({
  isOpen,
  onClose,
  stats,
  meta,
  guests,
  onCloseEvent,
  onReopenEvent,
}: CloseEventModalProps) {
  const [actualCashInput, setActualCashInput] = useState<string>(
    meta?.actual_cash_counted !== null && meta?.actual_cash_counted !== undefined
      ? String(meta.actual_cash_counted)
      : String(stats.totalCashExpected)
  );
  const [pin, setPin] = useState('1234');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPrintView, setShowPrintView] = useState(false);

  if (!isOpen) return null;

  const actualCash = parseFloat(actualCashInput) || 0;
  const difference = actualCash - stats.totalCashExpected;

  const handleClose = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await onCloseEvent(actualCash, pin, notes);
    } catch (err: any) {
      setError(err.message || 'Greška pri zaključivanju eventa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReopen = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await onReopenEvent(pin);
    } catch (err: any) {
      setError(err.message || 'Greška pri otvaranju eventa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const checkedInList = guests.filter(g => g.is_checked_in);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-[#111827] border border-[#1e293b] p-4 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <Lock className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {stats.isClosed ? 'Event je zaključen' : 'Zaključi event & Blagajna'}
              </h3>
              <p className="text-[11px] text-slate-400">Usporedba evidencije i prebrojane gotovine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If event is already closed, show Summary & Print Action */}
        {stats.isClosed ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-emerald-300">Party je uspješno zaključen!</p>
                <p className="text-slate-300">
                  Prebrojana gotovina: <strong className="text-white">{stats.actualCashCounted} €</strong>{' '}
                  {stats.cashDifference !== 0 && (
                    <span className={stats.cashDifference! > 0 ? 'text-blue-400' : 'text-red-400'}>
                      (Razlika: {stats.cashDifference! > 0 ? `+${stats.cashDifference}` : stats.cashDifference} €)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Buttons for PDF & WhatsApp */}
            <div className="space-y-2">
              <a
                href="/report"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-xl bg-[#FC661B] hover:bg-[#e5530b] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FC661B]/30 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>OTVORI SLUŽBENI PDF IZVJEŠTAJ (A4)</span>
              </a>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 h-10 rounded-xl bg-[#013695] hover:bg-[#024ec4] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Brzi ispis</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const text = [
                      `🎉 *${meta?.name || 'POOR DECISIONS'} — ZAVRŠNI OBRAČUN*`,
                      `👥 Ukupno prisutnih: *${stats.checkedInGuests}*`,
                      `🎟️ Plaćenih narukvica: *${stats.paidGuests}* (39 €)`,
                      `💶 Gotovina u blagajni: *${stats.totalCashExpected.toLocaleString('hr-HR')} €*`,
                      ``,
                      `💰 *KONAČNA RASPODJELA:*`,
                      `🍹 *Ugostiteljstvo (Dupli & Silvaši): ${stats.cateringNet.toLocaleString('hr-HR')} €*`,
                      `🎪 *Organizacija (Ela & Joe): ${stats.orgNet.toLocaleString('hr-HR')} €*`,
                      `✓ Zbroj: ${stats.cateringNet + stats.orgNet} € === Blagajna: ${stats.totalCashExpected} €`,
                    ].join('\n');
                    navigator.clipboard.writeText(text);
                    alert('Sažetak je kopiran u međuspremnik za WhatsApp!');
                  }}
                  className="flex-1 h-10 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Kopiraj za WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Reopen option */}
            <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs">
              <span className="text-slate-400">Ako trebaš naknadno nešto ispraviti:</span>
              <button
                onClick={handleReopen}
                disabled={isSubmitting}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-semibold transition-colors"
              >
                Ponovno otvori event
              </button>
            </div>
          </div>
        ) : (
          /* Event is still open: Cash entry step */
          <div className="space-y-4">
            
            {/* Cash comparison inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#151f33] border border-[#1e293b]">
                <span className="text-slate-400 block mb-1">Teorijska gotovina po evidenciji:</span>
                <span className="text-2xl font-black text-white">{stats.totalCashExpected} €</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {stats.paidGuests} plaćenih ulaznica × 39 €
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0c1220] border border-[#013695]/60">
                <label className="text-slate-300 font-semibold block mb-1 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-[#FC661B]" />
                  Stvarno prebrojano u blagajni (€):
                </label>
                <input
                  type="number"
                  value={actualCashInput}
                  onChange={(e) => setActualCashInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-10 px-3 rounded-lg bg-[#151f33] border border-slate-700 text-lg font-bold text-white outline-none focus:border-[#FC661B]"
                />
              </div>
            </div>

            {/* Discrepancy Alert */}
            {difference !== 0 ? (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  difference < 0
                    ? 'bg-red-950/30 border-red-500/40 text-red-300'
                    : 'bg-blue-950/30 border-blue-500/40 text-blue-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    {difference < 0 ? 'Manjak u blagajni:' : 'Višak u blagajni:'}{' '}
                    <strong>{difference > 0 ? `+${difference}` : difference} €</strong>
                  </span>
                </div>
                <span className="text-[11px] opacity-80">
                  {difference < 0
                    ? `Nedostaje cca ${Math.abs(Math.round(difference / 39))} ulaznica`
                    : 'Višak u blagajni'}
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Blagajna je u savršenom balansu (0.00 € razlike)!</span>
              </div>
            )}

            {/* Payout Preview */}
            <div className="p-3 rounded-xl bg-[#151f33] border border-[#1e293b] text-xs space-y-1.5">
              <span className="font-bold text-slate-300 block mb-1">Konačna raspodjela novca:</span>
              <div className="flex justify-between text-slate-300">
                <span>Ugostiteljstvo (Dupli & Silvaši):</span>
                <strong className="text-emerald-400 text-sm font-bold">{stats.cateringNet} €</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Organizacija (Ela & Joe):</span>
                <strong className="text-emerald-400 text-sm font-bold">{stats.orgNet} €</strong>
              </div>
            </div>

            {/* PIN & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Zaštitni PIN (default: 1234):</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-[#151f33] border border-[#1e293b] text-white font-mono text-center tracking-widest outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Završna napomena (opcionalno):</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="npr. Manjak dogovorno podijeljen..."
                  className="w-full h-9 px-3 rounded-lg bg-[#151f33] border border-[#1e293b] text-white outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 font-semibold">{error}</p>
            )}

            {/* Close Button */}
            <div className="pt-2 border-t border-[#1e293b] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#1c2842] text-slate-300 hover:text-white text-xs font-semibold"
              >
                Odustani
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Zaključavam...' : 'ZAKLJUČI EVENT'}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
