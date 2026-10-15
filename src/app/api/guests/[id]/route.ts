import { NextResponse } from 'next/server';
import { updateGuest, deleteGuest, getGuests, getEventMeta } from '@/lib/db';
import { calculateFinancials } from '@/lib/calculator';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateGuest(Number(id), body);
    const [guests, meta] = await Promise.all([getGuests(), getEventMeta()]);
    const stats = calculateFinancials(guests, meta);

    return NextResponse.json({ success: true, guest: updated, stats });
  } catch (err: any) {
    console.error('Error updating guest:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteGuest(Number(id));
    const [guests, meta] = await Promise.all([getGuests(), getEventMeta()]);
    const stats = calculateFinancials(guests, meta);

    return NextResponse.json({ success: true, stats });
  } catch (err: any) {
    console.error('Error deleting guest:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
