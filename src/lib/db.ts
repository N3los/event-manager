import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Guest, EventMeta, TeamType, TicketType, ReservationStatus } from './types';

// Detect whether Neon connection string is configured
const connectionString = process.env.DATABASE_URL || '';
const isNeonConfigured = Boolean(connectionString && connectionString.startsWith('postgres'));

let pool: Pool | null = null;
if (isNeonConfigured) {
  try {
    pool = new Pool({ connectionString });
  } catch (err) {
    console.error('Failed to create Neon pool:', err);
  }
}

// Fallback storage path detection:
// In local dev, use process.cwd()/.data
// In serverless (Vercel, AWS Lambda), process.cwd() is /var/task (read-only), so use os.tmpdir() (/tmp)
function getWritableStorePath(): { dir: string; file: string } {
  const isServerless = Boolean(
    process.env.VERCEL || 
    process.env.AWS_LAMBDA_FUNCTION_NAME || 
    (typeof process.cwd === 'function' && (process.cwd().includes('/var/task') || process.cwd().startsWith('/var/')))
  );

  if (isServerless) {
    const tmpDir = path.join(os.tmpdir(), 'event-calculator-data');
    return { dir: tmpDir, file: path.join(tmpDir, 'store.json') };
  }

  try {
    const localDir = path.join(process.cwd(), '.data');
    return { dir: localDir, file: path.join(localDir, 'store.json') };
  } catch {
    const fallbackDir = path.join(os.tmpdir(), 'event-calculator-data');
    return { dir: fallbackDir, file: path.join(fallbackDir, 'store.json') };
  }
}

interface LocalStore {
  meta: EventMeta;
  guests: Guest[];
  nextId: number;
}

const defaultMeta: EventMeta = {
  id: 'current',
  name: 'POOR DECISIONS',
  ticket_price: 39,
  catering_split: 25,
  org_split: 14,
  is_closed: false,
  actual_cash_counted: null,
  closed_at: null,
  closed_notes: null,
};

declare global {
  var __pdStore: LocalStore | undefined;
}

function getLocalStore(): LocalStore {
  // 1. Fast in-memory cache check
  if (globalThis.__pdStore && Array.isArray(globalThis.__pdStore.guests)) {
    return globalThis.__pdStore;
  }

  const { dir, file } = getWritableStorePath();

  // 2. Try reading from disk (/tmp or .data)
  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ dir, { recursive: true });
    }
    if (fs.existsSync(/*turbopackIgnore: true*/ file)) {
      const data = fs.readFileSync(/*turbopackIgnore: true*/ file, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.guests)) {
        globalThis.__pdStore = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('File read from store failed, falling back to in-memory:', err);
  }

  // 3. Fallback to default initial
  const initial: LocalStore = {
    meta: defaultMeta,
    guests: [],
    nextId: 1,
  };
  globalThis.__pdStore = initial;

  // 4. Try saving initial to disk safely without throwing
  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ dir, { recursive: true });
    }
    fs.writeFileSync(/*turbopackIgnore: true*/ file, JSON.stringify(initial, null, 2), 'utf-8');
  } catch (err) {
    console.warn('File write to store failed, kept in memory:', err);
  }

  return initial;
}

function saveLocalStore(store: LocalStore) {
  // Always update in-memory global
  globalThis.__pdStore = store;

  const { dir, file } = getWritableStorePath();
  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ dir, { recursive: true });
    }
    fs.writeFileSync(/*turbopackIgnore: true*/ file, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('File write to store failed, kept in memory:', err);
  }
}

/**
 * Initialize database schema (PostgreSQL) or ensure local store
 */
