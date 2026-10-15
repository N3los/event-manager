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
    <div className="max-w-4xl mx-auto px-3 py-4 sm:px-4 sm:py-6 space-y-4 pb-28 sm:pb-32">
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
              <ul className="space-y-1.5 text-xs">
                {table.guests.map((g) => (
                  <li
                    key={g.id}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                      g.is_checked_in
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold truncate">{g.name}</span>
                        {g.ticket_type === 'gratis' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-semibold border border-blue-200">
                            Gratis
                          </span>
                        )}
                      </div>
                      {g.note && (
                        <p className="text-[10px] text-amber-700 font-medium italic truncate">💬 {g.note}</p>
                      )}
                    </div>

                    {g.is_checked_in ? (
                      <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        U dvorani
                      </span>
                    ) : (
                      <button
                        onClick={() => onCheckIn(g.id)}
                        className="shrink-0 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors shadow-xs"
                      >
                        Potvrdi ulaz
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
