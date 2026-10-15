'use client';

import React, { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-[#111827] border border-[#1e293b] p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FC661B]/20 border border-[#FC661B]/40 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-[#FC661B]" />
            </div>
            <h3 className="text-base font-bold text-white">Novi gost (Walk-in)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f293d]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Name input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Ime i prezime <span className="text-[#FC661B]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="npr. Pero Perić"
            className="w-full h-11 px-3.5 rounded-xl bg-[#151f33] border border-[#1e293b] focus:border-[#FC661B] text-sm text-white placeholder-slate-500 outline-none"
            autoFocus
          />
        </div>

        {/* Team selector pills */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
            <Tag className="w-3 h-3 text-slate-400" />
            Kategorija / Preko koga dolazi:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-xs">
            {(['Regularni', 'Ela', 'Joe', 'Dupli', 'Silvaši'] as TeamType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTeamChange(t)}
                className={`py-2 px-1 rounded-lg font-bold border transition-all text-center ${
                  team === t
                    ? 'bg-[#013695] text-white border-[#024ec4] shadow-md shadow-[#013695]/30'
                    : 'bg-[#151f33] text-slate-400 border-[#1e293b] hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket Type Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Vrsta ulaznice:
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setTicketType('placa')}
              className={`py-2.5 px-3 rounded-xl font-bold border flex items-center justify-center gap-1.5 transition-all ${
                ticketType === 'placa'
                  ? 'bg-emerald-600/25 text-emerald-300 border-emerald-500/50 shadow-sm'
                  : 'bg-[#151f33] text-slate-400 border-[#1e293b]'
              }`}
            >
              <span>Plaća 39 € (Ulaznica)</span>
            </button>
            <button
              type="button"
              onClick={() => setTicketType('gratis')}
              className={`py-2.5 px-3 rounded-xl font-bold border flex items-center justify-center gap-1.5 transition-all ${
                ticketType === 'gratis'
                  ? 'bg-blue-600/25 text-blue-300 border-blue-500/50 shadow-sm'
                  : 'bg-[#151f33] text-slate-400 border-[#1e293b]'
              }`}
            >
              <span>Gratis 0 € (Besplatno)</span>
            </button>
          </div>
        </div>

        {/* Table & Note in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              Stol (opcionalno):
            </label>
            <input
              type="text"
              list="existing-tables-list"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="npr. Stol 1"
              className="w-full h-10 px-3 rounded-lg bg-[#151f33] border border-[#1e293b] text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
            <datalist id="existing-tables-list">
              {existingTables.map(t => <option key={t} value={t} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Napomena (opcionalno):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="npr. Fotograf, VIP..."
              className="w-full h-10 px-3 rounded-lg bg-[#151f33] border border-[#1e293b] text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#1e293b] flex flex-col gap-2">
          {/* 1-tap: Add AND immediately check-in with wristband */}
          <button
            type="button"
            disabled={!name.trim() || isSubmitting}
            onClick={() => handleSubmit(true)}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 border border-emerald-400/40 transition-all active:scale-[0.98]"
          >
            <CheckCircle className="w-4 h-4" />
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
            className="w-full h-10 rounded-xl bg-[#1c2842] hover:bg-[#25334d] disabled:opacity-50 text-slate-300 hover:text-white font-semibold text-xs transition-colors"
          >
            Samo dodaj na popis (čekat će na ulazu)
          </button>
        </div>

      </div>
    </div>
  );
}
