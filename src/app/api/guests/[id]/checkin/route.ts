import { NextResponse } from 'next/server';
import { checkInGuest, getGuests, getEventMeta } from '@/lib/db';
import { calculateFinancials } from '@/lib/calculator';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let override;
    try {
      override = await req.json();
    } catch {
      override = undefined;
    }

    const updated = await checkInGuest(Number(id), override);
    const [guests, meta] = await Promise.all([getGuests(), getEventMeta()]);
    const stats = calculateFinancials(guests, meta);

    return NextResponse.json({ success: true, guest: updated, stats });
  } catch (err: any) {
    console.error('Error during check-in:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
