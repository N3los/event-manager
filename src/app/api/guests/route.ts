import { NextResponse } from 'next/server';
import { getGuests, addGuest, getEventMeta } from '@/lib/db';
import { calculateFinancials } from '@/lib/calculator';

export async function GET() {
  try {
    const [guests, meta] = await Promise.all([getGuests(), getEventMeta()]);
    const stats = calculateFinancials(guests, meta);
    return NextResponse.json({ success: true, guests, meta, stats });
  } catch (err: any) {
    console.error('Error fetching guests:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: 'Ime i prezime je obavezno' }, { status: 400 });
    }

    const newGuest = await addGuest({
      name: body.name,
      team: body.team,
      ticket_type: body.ticket_type,
      table_name: body.table_name,
      reservation_status: body.reservation_status,
      note: body.note,
      is_checked_in: body.is_checked_in,
    });

    const [guests, meta] = await Promise.all([getGuests(), getEventMeta()]);
    const stats = calculateFinancials(guests, meta);

    return NextResponse.json({ success: true, guest: newGuest, stats });
  } catch (err: any) {
    console.error('Error adding guest:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