export async function initDb(): Promise<void> {
  if (pool) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS event_meta (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          ticket_price NUMERIC NOT NULL DEFAULT 39,
          catering_split NUMERIC NOT NULL DEFAULT 25,
          org_split NUMERIC NOT NULL DEFAULT 14,
          is_closed BOOLEAN NOT NULL DEFAULT FALSE,
          actual_cash_counted NUMERIC,
          closed_at TIMESTAMPTZ,
          closed_notes TEXT
        );

        INSERT INTO event_meta (id, name, ticket_price, catering_split, org_split, is_closed)
        VALUES ('current', 'POOR DECISIONS', 39, 25, 14, FALSE)
        ON CONFLICT (id) DO NOTHING;

        CREATE TABLE IF NOT EXISTS guests (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          team TEXT NOT NULL DEFAULT 'Regularni',
          ticket_type TEXT NOT NULL DEFAULT 'placa',
          price NUMERIC NOT NULL DEFAULT 39,
          table_name TEXT NOT NULL DEFAULT '',
          reservation_status TEXT NOT NULL DEFAULT 'potvrdjeno',
          is_checked_in BOOLEAN NOT NULL DEFAULT FALSE,
          checked_in_at TIMESTAMPTZ,
          payment_status TEXT NOT NULL DEFAULT 'neplaceno',
          wristband_issued BOOLEAN NOT NULL DEFAULT FALSE,
          note TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_guests_name ON guests (name);
        CREATE INDEX IF NOT EXISTS idx_guests_checked_in ON guests (is_checked_in);
      `);
      return;
    } catch (err) {
      console.warn('Neon connection/init failed, using local store fallback:', err);
      pool = null;
    }
  }

  // Fallback to local store
  getLocalStore();
}

/**
 * Get all guests with optional query
 */
export async function getGuests(): Promise<Guest[]> {
  await initDb();
  if (pool) {
    const res = await pool.query(`
      SELECT 
        id, 
        name, 
        team, 
        ticket_type, 
        price::float, 
        table_name, 
        reservation_status, 
        is_checked_in, 
        checked_in_at::text, 
        payment_status, 
        wristband_issued, 
        note, 
        created_at::text, 
        updated_at::text
      FROM guests 
      ORDER BY is_checked_in ASC, name ASC
    `);
    return res.rows;
  }

  const store = getLocalStore();
  return store.guests.sort((a, b) => {
    if (a.is_checked_in !== b.is_checked_in) {
      return a.is_checked_in ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get Event Meta
 */
export async function getEventMeta(): Promise<EventMeta> {
  await initDb();
  if (pool) {
    const res = await pool.query(`SELECT * FROM event_meta WHERE id = 'current'`);
    if (res.rows.length > 0) {
      const r = res.rows[0];
      return {
        id: r.id,
        name: r.name,
        ticket_price: Number(r.ticket_price),
        catering_split: Number(r.catering_split),
        org_split: Number(r.org_split),
        is_closed: Boolean(r.is_closed),
        actual_cash_counted: r.actual_cash_counted !== null ? Number(r.actual_cash_counted) : null,
        closed_at: r.closed_at,
        closed_notes: r.closed_notes,
      };
    }
  }

  const store = getLocalStore();
  return store.meta;
}

/**
 * Add a new Guest
 */
export async function addGuest(data: {
  name: string;
  team?: TeamType;
  ticket_type?: TicketType;
  table_name?: string;
  reservation_status?: ReservationStatus;
  note?: string;
  is_checked_in?: boolean;
}): Promise<Guest> {
  await initDb();
  const ticket_type = data.ticket_type || 'placa';
  const price = ticket_type === 'gratis' ? 0 : 39;
  const is_checked_in = Boolean(data.is_checked_in);
  const now = new Date().toISOString();
  const payment_status = is_checked_in ? (ticket_type === 'placa' ? 'placeno' : 'gratis') : 'neplaceno';

  if (pool) {
    const res = await pool.query(
      `
      INSERT INTO guests (
        name, team, ticket_type, price, table_name, reservation_status,
        is_checked_in, checked_in_at, payment_status, wristband_issued, note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
      `,
      [
        data.name.trim(),
        data.team || 'Regularni',
        ticket_type,
        price,
        data.table_name || '',
        data.reservation_status || 'potvrdjeno',
        is_checked_in,
        is_checked_in ? now : null,
        payment_status,
        is_checked_in,
        data.note || '',
      ]
    );
    const r = res.rows[0];
    return {
      ...r,
      price: Number(r.price),
    };
  }

  const store = getLocalStore();
  const newGuest: Guest = {
    id: store.nextId++,
    name: data.name.trim(),
    team: data.team || 'Regularni',
    ticket_type,
    price,
    table_name: data.table_name || '',
    reservation_status: data.reservation_status || 'potvrdjeno',
    is_checked_in,
    checked_in_at: is_checked_in ? now : null,
    payment_status,
    wristband_issued: is_checked_in,
    note: data.note || '',
    created_at: now,
    updated_at: now,
  };
  store.guests.push(newGuest);
  saveLocalStore(store);
  return newGuest;
}

/**
 * Check In Guest (Confirm entry & wristband)
 */
export async function checkInGuest(id: number, override?: { ticket_type?: TicketType; team?: TeamType }): Promise<Guest> {
  await initDb();
  const now = new Date().toISOString();

  if (pool) {
    // Fetch existing first
    const existing = await pool.query(`SELECT * FROM guests WHERE id = $1`, [id]);
    if (existing.rows.length === 0) throw new Error('Guest not found');
    const g = existing.rows[0];

    const finalTicketType = override?.ticket_type || g.ticket_type;
    const finalTeam = override?.team || g.team;
    const finalPrice = finalTicketType === 'gratis' ? 0 : 39;
    const paymentStatus = finalTicketType === 'placa' ? 'placeno' : 'gratis';

    const res = await pool.query(
      `
      UPDATE guests 
      SET 
        is_checked_in = TRUE,
        checked_in_at = $1,
        wristband_issued = TRUE,
        payment_status = $2,
        ticket_type = $3,
        team = $4,
        price = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
      `,
      [now, paymentStatus, finalTicketType, finalTeam, finalPrice, id]
    );
    const r = res.rows[0];
    return { ...r, price: Number(r.price) };
  }

  const store = getLocalStore();
  const idx = store.guests.findIndex(g => g.id === id);
  if (idx === -1) throw new Error('Guest not found');

  const g = store.guests[idx];
  const finalTicketType = override?.ticket_type || g.ticket_type;
  const finalTeam = override?.team || g.team;
  const finalPrice = finalTicketType === 'gratis' ? 0 : 39;

  g.is_checked_in = true;
  g.checked_in_at = now;
  g.wristband_issued = true;
  g.payment_status = finalTicketType === 'placa' ? 'placeno' : 'gratis';
  g.ticket_type = finalTicketType;
  g.team = finalTeam;
  g.price = finalPrice;
  g.updated_at = now;

  saveLocalStore(store);
  return g;
}

/**
 * Undo Check In (Storno)
 */
export async function undoCheckIn(id: number): Promise<Guest> {
  await initDb();
  if (pool) {
    const res = await pool.query(
      `
      UPDATE guests 
      SET 
        is_checked_in = FALSE,
        checked_in_at = NULL,
        wristband_issued = FALSE,
        payment_status = 'neplaceno',
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );
    if (res.rows.length === 0) throw new Error('Guest not found');
    const r = res.rows[0];
    return { ...r, price: Number(r.price) };
  }

  const store = getLocalStore();
  const g = store.guests.find(x => x.id === id);
  if (!g) throw new Error('Guest not found');

  g.is_checked_in = false;
  g.checked_in_at = null;
  g.wristband_issued = false;
  g.payment_status = 'neplaceno';
  g.updated_at = new Date().toISOString();

  saveLocalStore(store);
  return g;
}

