import { NextResponse } from 'next/server';
import { importGuests, getGuests, getEventMeta } from '@/lib/db';
import { calculateFinancials } from '@/lib/calculator';

function normalizeGoogleSheetsUrl(rawUrl: string): string {
  const url = rawUrl.trim();
  const sheetMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!sheetMatch) {
    return url;
  }

  const sheetId = sheetMatch[1];

  // Try to find gid in query or hash (#gid=123 or ?gid=123)
  const gidMatch = url.match(/[?#&]gid=([0-9]+)/);
  const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
}

function parseCsv(csvText: string) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Detect delimiter: comma or semicolon
  const headerLine = lines[0];
  const delimiter = headerLine.includes(';') ? ';' : ',';

  // Parse header
  const headers = parseCsvLine(headerLine, delimiter).map(h => h.trim().toLowerCase());

  // Find column indices
  let nameIdx = headers.findIndex(h => h === 'ime i prezime' || h === 'ime' || h.includes('name'));
  if (nameIdx === -1) nameIdx = headers.findIndex(h => h.includes('ime'));
  if (nameIdx === -1) nameIdx = 0;

  let teamIdx = headers.findIndex(h => h === 'rezervacija preko' || h.includes('preko') || h.includes('tim') || h.includes('team') || h.includes('kategorij'));

  let ticketIdx = headers.findIndex(h => h.includes('ulaznic') || h.includes('ticket'));
  if (ticketIdx === -1) ticketIdx = headers.findIndex(h => h.includes('placa') || h.includes('cijena'));

  let tableIdx = headers.findIndex(h => h.includes('stol') || h.includes('table'));
  let resIdx = headers.findIndex((h, i) => i !== teamIdx && (h === 'rezervacija' || h.includes('status') || h.includes('rezervacij')));
  let noteIdx = headers.findIndex(h => h.includes('napomen') || h.includes('note'));

  // If no "Ime" header found, assume column 0 is name
  if (nameIdx === -1) nameIdx = 0;

  const result: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i], delimiter);
    if (!row || row.length === 0) continue;

    const name = (row[nameIdx] || '').trim();
    if (!name) continue;

    const team = teamIdx !== -1 ? row[teamIdx] : 'Regularni';
    const ticket_type = ticketIdx !== -1 ? row[ticketIdx] : 'placa';
    const table_name = tableIdx !== -1 ? row[tableIdx] : '';
    const reservation_status = resIdx !== -1 ? row[resIdx] : 'potvrdjeno';
    const note = noteIdx !== -1 ? row[noteIdx] : '';

    result.push({
      name,
      team,
      ticket_type,
      table_name,
      reservation_status,
      note,
    });
  }

  return result;
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let csvDataToParse = body.csvText || '';

    // If a public link / Google Sheets link is provided, fetch it directly
    if (body.url && body.url.trim()) {
      const exportUrl = normalizeGoogleSheetsUrl(body.url);
      const response = await fetch(exportUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      if (!response.ok) {
        throw new Error(`Neuspjelo dohvaćanje datoteke s linka (Status: ${response.status}). Provjerite ima li Google tablica uključeno 'Anyone with the link can view'.`);
      }

      csvDataToParse = await response.text();
    }

    let guestsToImport: any[] = [];
    if (csvDataToParse) {
      guestsToImport = parseCsv(csvDataToParse);
    } else if (Array.isArray(body.guests)) {
      guestsToImport = body.guests;
    }

    if (guestsToImport.length === 0) {
      return NextResponse.json({ success: false, error: 'Nema pronađenih gostiju u datoteci ili na linku' }, { status: 400 });
    }

    const mode = body.mode === 'replace' ? 'replace' : 'append';
    const res = await importGuests(guestsToImport, mode);

    const [guests, meta] = await Promise.all([getGuests(), getEventMeta()]);
    const stats = calculateFinancials(guests, meta);

    return NextResponse.json({ 
      success: true, 
      count: res.added, 
      replaced: res.replaced, 
      stats,
      sampleNames: guestsToImport.slice(0, 3).map(g => g.name)
    });
  } catch (err: any) {
    console.error('Error importing CSV:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
