import { NextResponse } from 'next/server';
import { saveLink, getLink } from '../../../src/lib/db';

function generateShortId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const { payload } = await request.json();
    if (!payload || typeof payload !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Try to generate a unique ID
    let id = generateShortId();
    let maxRetries = 5;
    while (getLink(id) !== null && maxRetries > 0) {
      id = generateShortId();
      maxRetries--;
    }

    if (maxRetries === 0) {
      return NextResponse.json({ error: 'Failed to generate unique ID' }, { status: 500 });
    }

    saveLink(id, payload);

    return NextResponse.json({ id });
  } catch (e) {
    console.error('Failed to save link', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
  }

  try {
    const payload = getLink(id);
    if (!payload) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json({ payload });
  } catch (e) {
    console.error('Failed to get link', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
