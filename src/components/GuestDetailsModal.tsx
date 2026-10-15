'use client';

import React, { useState, useEffect } from 'react';
import { Guest, TeamType, TicketType, ReservationStatus } from '@/lib/types';
import { 
  X, Check, RotateCcw, Edit2, MapPin, Tag, MessageSquare, 
  Trash2, UserCheck, Clock, Save
} from 'lucide-react';

interface GuestDetailsModalProps {
  guest: Guest | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (id: number, override?: { ticket_type?: TicketType; team?: TeamType }) => Promise<void>;
  onUndo: (id: number) => Promise<void>;
  onUpdate: (id: number, data: Partial<Guest>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  existingTables: string[];
}

export function GuestDetailsModal({
  guest,
  isOpen,
  onClose,
  onCheckIn,
  onUndo,
  onUpdate,
  onDelete,
  existingTables,
}: GuestDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);

  // Form values (pre-populated)
  const [name, setName] = useState('');
  const [team, setTeam] = useState<TeamType>('Regularni');
  const [ticketType, setTicketType] = useState<TicketType>('placa');
  const [tableName, setTableName] = useState('');
  const [reservationStatus, setReservationStatus] = useState<ReservationStatus>('potvrdjeno');
  const [note, setNote] = useState('');

  // Synchronize on guest change
  useEffect(() => {
    if (guest) {
      setName(guest.name || '');
      setTeam(guest.team || 'Regularni');
      setTicketType(guest.ticket_type || 'placa');
      setTableName(guest.table_name || '');
      setReservationStatus(guest.reservation_status || 'potvrdjeno');
      setNote(guest.note || '');
      setIsEditing(false);
      setShowDeleteConfirm(false);
      setShowUndoConfirm(false);
    }
  }, [guest]);

  if (!isOpen || !guest) return null;

  // When team changes, intelligently toggle ticket type
  const handleTeamChange = (newTeam: TeamType) => {
    setTeam(newTeam);
    if (newTeam === 'Regularni') {
      setTicketType('placa');
    } else {
      setTicketType('gratis');
    }
  };

