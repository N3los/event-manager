import { NextResponse } from 'next/server';
import { closeEvent, getGuests, getEventMeta } from '@/lib/db';
import { calculateFinancials } from '@/lib/calculator';

const VALID_PIN = process.env.EVENT_PIN || '1234';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Check PIN if provided
    if (body.pin && body.pin.trim() !== VALID_PIN) {
      return NextResponse.json({ success: false, error: 'Pogrešan PIN kod' }, { status: 403 });
    }

    if (body.actualCash === undefined || isNaN(Number(body.actualCash))) {
      return NextResponse.json({ success: false, error: 'Morate unijeti stvarni iznos prebrojane gotovine' }, { status: 400 });
    }

    const meta = await closeEvent(Number(body.actualCash), body.notes);
    const guests = await getGuests();
    const stats = calculateFinancials(guests, meta);

    return NextResponse.json({ success: true, meta, stats });
  } catch (err: any) {
    console.error('Error closing event:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
