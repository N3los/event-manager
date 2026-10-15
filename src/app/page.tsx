'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Guest, FinancialStats, EventMeta, TeamType, TicketType } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { DoorCheckin } from '@/components/DoorCheckin';
import { TablesView } from '@/components/TablesView';
import { LiveDashboard } from '@/components/LiveDashboard';
import { AddGuestModal } from '@/components/AddGuestModal';
import { CsvImportModal } from '@/components/CsvImportModal';
import { CloseEventModal } from '@/components/CloseEventModal';
import { PrintableReport } from '@/components/PrintableReport';
import { BottomNav } from '@/components/BottomNav';
import { PinLoginGate } from '@/components/PinLoginGate';
import { Sparkles, UploadCloud } from 'lucide-react';

// Pre-seeded initial data from user's Google Sheet
const initialSeedFromGoogleSheet = [
  { name: 'Aleksandra Žitko', team: 'Ela', ticket_type: 'placa', table_name: 'Stol 1', reservation_status: 'na_cekanju', note: 'Vidjeti koliko ljudi' },
  { name: 'Bruno Antunac', team: 'Ela', ticket_type: 'placa', table_name: 'Stol 2', reservation_status: 'potvrdjeno', note: 'Vidjeti koliko ljudi' },
  { name: 'Darko Stojaković', team: 'Ela', ticket_type: 'gratis', table_name: 'Stol 2', reservation_status: 'potvrdjeno', note: '' },
  { name: 'Ela Milašinčić', team: 'Ela', ticket_type: 'gratis', table_name: 'Stol 1', reservation_status: 'potvrdjeno', note: '' },
  { name: 'Emily Zivcic', team: 'Ela', ticket_type: 'placa', table_name: 'Stol 1', reservation_status: 'potvrdjeno', note: '' },
  { name: 'Eva Pančić', team: 'Ela', ticket_type: 'placa', table_name: '', reservation_status: 'na_cekanju', note: '' },
  { name: 'Goran Mrđenović', team: 'Ela', ticket_type: 'placa', table_name: 'Stol 2', reservation_status: 'na_cekanju', note: '' },
  { name: 'Lea Purgar', team: 'Ela', ticket_type: 'placa', table_name: 'Stol 1', reservation_status: 'potvrdjeno', note: '' },
  { name: 'Mario Žužić', team: 'Joe', ticket_type: 'placa', table_name: 'Stol 2', reservation_status: 'potvrdjeno', note: 'Ide popust na hordu, Joe obaviješten' },
  { name: 'Mladen Križanović', team: 'Ela', ticket_type: 'placa', table_name: 'Stol 2', reservation_status: 'na_cekanju', note: '' },
  { name: 'Pavel Butolen', team: 'Ela', ticket_type: 'placa', table_name: '', reservation_status: 'potvrdjeno', note: '' },
  { name: 'Sandi Selimović', team: 'Ela', ticket_type: 'gratis', table_name: 'Stol 2', reservation_status: 'potvrdjeno', note: '' },
  { name: 'Stribor Marinčić', team: 'Ela', ticket_type: 'gratis', table_name: '', reservation_status: 'potvrdjeno', note: 'Fotograf' },
  { name: 'Toni Andrić', team: 'Ela', ticket_type: 'gratis', table_name: 'Stol 2', reservation_status: 'potvrdjeno', note: '' },
  { name: 'Zvonimir Perić', team: 'Ela', ticket_type: 'placa', table_name: 'Stol 2', reservation_status: 'na_cekanju', note: '' },
  { name: 'Sven Sekulić', team: 'Joe', ticket_type: 'placa', table_name: '', reservation_status: 'potvrdjeno', note: '' },
  { name: 'Sven Sekulić +1', team: 'Joe', ticket_type: 'placa', table_name: '', reservation_status: 'potvrdjeno', note: '' },
  { name: 'Nikola Šajatović', team: 'Joe', ticket_type: 'placa', table_name: '', reservation_status: 'potvrdjeno', note: '' },
  { name: 'Lita Chan', team: 'Joe', ticket_type: 'placa', table_name: '', reservation_status: 'potvrdjeno', note: '' },
  { name: 'BRUNO GOJAK???', team: 'Regularni', ticket_type: 'placa', table_name: '', reservation_status: 'na_cekanju', note: 'Provjeriti' },
];

