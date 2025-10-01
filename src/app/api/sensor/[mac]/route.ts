// This file is no longer needed and is being removed.
// The logic for handling sensor data is now in /api/sensor/route.ts.
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: { mac: string } }
) {
    return NextResponse.json({ message: 'Este endpoint foi descontinuado.' }, { status: 410 });
}
