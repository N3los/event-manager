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
  const [statusFilter, setStatusFilter] = useState<'pending' | 'checked_in' | 'all'>('pending');
  const [ticketFilter, setTicketFilter] = useState<'all' | 'placa' | 'gratis'>('all');
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
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [guests]);

  // Helper counts
  const pendingCount = useMemo(() => guests.filter((g) => !g.is_checked_in).length, [guests]);
  const checkedInCount = useMemo(() => guests.filter((g) => g.is_checked_in).length, [guests]);
  const paidCount = useMemo(() => guests.filter((g) => g.ticket_type === 'placa').length, [guests]);
  const freeCount = useMemo(() => guests.filter((g) => g.ticket_type === 'gratis').length, [guests]);

  // Filter and search guests
  const filteredGuests = useMemo(() => {
    const q = search.trim().toLowerCase();

    return guests.filter((g) => {
      // 1. Search filter (matches name, table, note or team)
      if (q) {
        const matchName = g.name.toLowerCase().includes(q);
        const matchTable = g.table_name.toLowerCase().includes(q);
        const matchNote = g.note.toLowerCase().includes(q);
        const matchTeam = g.team.toLowerCase().includes(q);
        if (!matchName && !matchTable && !matchNote && !matchTeam) return false;
      }

      // 2. Status segment (pending | checked_in | all)
      if (statusFilter === 'pending' && g.is_checked_in) return false;
      if (statusFilter === 'checked_in' && !g.is_checked_in) return false;

      // 3. Ticket type filter (all | placa | gratis)
      if (ticketFilter === 'placa' && g.ticket_type !== 'placa') return false;
      if (ticketFilter === 'gratis' && g.ticket_type !== 'gratis') return false;

      // 4. Table filter
      if (selectedTable !== 'all' && g.table_name !== selectedTable) return false;

      return true;
    });
  }, [guests, search, statusFilter, ticketFilter, selectedTable]);

  return (
    <div className="max-w-4xl mx-auto px-3 py-3 sm:px-4 sm:py-4 pb-28">
      
      {/* Sticky Search & Filter Header */}
      <div className="sticky top-[52px] sm:top-[60px] z-20 pb-2.5 bg-slate-50/95 backdrop-blur-md pt-1">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži gosta, stol ili napomenu..."
            className="w-full h-11 pl-10 pr-10 rounded-2xl bg-white border border-slate-200 focus:border-[#013695] focus:ring-2 focus:ring-[#013695]/10 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all shadow-xs"
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

        {/* Primary Segmented Status Control */}
        <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-200/70 text-xs font-bold text-slate-600 mt-2.5 shadow-inner">
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              statusFilter === 'pending'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <span>Na ulazu</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              statusFilter === 'pending' ? 'bg-[#FC661B] text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('checked_in')}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              statusFilter === 'checked_in'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <span>U dvorani</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              statusFilter === 'checked_in' ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              {checkedInCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <span>Svi</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              statusFilter === 'all' ? 'bg-[#013695] text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              {guests.length}
            </span>
          </button>
        </div>

        {/* Secondary Sub-filters: Ticket & Table */}
        <div className="flex items-center justify-between gap-2 mt-2 px-0.5 text-xs">
          {/* Ticket Type Chips */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTicketFilter('all')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                ticketFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Sve karte
            </button>
            <button
              type="button"
              onClick={() => setTicketFilter(ticketFilter === 'placa' ? 'all' : 'placa')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                ticketFilter === 'placa'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              39 € ({paidCount})
            </button>
            <button
              type="button"
              onClick={() => setTicketFilter(ticketFilter === 'gratis' ? 'all' : 'gratis')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                ticketFilter === 'gratis'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-blue-700 hover:bg-blue-50'
              }`}
            >
              Gratis ({freeCount})
            </button>
          </div>

          {/* Table Dropdown */}
          {tables.length > 0 && (
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="text-[11px] font-semibold py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 outline-none hover:border-slate-300 shrink-0 shadow-xs"
            >
              <option value="all">Svi stolovi ({tables.length})</option>
              {tables.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Distilled Guest List */}
      <div className="space-y-1.5 mt-1">
        {filteredGuests.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
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
              className={`group cursor-pointer select-none rounded-xl border transition-all active:scale-[0.99] px-3.5 py-2.5 sm:py-3 flex items-center justify-between gap-3 ${
                guest.is_checked_in
                  ? 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/70'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Left: Status Indicator Dot + Guest Name & Clean Meta line */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Minimal Status Cue */}
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
                    guest.is_checked_in
                      ? 'bg-emerald-500 ring-4 ring-emerald-100'
                      : guest.ticket_type === 'gratis'
                        ? 'bg-blue-500 ring-4 ring-blue-50'
                        : 'bg-[#FC661B] ring-4 ring-orange-50'
                  }`}
                />

                {/* Name & Meta Line */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-sm sm:text-base font-bold truncate leading-tight ${
                        guest.is_checked_in
                          ? 'text-slate-500'
                          : 'text-slate-900 group-hover:text-[#013695]'
                      }`}
                    >
                      {guest.name}
                    </span>

                    {guest.reservation_status === 'na_cekanju' && (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        na čekanju
                      </span>
                    )}
                  </div>

                  {/* Clean, calm meta line: no nested boxes! */}
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 flex-wrap">
                    <span className="font-medium text-slate-600">
                      {guest.table_name ? guest.table_name : 'Bez stola'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>od {guest.team}</span>
                    {guest.note && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-amber-800 font-medium italic truncate max-w-[130px] sm:max-w-xs">
                          💬 {guest.note}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Crisp Ticket Badge / Arrival State */}
              <div className="shrink-0 flex items-center gap-2">
                {guest.is_checked_in ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                    <span>U dvorani</span>
                    {guest.checked_in_at && (
                      <span className="text-[10px] font-mono font-normal text-emerald-600/80 ml-0.5 hidden sm:inline">
                        {new Date(guest.checked_in_at).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        guest.ticket_type === 'gratis'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {guest.ticket_type === 'gratis' ? 'Gratis' : '39 €'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
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
