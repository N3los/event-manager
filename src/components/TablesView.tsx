'use client';

import React, { useMemo } from 'react';
import { Guest } from '@/lib/types';
import { MapPin, Users, Check, Clock } from 'lucide-react';

interface TablesViewProps {
  guests: Guest[];
  onCheckIn: (id: number) => Promise<void>;
}

export function TablesView({ guests, onCheckIn }: TablesViewProps) {
  // Group guests by table
  const groupedTables = useMemo(() => {
    const map = new Map<string, Guest[]>();

    guests.forEach((g) => {
      const table = g.table_name && g.table_name.trim() ? g.table_name.trim() : 'Bez stola';
      if (!map.has(table)) map.set(table, []);
      map.get(table)!.push(g);
    });

    // Sort table keys (Stol 1, Stol 2, etc. and Bez stola last)
    const sortedKeys = Array.from(map.keys()).sort((a, b) => {
      if (a === 'Bez stola') return 1;
      if (b === 'Bez stola') return -1;
      return a.localeCompare(b, undefined, { numeric: true });
    });

    return sortedKeys.map((key) => ({
      name: key,
      guests: map.get(key)!,
      checkedInCount: map.get(key)!.filter((g) => g.is_checked_in).length,
      totalCount: map.get(key)!.length,
    }));
  }, [guests]);

  return (
    <div 
      className="max-w-4xl mx-auto px-3 py-4 sm:px-4 sm:py-6 space-y-4 pb-28 sm:pb-32"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 7.5rem)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#FC661B]" />
            Raspored po stolovima
          </h2>
          <p className="text-xs text-slate-500">Pregled dolazaka i sjedećih mjesta po stolovima</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {groupedTables.map((table) => {
          const percent = table.totalCount > 0 ? Math.round((table.checkedInCount / table.totalCount) * 100) : 0;

          return (
            <div
              key={table.name}
              className="rounded-xl bg-white border border-slate-200 p-3.5 space-y-3 shadow-sm"
            >
              {/* Table Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{table.name}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {table.checkedInCount} / {table.totalCount} stiglo
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-600">{percent}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Guests List for Table */}
              <ul className="space-y-2 text-xs">
                {table.guests.map((g) => (
                  <li
                    key={g.id}
                    className={`flex items-center justify-between p-3 sm:p-3.5 rounded-xl border transition-all min-h-[56px] ${
                      g.is_checked_in
                        ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1 mr-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm sm:text-base truncate">{g.name}</span>
                        {g.ticket_type === 'gratis' ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 font-bold border border-blue-200">
                            Gratis
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">
                            39 €
                          </span>
                        )}
                      </div>
                      {g.note && (
                        <p className="text-[11px] text-amber-800 font-medium italic truncate mt-0.5">💬 {g.note}</p>
                      )}
                    </div>

                    {g.is_checked_in ? (
                      <div className="shrink-0 flex flex-col items-end justify-center min-w-[80px]">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                          <span>U dvorani</span>
                        </span>
                        {g.checked_in_at && (
                          <span className="text-[11px] font-bold text-slate-500 font-mono mt-1 flex items-center gap-1 tracking-tight">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>
                              {new Date(g.checked_in_at).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onCheckIn(g.id)}
                        className="shrink-0 h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Potvrdi ulaz</span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