  const handleSaveEdit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdate(guest.id, {
        name: name.trim(),
        team,
        ticket_type: ticketType,
        table_name: tableName.trim(),
        reservation_status: reservationStatus,
        note: note.trim(),
      });
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    setIsSubmitting(true);
    try {
      await onCheckIn(guest.id, {
        ticket_type: ticketType,
        team,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmUndo = async () => {
    setIsSubmitting(true);
    try {
      await onUndo(guest.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete(guest.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs animate-fade-in p-0 sm:p-4">
      <div 
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-slide-up sm:animate-scale-in"
      >
        
        {/* Mobile Pull Handle Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden mb-1" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              guest.is_checked_in 
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                : 'bg-[#013695]/10 text-[#013695] border border-[#013695]/20'
            }`}>
              {guest.is_checked_in ? <UserCheck className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Detalji gosta #{guest.id}
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                {name || guest.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#FC661B]" />
                <span>Uredi</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setName(guest.name);
                  setTeam(guest.team);
                  setTicketType(guest.ticket_type);
                  setTableName(guest.table_name || '');
                  setReservationStatus(guest.reservation_status || 'potvrdjeno');
                  setNote(guest.note || '');
                  setIsEditing(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline mr-1 font-semibold"
              >
                Odustani
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Callout Banner */}
        <div className={`p-3 rounded-xl border flex items-center justify-between ${
          guest.is_checked_in
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2 text-xs">
            {guest.is_checked_in ? (
              <Check className="w-4 h-4 shrink-0 font-bold text-emerald-600" />
            ) : (
              <Clock className="w-4 h-4 shrink-0 text-amber-600" />
            )}
            <div>
              <span className="font-bold">
                {guest.is_checked_in ? 'U dvorani (Narukvica izdana)' : 'Čeka na ulazu'}
              </span>
              {guest.checked_in_at && (
                <span className="block text-[11px] opacity-80 mt-0.5 font-mono">
                  Dolazak: {new Date(guest.checked_in_at).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700">
            {reservationStatus === 'potvrdjeno' ? 'Potvrđeno' : 'Na čekanju'}
          </span>
        </div>

        {/* Form Body - Structured identical to Novi Gost, Pre-populated! */}
        <div className="space-y-3.5">
          
          {/* Ime i prezime - in edit mode editable */}
          {isEditing && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ime i prezime <span className="text-[#FC661B]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-blue-600 text-sm font-bold text-slate-900 outline-none shadow-xs"
                autoFocus
              />
            </div>
          )}

          {/* Team selector pills (Preko koga dolazi) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                Kategorija / Preko koga dolazi:
              </span>
              {team !== guest.team && (
                <span className="text-[10px] text-amber-600 font-bold">Promijenjeno</span>
              )}
            </label>
            <div className="grid grid-cols-5 gap-1.5 text-xs">
              {(['Regularni', 'Ela', 'Joe', 'Dupli', 'Silvaši'] as TeamType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={guest.is_checked_in && !isEditing}
                  onClick={() => handleTeamChange(t)}
                  className={`py-2 px-1 rounded-xl font-bold border transition-all text-center ${
                    team === t
                      ? 'bg-[#013695] text-white border-[#024ec4] shadow-md shadow-[#013695]/20'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                  } ${guest.is_checked_in && !isEditing ? 'opacity-70 cursor-default' : ''}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Vrsta ulaznice:</span>
              {ticketType !== guest.ticket_type && (
                <span className="text-[10px] text-amber-600 font-bold">Promijenjeno</span>
              )}
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                disabled={guest.is_checked_in && !isEditing}
                onClick={() => setTicketType('placa')}
                className={`py-2.5 px-3 rounded-xl font-bold border flex items-center justify-center gap-1.5 transition-all ${
                  ticketType === 'placa'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                } ${guest.is_checked_in && !isEditing ? 'opacity-70 cursor-default' : ''}`}
              >
                <span>Plaća 39 € (Ulaznica)</span>
              </button>
              <button
                type="button"
                disabled={guest.is_checked_in && !isEditing}
                onClick={() => setTicketType('gratis')}
                className={`py-2.5 px-3 rounded-xl font-bold border flex items-center justify-center gap-1.5 transition-all ${
                  ticketType === 'gratis'
                    ? 'bg-[#013695] text-white border-[#024ec4] shadow-sm'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                } ${guest.is_checked_in && !isEditing ? 'opacity-70 cursor-default' : ''}`}
              >
                <span>Gratis 0 € (Besplatno)</span>
              </button>
            </div>
          </div>

          {/* Table & Note in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Stol:
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    list="modal-table-options"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="npr. Stol 1"
                    className="w-full h-10 px-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#013695]"
                  />
                  <datalist id="modal-table-options">
                    {existingTables.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </>
              ) : (
                <div className="h-10 px-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center">
                  <span className="text-xs font-bold text-[#FC661B]">
                    {tableName || 'Bez stola (Stajanje)'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                Napomena:
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="npr. Fotograf, popust..."
                  className="w-full h-10 px-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#013695]"
                />
              ) : (
                <div className="h-10 px-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center truncate">
                  <span className="text-xs italic text-slate-700 truncate">
                    {note || 'Nema napomene'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* In Edit mode, show reservation status selector too */}
          {isEditing && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status rezervacije:
              </label>
              <select
                value={reservationStatus}
                onChange={(e) => setReservationStatus(e.target.value as ReservationStatus)}
                className="w-full h-10 px-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 outline-none focus:border-[#013695]"
              >
                <option value="potvrdjeno">Potvrđeno</option>
                <option value="na_cekanju">Na čekanju</option>
              </select>
            </div>
          )}

        </div>

        {/* Bottom Actions Area */}
        <div className="pt-3 border-t border-slate-100">
          {isEditing ? (
            /* Edit Mode Actions: Delete + Save */
            <div className="flex items-center justify-between gap-2">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="h-11 px-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Obriši gosta</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="h-11 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                  >
                    Potvrdi brisanje
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="h-11 px-2.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Odustani
                  </button>
                </div>
              )}

              <button
                type="button"
                disabled={isSubmitting || !name.trim()}
                onClick={handleSaveEdit}
                className="flex-1 max-w-[200px] h-11 px-4 rounded-xl bg-[#013695] hover:bg-[#024ec4] disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#013695]/20 transition-all active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Spremam...' : 'Spremi promjene'}</span>
              </button>
            </div>
          ) : (
            /* Normal Mode Actions: Check-in OR Undo */
            <div>
              {!guest.is_checked_in ? (
                /* Primary Check-in Button */
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmCheckIn}
                  className={`w-full h-14 rounded-2xl text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                    ticketType === 'placa'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25 border border-emerald-500'
                      : 'bg-[#013695] hover:bg-[#024ec4] shadow-[#013695]/30 border border-[#024ec4]'
                  }`}
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>
                    {ticketType === 'placa'
                      ? 'POTVRDI & NAPLATI 39 €'
                      : 'POTVRDI BESPLATAN ULAZ'}
                  </span>
                </button>
              ) : (
                /* Storno / Return guest button */
                <div>
                  {!showUndoConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowUndoConfirm(true)}
                      className="w-full h-12 rounded-xl bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-700 hover:text-red-600 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>VRATI GOSTA / PONIŠTI DOLAZAK (STORNO)</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-2 text-center animate-fade-in">
                      <p className="text-xs font-bold text-red-800">
                        Sigurno želiš poništiti dolazak i stornirati narukvicu?
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={handleConfirmUndo}
                          className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors"
                        >
                          {isSubmitting ? 'Poništavam...' : 'Da, storniraj'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowUndoConfirm(false)}
                          className="flex-1 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                        >
                          Odustani
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
