// This file is no longer needed and is being removed.
// The logic for fetching sensor data has been moved to directly read from Firestore
// in the frontend components, making this API endpoint obsolete.
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: { mac: string } }
) {
    return NextResponse.json({ message: 'Este endpoint foi descontinuado.' }, { status: 410 });
}