/**
 * Update guest details
 */
export async function updateGuest(id: number, data: Partial<Guest>): Promise<Guest> {
  await initDb();
  if (pool) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(data)) {
      if (['name', 'team', 'ticket_type', 'table_name', 'reservation_status', 'note'].includes(key)) {
        fields.push(`${key} = $${idx++}`);
        values.push(val);
      }
    }
    if (data.ticket_type !== undefined) {
      fields.push(`price = $${idx++}`);
      values.push(data.ticket_type === 'gratis' ? 0 : 39);
    }
    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE guests SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await pool.query(query, values);
    if (res.rows.length === 0) throw new Error('Guest not found');
    const r = res.rows[0];
    return { ...r, price: Number(r.price) };
  }

  const store = getLocalStore();
  const g = store.guests.find(x => x.id === id);
  if (!g) throw new Error('Guest not found');

  Object.assign(g, data);
  if (data.ticket_type !== undefined) {
    g.price = data.ticket_type === 'gratis' ? 0 : 39;
  }
  g.updated_at = new Date().toISOString();
  saveLocalStore(store);
  return g;
}

/**
 * Delete a guest
 */
export async function deleteGuest(id: number): Promise<boolean> {
  await initDb();
  if (pool) {
    const res = await pool.query(`DELETE FROM guests WHERE id = $1`, [id]);
    return (res.rowCount ?? 0) > 0;
  }

  const store = getLocalStore();
  const initialLen = store.guests.length;
  store.guests = store.guests.filter(x => x.id !== id);
  saveLocalStore(store);
  return store.guests.length < initialLen;
}

/**
 * Import multiple guests (from CSV)
 */