export default function HomePage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [meta, setMeta] = useState<EventMeta | null>(null);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [activeTab, setActiveTab] = useState<'door' | 'tables' | 'dashboard'>('door');
  const [isLoading, setIsLoading] = useState(true);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  // Check PIN auth on client mount
  useEffect(() => {
    const saved = localStorage.getItem('event_auth_pin');
    if (saved === 'verified') {
      setIsAuthenticated(true);
    }
    setAuthChecked(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('event_auth_pin');
    setIsAuthenticated(false);
  };

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);

  // Load cached data from localStorage immediately on mount for instant UI
  useEffect(() => {
    try {
      const cached = localStorage.getItem('pd_cached_guests');
      const cachedMeta = localStorage.getItem('pd_cached_meta');
      const cachedStats = localStorage.getItem('pd_cached_stats');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGuests(parsed);
        }
      }
      if (cachedMeta) setMeta(JSON.parse(cachedMeta));
      if (cachedStats) setStats(JSON.parse(cachedStats));
    } catch {}
  }, []);

  // Fetch data from server
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/guests');
      const data = await res.json();
      if (data.success) {
        setGuests(data.guests);
        setMeta(data.meta);
        setStats(data.stats);
        try {
          localStorage.setItem('pd_cached_guests', JSON.stringify(data.guests));
          localStorage.setItem('pd_cached_meta', JSON.stringify(data.meta));
          localStorage.setItem('pd_cached_stats', JSON.stringify(data.stats));
        } catch {}
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Manual refresh with guaranteed visual feedback
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setJustRefreshed(false);
    try {
      await Promise.all([
        fetchData(),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
      setJustRefreshed(true);
      setTimeout(() => setJustRefreshed(false), 2000);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Seed sample data if empty
  const handleSeedGoogleSheetData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/guests/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests: initialSeedFromGoogleSheet, mode: 'append' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check In guest (Optimistic + Backend)
  const handleCheckIn = async (id: number, override?: { ticket_type?: TicketType; team?: TeamType }) => {
    // Optimistic update
    setGuests((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const tt = override?.ticket_type || g.ticket_type;
        const tm = override?.team || g.team;
        return {
          ...g,
          is_checked_in: true,
          checked_in_at: new Date().toISOString(),
          wristband_issued: true,
          payment_status: tt === 'placa' ? 'placeno' : 'gratis',
          ticket_type: tt,
          team: tm,
          price: tt === 'gratis' ? 0 : 39,
        };
      })
    );

    try {
      const res = await fetch(`/api/guests/${id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(override || {}),
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        // Revert on error
        fetchData();
      }
    } catch {
      fetchData();
    }
  };

  // Undo Check In (Optimistic + Backend)
  const handleUndo = async (id: number) => {
    // Optimistic update
    setGuests((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        return {
          ...g,
          is_checked_in: false,
          checked_in_at: null,
          wristband_issued: false,
          payment_status: 'neplaceno',
        };
      })
    );

    try {
      const res = await fetch(`/api/guests/${id}/undo`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        fetchData();
      }
    } catch {
      fetchData();
    }
  };

  // Update Guest (Edit details)
  const handleUpdateGuest = async (id: number, data: Partial<Guest>) => {
    // Optimistic update
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...data } : g))
    );

    try {
      const res = await fetch(`/api/guests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success) {
        if (resData.stats) setStats(resData.stats);
        if (resData.guest) {
          setGuests((prev) =>
            prev.map((g) => (g.id === id ? { ...g, ...resData.guest } : g))
          );
        }
      } else {
        fetchData();
      }
    } catch {
      fetchData();
    }
  };

  // Delete Guest
  const handleDeleteGuest = async (id: number) => {
    // Optimistic update
    setGuests((prev) => prev.filter((g) => g.id !== id));

    try {
      const res = await fetch(`/api/guests/${id}`, {
        method: 'DELETE',
      });
      const resData = await res.json();
      if (resData.success) {
        if (resData.stats) setStats(resData.stats);
      } else {
        fetchData();
      }
    } catch {
      fetchData();
    }
  };

  // Add Guest
  const handleAddGuest = async (newGuestData: {
    name: string;
    team: TeamType;
    ticket_type: TicketType;
    table_name?: string;
    note?: string;
    is_checked_in: boolean;
  }) => {
    const res = await fetch('/api/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGuestData),
    });
    const data = await res.json();
    if (data.success) {
      fetchData();
    }
  };

  // Import CSV / Google Sheets URL
  const handleImportCsv = async (params: { url?: string; csvText?: string; mode: 'append' | 'replace' }) => {
    const res = await fetch('/api/guests/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (data.success) {
      fetchData();
      return { count: data.count, replaced: data.replaced };
    }
    throw new Error(data.error || 'Neuspjeli uvoz');
  };

  // Close Event
  const handleCloseEvent = async (actualCash: number, pin: string, notes?: string) => {
    const res = await fetch('/api/event/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actualCash, pin, notes }),
    });
    const data = await res.json();
    if (data.success) {
      setMeta(data.meta);
      setStats(data.stats);
    } else {
      throw new Error(data.error || 'Neuspjelo zaključivanje');
    }
  };

  // Reopen Event
  const handleReopenEvent = async (pin: string) => {
    const res = await fetch('/api/event/reopen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    if (data.success) {
      setMeta(data.meta);
      setStats(data.stats);
    } else {
      throw new Error(data.error || 'Neuspjelo otvaranje');
    }
  };

  // Extract unique table names
  const existingTables = React.useMemo(() => {
    const s = new Set<string>();
    guests.forEach((g) => {
      if (g.table_name && g.table_name.trim()) s.add(g.table_name.trim());
    });
    return Array.from(s).sort();
  }, [guests]);

  // Show PIN Login Gate if not authenticated
  if (authChecked && !isAuthenticated) {
    return <PinLoginGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  // Prevent flash while checking localStorage on first mount
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FC661B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navbar */}
        <Navbar
          stats={stats}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenImport={() => setIsImportOpen(true)}
          onOpenCloseEvent={() => setIsCloseOpen(true)}
          onRefresh={handleManualRefresh}
          onLogout={handleLogout}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          justRefreshed={justRefreshed}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {/* Banner if guest list is empty */}
          {guests.length === 0 && !isLoading && (
            <div className="max-w-xl mx-auto my-8 p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 mx-auto shadow-xs bg-white">
                <img
                  src="/day_drinking_logo.jpeg"
                  alt="Poor Decisions Day Drinking Society"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Guest lista je prazna</h2>
                <p className="text-xs text-slate-600 mt-1">
                  Možeš odmah učitati postojeće goste iz svoje Google tablice jednim klikom ili uvesti CSV datoteku.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <button
                  onClick={handleSeedGoogleSheetData}
                  className="px-4 py-2.5 rounded-xl bg-[#013695] hover:bg-[#024ec4] text-white text-xs font-bold shadow-md shadow-[#013695]/20 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#FC661B]" />
                  <span>Učitaj goste iz Google tablice (20 osoba)</span>
                </button>
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UploadCloud className="w-4 h-4 text-slate-500" />
                  <span>Uvezi drugi CSV</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 1: Door Check-In */}
          {activeTab === 'door' && (
            <DoorCheckin
              guests={guests}
              onCheckIn={handleCheckIn}
              onUndo={handleUndo}
              onUpdateGuest={handleUpdateGuest}
              onDeleteGuest={handleDeleteGuest}
              onOpenAddGuest={() => setIsAddOpen(true)}
              isLoading={isLoading}
              existingTables={existingTables}
            />
          )}

          {/* Tab 2: Tables Layout */}
          {activeTab === 'tables' && (
            <TablesView guests={guests} onCheckIn={handleCheckIn} />
          )}

          {/* Tab 3: Live Financial Dashboard */}
          {activeTab === 'dashboard' && stats && (
            <LiveDashboard
              stats={stats}
              guests={guests}
              onBackToDoor={() => setActiveTab('door')}
            />
          )}
        </main>

        {/* Modals */}
        <AddGuestModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAdd={handleAddGuest}
          existingTables={existingTables}
        />

        <CsvImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImport={handleImportCsv}
        />

        {stats && (
          <CloseEventModal
            isOpen={isCloseOpen}
            onClose={() => setIsCloseOpen(false)}
            stats={stats}
            meta={meta}
            guests={guests}
            onCloseEvent={handleCloseEvent}
            onReopenEvent={handleReopenEvent}
          />
        )}

        {/* Mobile Floating Bottom Bar Navigation */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddGuest={() => setIsAddOpen(true)}
        />

      </div>
  );
}
