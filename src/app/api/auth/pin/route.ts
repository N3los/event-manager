import { NextResponse } from 'next/server';

const VALID_PIN = process.env.EVENT_PIN || '1234';

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();
    if (!pin || pin.trim() !== VALID_PIN) {
      return NextResponse.json({ success: false, error: 'Pogrešan PIN kod' }, { status: 401 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
