// This API route has been removed as it was specific to the Firestore integration.
// Supabase interactions will be handled differently, likely via RPC functions or direct client-to-API calls.
import { NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 410, // 410 Gone
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  console.log('[VigiaTemp API] This endpoint is deprecated and no longer functional.');
  return NextResponse.json(
    { message: 'This API endpoint is no longer in use. Please update your device firmware.' }, 
    { 
      status: 410, // 410 Gone
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    }
  );
}
