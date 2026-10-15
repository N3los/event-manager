import { NextResponse } from 'next/server';
import { reopenEvent, getGuests } from '@/lib/db';
import { calculateFinancials } from '@/lib/calculator';

const VALID_PIN = process.env.EVENT_PIN || '1234';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.pin && body.pin.trim() !== VALID_PIN) {
      return NextResponse.json({ success: false, error: 'Pogrešan PIN kod' }, { status: 403 });
    }

    const meta = await reopenEvent();
    const guests = await getGuests();
    const stats = calculateFinancials(guests, meta);

    return NextResponse.json({ success: true, meta, stats });
  } catch (err: any) {
    console.error('Error reopening event:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
