import { NextResponse } from 'next/server';
import { getLatestReading } from '@/services/sensor-cache-service';

/**
 * @fileoverview API endpoint to fetch the latest reading for a specific sensor.
 */

/**
 * Handles GET requests to fetch a sensor reading by its MAC address.
 *
 * @param {Request} request The incoming request.
 * @param {object} context The route context, containing dynamic parameters.
 * @param {string} context.params.mac The MAC address of the sensor, extracted from the URL.
 * @returns {Promise<NextResponse>} A JSON response with sensor data or a 404 error.
 */
export async function GET(
  request: Request,
  context: { params: { mac: string } }
) {
  const { mac } = context.params;

  if (!mac) {
    return NextResponse.json({ message: 'MAC address não fornecido.' }, { status: 400 });
  }

  const reading = getLatestReading(mac);

  if (reading) {
    return NextResponse.json(reading);
  } else {
    // Returns 404 but with JSON to be more informative.
    // It's normal to have no data initially, so it's not a server error.
    return NextResponse.json(
        { temperature: null, timestamp: null, message: 'Nenhuma leitura encontrada para este MAC address.' },
        { status: 404 }
    );
  }
}
