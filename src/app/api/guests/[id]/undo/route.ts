import { NextResponse } from 'next/server';
import { undoCheckIn, getGuests, getEventMeta } from '@/lib/db';
import { calculateFinancials } from '@/lib/calculator';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updated = await undoCheckIn(Number(id));
    const [guests, meta] = await Promise.all([getGuests(), getEventMeta()]);
    const stats = calculateFinancials(guests, meta);

    return NextResponse.json({ success: true, guest: updated, stats });
  } catch (err: any) {
    console.error('Error during undo:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
