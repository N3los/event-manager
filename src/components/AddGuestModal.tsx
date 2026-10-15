'use client';

import React, { useState, useRef } from 'react';
import { TeamType, TicketType } from '@/lib/types';
import { X, UserPlus, CheckCircle, MapPin, Tag } from 'lucide-react';

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    name: string;
    team: TeamType;
    ticket_type: TicketType;
    table_name?: string;
    note?: string;
    is_checked_in: boolean;
  }) => Promise<void>;
  existingTables: string[];
}

export function AddGuestModal({
  isOpen,
  onClose,
  onAdd,
  existingTables,
}: AddGuestModalProps) {
  const [name, setName] = useState('');
  const [team, setTeam] = useState<TeamType>('Regularni');
  const [ticketType, setTicketType] = useState<TicketType>('placa');
  const [tableName, setTableName] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current !== null) {
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      if (deltaY > 40) {
        onClose();
      }
      touchStartY.current = null;
    }
  };

  if (!isOpen) return null;

  // When team changes, smartly default ticket type
  const handleTeamChange = (newTeam: TeamType) => {
    setTeam(newTeam);
    if (newTeam === 'Regularni') {
      setTicketType('placa');
    } else {
      // Guests of Ela, Joe, Dupli, Silvaši default to gratis
      setTicketType('gratis');
    }
  };

  const handleSubmit = async (checkInImmediately: boolean) => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onAdd({
        name: name.trim(),
        team,
        ticket_type: ticketType,
        table_name: tableName.trim(),
        note: note.trim(),
        is_checked_in: checkInImmediately,
      });
      // Reset form
      setName('');
      setTeam('Regularni');
      setTicketType('placa');
      setTableName('');
      setNote('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Mobile Pull Handle Indicator (Tap or Swipe down to close) */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Zatvori povlačenjem ili klikom"
          onClick={onClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="w-full pt-1 pb-2.5 flex justify-center items-center cursor-pointer select-none sm:hidden -mt-1 active:opacity-60 group"
          title="Klikni ili povuci dolje za zatvaranje"
        >
          <div className="w-12 h-1.5 bg-slate-300 group-hover:bg-slate-400 group-active:bg-slate-500 rounded-full transition-colors" />
        </div>

        {/* Header */}
        <div 
          className="flex items-center justify-between pb-2 border-b border-slate-100"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FC661B]/10 border border-[#FC661B]/25 flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4 text-[#FC661B]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-none">Novi gost (Walk-in)</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Dodavanje gosta na licu mjesta</p>
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

        {/* Name input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ime i prezime <span className="text-[#FC661B]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="npr. Pero Perić"
            className="w-full h-12 px-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#FC661B] focus:bg-white text-base font-bold text-slate-900 placeholder-slate-400 outline-none transition-all shadow-xs"
            autoFocus
          />
        </div>

        {/* Team selector pills */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            Kategorija / Preko koga dolazi:
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {(['Regularni', 'Ela', 'Joe', 'Dupli', 'Silvaši'] as TeamType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTeamChange(t)}
                className={`min-h-[44px] sm:min-h-[48px] px-1 py-1 rounded-xl text-[11px] sm:text-xs font-bold leading-tight flex items-center justify-center text-center border transition-all active:scale-95 ${
                  team === t
                    ? 'bg-[#013695] text-white border-[#024ec4] shadow-md shadow-[#013695]/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket Type Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Vrsta ulaznice:
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setTicketType('placa')}
              className={`h-12 sm:h-13 px-3 rounded-2xl font-bold border flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
                ticketType === 'placa'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>Plaća 39 €</span>
            </button>
            <button
              type="button"
              onClick={() => setTicketType('gratis')}
              className={`h-12 sm:h-13 px-3 rounded-2xl font-bold border flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
                ticketType === 'gratis'
                  ? 'bg-[#013695] text-white border-[#024ec4] shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>Gratis 0 €</span>
            </button>
          </div>
        </div>

        {/* Table & Note in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Stol (opcionalno):
            </label>
            <input
              type="text"
              list="existing-tables-list"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="npr. Stol 1"
              className="w-full h-11 sm:h-12 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#013695] focus:bg-white transition-all"
            />
            <datalist id="existing-tables-list">
              {existingTables.map(t => <option key={t} value={t} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Napomena (opcionalno):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="npr. Fotograf, VIP..."
              className="w-full h-11 sm:h-12 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#013695] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
          {/* 1-tap: Add AND immediately check-in with wristband */}
          <button
            type="button"
            disabled={!name.trim() || isSubmitting}
            onClick={() => handleSubmit(true)}
            className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 border border-emerald-600 transition-all active:scale-[0.98]"
          >
            <CheckCircle className="w-5 h-5 stroke-[2.5]" />
            <span>
              {ticketType === 'placa'
                ? 'DODAJ I ODMAH NAPLATI (39 €)'
                : 'DODAJ I POTVRDI BESPLATAN ULAZ'}
            </span>
          </button>

          {/* Just add to list without check-in */}
          <button
            type="button"
            disabled={!name.trim() || isSubmitting}
            onClick={() => handleSubmit(false)}
            className="w-full h-12 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold text-xs sm:text-sm transition-all active:scale-[0.98]"
          >
            Samo dodaj na popis (čekat će na ulazu)
          </button>
        </div>

      </div>
    </div>
  );
}
