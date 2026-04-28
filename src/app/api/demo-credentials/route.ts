import { NextResponse } from 'next/server';

export async function GET() {
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Missing DEMO_EMAIL or DEMO_PASSWORD.' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { email, password },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
