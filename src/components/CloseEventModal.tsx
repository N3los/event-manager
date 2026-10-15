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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
              <Lock className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {stats.isClosed ? 'Event je zaključen' : 'Zaključi event & Blagajna'}
              </h3>
              <p className="text-[11px] text-slate-500">Usporedba evidencije i prebrojane gotovine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            aria-label="Zatvori"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If event is already closed, show Summary & Print Action */}
        {stats.isClosed ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="text-xs sm:text-sm">
                <p className="font-bold text-emerald-900">Party je uspješno zaključen!</p>
                <p className="text-slate-700 mt-0.5">
                  Prebrojana gotovina: <strong className="text-slate-950 font-bold">{stats.actualCashCounted} €</strong>{' '}
                  {stats.cashDifference !== 0 && (
                    <span className={stats.cashDifference! > 0 ? 'text-blue-700 font-semibold' : 'text-red-700 font-semibold'}>
                      (Razlika: {stats.cashDifference! > 0 ? `+${stats.cashDifference}` : stats.cashDifference} €)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Buttons for PDF & WhatsApp */}
            <div className="space-y-2.5">
              <a
                href="/report"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-13 sm:h-14 rounded-2xl bg-[#FC661B] hover:bg-[#e5530b] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FC661B]/25 transition-all active:scale-[0.98]"
              >
                <FileText className="w-4 h-4 stroke-[2.5]" />
                <span>OTVORI SLUŽBENI PDF IZVJEŠTAJ (A4)</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="h-12 rounded-xl bg-[#013695] hover:bg-[#024ec4] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                >
                  <Printer className="w-4 h-4" />
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
                  className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                >
                  <span>Kopiraj za WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Reopen option */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Ako trebaš naknadno nešto ispraviti:</span>
              <button
                onClick={handleReopen}
                disabled={isSubmitting}
                className="h-10 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold transition-all active:scale-95"
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
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">Teorijska gotovina po evidenciji:</span>
                <span className="text-2xl font-black text-slate-900">{stats.totalCashExpected} €</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {stats.paidGuests} plaćenih ulaznica × 39 €
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/40 border border-blue-200">
                <label className="text-slate-700 font-semibold block mb-1.5 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-[#FC661B]" />
                  Stvarno prebrojano u blagajni (€):
                </label>
                <input
                  type="number"
                  value={actualCashInput}
                  onChange={(e) => setActualCashInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-12 px-3.5 rounded-xl bg-white border border-slate-300 text-xl font-black text-slate-900 outline-none focus:border-[#FC661B] shadow-xs"
                />
              </div>
            </div>

            {/* Discrepancy Alert */}
            {difference !== 0 ? (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  difference < 0
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    {difference < 0 ? 'Manjak u blagajni:' : 'Višak u blagajni:'}{' '}
                    <strong>{difference > 0 ? `+${difference}` : difference} €</strong>
                  </span>
                </div>
                <span className="text-[11px] opacity-90">
                  {difference < 0
                    ? `Nedostaje cca ${Math.abs(Math.round(difference / 39))} ulaznica`
                    : 'Višak u blagajni'}
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Blagajna je u savršenom balansu (0.00 € razlike)!</span>
              </div>
            )}

            {/* Payout Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-700 block mb-1">Konačna raspodjela novca:</span>
              <div className="flex justify-between text-slate-700">
                <span>Ugostiteljstvo (Dupli & Silvaši):</span>
                <strong className="text-emerald-700 text-sm font-bold">{stats.cateringNet} €</strong>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Organizacija (Ela & Joe):</span>
                <strong className="text-emerald-700 text-sm font-bold">{stats.orgNet} €</strong>
              </div>
            </div>

            {/* PIN & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Zaštitni PIN (default: 1234):</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full h-12 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-center tracking-widest outline-none focus:border-blue-500 text-base"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Završna napomena (opcionalno):</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="npr. Manjak dogovorno podijeljen..."
                  className="w-full h-12 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-blue-500 text-sm placeholder-slate-400"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 font-semibold">{error}</p>
            )}

            {/* Close Button */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-12 px-5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs sm:text-sm font-bold transition-all active:scale-95"
              >
                Odustani
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleClose}
                className="h-12 px-6 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-red-600/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? 'Zaključavam...' : 'ZAKLJUČI EVENT'}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
