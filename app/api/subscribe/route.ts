import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber } from '../../../lib/subscribers-store';
import { sendSubscriptionEmail } from '../../../lib/email';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let email = '';
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const payload = await request.json();
    email = isNonEmptyString(payload?.email) ? payload.email.trim() : '';
  } else {
    const formData = await request.formData();
    const raw = formData.get('email');
    email = typeof raw === 'string' ? raw.trim() : '';
  }

  if (!email || !isEmail(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  try {
    const result = await addSubscriber(email);
    if (result === 'created') {
      try {
        await sendSubscriptionEmail(email);
      } catch (mailError) {
        console.error('Failed to send subscription email:', mailError);
      }
    }
    return NextResponse.json({ status: result });
  } catch (error) {
    console.error('Failed to save subscriber:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
