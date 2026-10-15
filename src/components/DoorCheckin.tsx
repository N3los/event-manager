'use client';

import React, { useState, useMemo } from 'react';
import { Guest, TeamType, TicketType } from '@/lib/types';
import { 
  Search, X, Check, UserPlus, MapPin, 
  MessageSquare, UserCheck, ChevronRight
} from 'lucide-react';
import { GuestDetailsModal } from '@/components/GuestDetailsModal';

interface DoorCheckinProps {
  guests: Guest[];
  onCheckIn: (id: number, override?: { ticket_type?: TicketType; team?: TeamType }) => Promise<void>;
  onUndo: (id: number) => Promise<void>;
  onUpdateGuest: (id: number, data: Partial<Guest>) => Promise<void>;
  onDeleteGuest: (id: number) => Promise<void>;
  onOpenAddGuest: () => void;
  isLoading: boolean;
  existingTables: string[];
}

export function DoorCheckin({
  guests,
  onCheckIn,
  onUndo,
  onUpdateGuest,
  onDeleteGuest,
  onOpenAddGuest,
  isLoading,
  existingTables,
}: DoorCheckinProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'checked_in' | 'placa' | 'gratis'>('pending');
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const [selectedGuestId, setSelectedGuestId] = useState<number | null>(null);

  // Active selected guest for details modal / bottom sheet
  const selectedGuest = useMemo(
    () => guests.find((g) => g.id === selectedGuestId) || null,
    [guests, selectedGuestId]
  );

  // Extract unique table names
  const tables = useMemo(() => {
    const set = new Set<string>();
    guests.forEach((g) => {
      if (g.table_name && g.table_name.trim()) set.add(g.table_name.trim());
    });
    return Array.from(set).sort();
  }, [guests]);

  // Filter and search guests
  const filteredGuests = useMemo(() => {
    const q = search.trim().toLowerCase();

    return guests.filter((g) => {
      // Search matches name, table, note or team
      if (q) {
        const matchName = g.name.toLowerCase().includes(q);
        const matchTable = g.table_name.toLowerCase().includes(q);
        const matchNote = g.note.toLowerCase().includes(q);
        const matchTeam = g.team.toLowerCase().includes(q);
        if (!matchName && !matchTable && !matchNote && !matchTeam) return false;
      }

      // Filter tab
      if (filter === 'pending' && g.is_checked_in) return false;
      if (filter === 'checked_in' && !g.is_checked_in) return false;
      if (filter === 'placa' && g.ticket_type !== 'placa') return false;
      if (filter === 'gratis' && g.ticket_type !== 'gratis') return false;

      // Table filter
      if (selectedTable !== 'all') {
        if (g.table_name !== selectedTable) return false;
      }

      return true;
    });
  }, [guests, search, filter, selectedTable]);

  // Helper counts
  const pendingCount = useMemo(() => guests.filter((g) => !g.is_checked_in).length, [guests]);
  const checkedInCount = useMemo(() => guests.filter((g) => g.is_checked_in).length, [guests]);

  return (
    <div className="max-w-4xl mx-auto px-3 py-3 sm:px-4 sm:py-4 pb-28">
      
      {/* Search Input Bar - sticky below header */}
      <div className="sticky top-[58px] sm:top-[65px] z-20 pb-3 bg-slate-50/95 backdrop-blur-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži ime, stol, napomenu ili tim..."
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-white border border-slate-300 focus:border-[#FC661B] focus:ring-2 focus:ring-[#FC661B]/20 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all shadow-xs"
            autoFocus
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
              filter === 'pending'
                ? 'bg-[#FC661B] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 shadow-xs'
            }`}
          >
            Čekaju na ulazu ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('checked_in')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
              filter === 'checked_in'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 shadow-xs'
            }`}
          >
            U dvorani ({checkedInCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium shrink-0 transition-all ${
              filter === 'all'
                ? 'bg-[#013695] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 shadow-xs'
            }`}
          >
            Svi ({guests.length})
          </button>
          <button
            onClick={() => setFilter('placa')}
            className={`px-2.5 py-1.5 rounded-lg font-medium shrink-0 transition-all ${
              filter === 'placa'
                ? 'bg-[#013695] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 shadow-xs'
            }`}
          >
            Plaća (39 €)
          </button>
          <button
            onClick={() => setFilter('gratis')}
            className={`px-2.5 py-1.5 rounded-lg font-medium shrink-0 transition-all ${
              filter === 'gratis'
                ? 'bg-[#013695] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 shadow-xs'
            }`}
          >
            Gratis (0 €)
          </button>

          {/* Table filter dropdown if tables exist */}
          {tables.length > 0 && (
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white text-slate-700 border border-slate-200 font-medium outline-none text-xs shrink-0 shadow-xs"
            >
              <option value="all">Svi stolovi</option>
              {tables.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Guest List */}
      <div className="space-y-2 mt-2">
        {filteredGuests.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">Nema rezultata</h3>
            <p className="text-xs text-slate-500 mt-1">
              {search ? `Nema gosta pod upitom "${search}"` : 'Nema gostiju u odabranoj kategoriji.'}
            </p>
            <button
              onClick={onOpenAddGuest}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FC661B] hover:bg-[#e5530b] text-white text-xs font-bold transition-all shadow-md shadow-[#FC661B]/20"
            >
              <UserPlus className="w-4 h-4" />
              Dodaj gosta "{search || 'Novi'}"
            </button>
          </div>
        ) : (
          filteredGuests.map((guest) => (
            <div
              key={guest.id}
              onClick={() => setSelectedGuestId(guest.id)}
              className={`group cursor-pointer select-none rounded-2xl border transition-all active:scale-[0.99] p-3.5 sm:p-4 flex items-center justify-between gap-3 ${
                guest.is_checked_in
                  ? 'bg-slate-100/80 border-emerald-200/80 hover:bg-slate-100'
                  : 'bg-white border-slate-200 hover:border-[#013695]/40 hover:bg-slate-50/80 shadow-xs'
              }`}
            >
              {/* Left: Avatar / Status indicator + Guest Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Visual Status Avatar */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    guest.is_checked_in
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : 'bg-[#013695]/10 text-[#013695] border border-[#013695]/20 group-hover:bg-[#FC661B]/15 group-hover:border-[#FC661B]/30 group-hover:text-[#FC661B]'
                  }`}
                >
                  {guest.is_checked_in ? (
                    <UserCheck className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <span className="font-extrabold text-sm">
                      {guest.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Text info: Name and clean detail pills */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={`text-base sm:text-lg font-bold tracking-tight truncate leading-tight transition-colors ${
                        guest.is_checked_in
                          ? 'text-slate-500 line-through decoration-emerald-600/60'
                          : 'text-slate-900 group-hover:text-[#013695]'
                      }`}
                    >
                      {guest.name}
                    </h4>

                    {/* Reservation on waitlist pill */}
                    {guest.reservation_status === 'na_cekanju' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        Na čekanju
                      </span>
                    )}
                  </div>

                  {/* Detail Badges: Table, Team, Ticket, Note */}
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap text-xs">
                    {/* Table Badge */}
                    {guest.table_name ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#013695]/10 text-[#013695] border border-[#013695]/20">
                        <MapPin className="w-3 h-3 text-[#FC661B]" />
                        {guest.table_name}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Bez stola
                      </span>
                    )}

                    {/* Team / Inviter Badge */}
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {guest.team}
                    </span>

                    {/* Ticket Type Badge */}
                    {guest.ticket_type === 'gratis' ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        Gratis
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        39 €
                      </span>
                    )}

                    {/* Note snippet if present */}
                    {guest.note && (
                      <span className="text-[11px] text-amber-800 bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200/60 italic truncate max-w-[160px] sm:max-w-xs flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">{guest.note}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Status Pill & Arrow */}
              <div className="shrink-0 flex items-center gap-2 pl-2">
                {guest.is_checked_in ? (
                  <div className="flex flex-col items-end">
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>U dvorani</span>
                    </span>
                    {guest.checked_in_at && (
                      <span className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        {new Date(guest.checked_in_at).toLocaleTimeString('hr-HR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-slate-500 group-hover:text-slate-900 transition-colors">
                    <span className="text-xs font-semibold hidden sm:inline">Detalji</span>
                    <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#FC661B] group-hover:text-white border border-slate-200 group-hover:border-[#FC661B] flex items-center justify-center transition-all shadow-xs">
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Bottom Sheet / Modal */}
      <GuestDetailsModal
        guest={selectedGuest}
        isOpen={!!selectedGuest}
        onClose={() => setSelectedGuestId(null)}
        onCheckIn={onCheckIn}
        onUndo={onUndo}
        onUpdate={onUpdateGuest}
        onDelete={onDeleteGuest}
        existingTables={existingTables}
      />

    </div>
  );
}