export async function importGuests(
  incoming: Array<{
    name: string;
    team?: string;
    ticket_type?: string;
    table_name?: string;
    reservation_status?: string;
    note?: string;
  }>,
  mode: 'append' | 'replace' = 'append'
): Promise<{ added: number; replaced: boolean }> {
  await initDb();

  const formatted: Array<Partial<Guest>> = incoming
    .filter(g => g.name && g.name.trim().length > 0)
    .map(g => {
      let team: TeamType = 'Regularni';
      const rawTeam = (g.team || '').trim().toLowerCase();
      if (rawTeam.includes('ela')) team = 'Ela';
      else if (rawTeam.includes('joe')) team = 'Joe';
      else if (rawTeam.includes('dupli')) team = 'Dupli';
      else if (rawTeam.includes('silva')) team = 'Silvaši';

      let ticket_type: TicketType = 'placa';
      const rawTicket = (g.ticket_type || '').trim().toLowerCase();
      if (rawTicket.includes('gratis') || rawTicket.includes('besplat') || rawTicket === '0') {
        ticket_type = 'gratis';
      }

      let reservation_status: ReservationStatus = 'potvrdjeno';
      const rawRes = (g.reservation_status || '').trim().toLowerCase();
      if (rawRes.includes('cekanj') || rawRes.includes('waiting')) {
        reservation_status = 'na_cekanju';
      }

      return {
        name: g.name.trim(),
        team,
        ticket_type,
        price: ticket_type === 'gratis' ? 0 : 39,
        table_name: (g.table_name || '').trim(),
        reservation_status,
        note: (g.note || '').trim(),
        is_checked_in: false,
        wristband_issued: false,
        payment_status: 'neplaceno',
      };
    });

  if (pool) {
    if (mode === 'replace') {
      await pool.query(`TRUNCATE TABLE guests RESTART IDENTITY`);
    }

    let addedCount = 0;
    for (const g of formatted) {
      await pool.query(
        `
        INSERT INTO guests (
          name, team, ticket_type, price, table_name, reservation_status,
          is_checked_in, payment_status, wristband_issued, note
        ) VALUES ($1, $2, $3, $4, $5, $6, FALSE, 'neplaceno', FALSE, $7)
        `,
        [g.name, g.team, g.ticket_type, g.price, g.table_name, g.reservation_status, g.note]
      );
      addedCount++;
    }
    return { added: addedCount, replaced: mode === 'replace' };
  }

  const store = getLocalStore();
  if (mode === 'replace') {
    store.guests = [];
    store.nextId = 1;
  }

  let count = 0;
  for (const g of formatted) {
    store.guests.push({
      id: store.nextId++,
      name: g.name!,
      team: g.team as TeamType,
      ticket_type: g.ticket_type as TicketType,
      price: g.price!,
      table_name: g.table_name || '',
      reservation_status: g.reservation_status as ReservationStatus,
      is_checked_in: false,
      wristband_issued: false,
      payment_status: 'neplaceno',
      note: g.note || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    count++;
  }

  saveLocalStore(store);
  return { added: count, replaced: mode === 'replace' };
}

/**
 * Close Event with actual cash count
 */
export async function closeEvent(actualCash: number, notes?: string): Promise<EventMeta> {
  await initDb();
  const now = new Date().toISOString();

  if (pool) {
    const res = await pool.query(
      `
      UPDATE event_meta
      SET 
        is_closed = TRUE,
        actual_cash_counted = $1,
        closed_at = $2,
        closed_notes = $3
      WHERE id = 'current'
      RETURNING *
      `,
      [actualCash, now, notes || '']
    );
    const r = res.rows[0];
    return {
      ...r,
      ticket_price: Number(r.ticket_price),
      catering_split: Number(r.catering_split),
      org_split: Number(r.org_split),
      actual_cash_counted: Number(r.actual_cash_counted),
    };
  }

  const store = getLocalStore();
  store.meta.is_closed = true;
  store.meta.actual_cash_counted = actualCash;
  store.meta.closed_at = now;
  store.meta.closed_notes = notes || '';
  saveLocalStore(store);
  return store.meta;
}

/**
 * Re-open Event
 */
export async function reopenEvent(): Promise<EventMeta> {
  await initDb();
  if (pool) {
    const res = await pool.query(
      `
      UPDATE event_meta
      SET is_closed = FALSE, actual_cash_counted = NULL, closed_at = NULL
      WHERE id = 'current'
      RETURNING *
      `
    );
    const r = res.rows[0];
    return {
      ...r,
      ticket_price: Number(r.ticket_price),
      catering_split: Number(r.catering_split),
      org_split: Number(r.org_split),
      actual_cash_counted: null,
    };
  }

  const store = getLocalStore();
  store.meta.is_closed = false;
  store.meta.actual_cash_counted = null;
  store.meta.closed_at = null;
  saveLocalStore(store);
  return store.meta;
}
