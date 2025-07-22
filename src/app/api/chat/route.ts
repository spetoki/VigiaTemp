// This file is intentionally left blank.
// The AI Chat feature has been removed.
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  return NextResponse.json({ error: 'Chat feature is not available.' }, { status: 404 });
}
