
/**
 * @fileOverview A simple in-memory cache for sensor readings.
 * This service provides a temporary, server-side storage mechanism to hold the
 * latest temperature reading received from IoT devices. This allows the frontend
 * to fetch real-time data without needing a full database setup, making it
 * ideal for prototyping. The cache is reset whenever the server restarts.
 */

interface SensorReading {
  temperature: number;
  timestamp: number;
}

// Using a Map for efficient key-based lookups.
const sensorCache = new Map<string, SensorReading>();

/**
 * Stores the latest temperature reading for a given MAC address.
 * MAC addresses are stored in uppercase to ensure consistency.
 * @param macAddress The unique MAC address of the sensor device.
 * @param temperature The temperature reading in Celsius.
 */
export function setLatestReading(macAddress: string, temperature: number) {
  if (!macAddress) return;
  sensorCache.set(macAddress.toUpperCase(), {
    temperature,
    timestamp: Date.now(),
  });
}

/**
 * Retrieves the latest temperature reading for a given MAC address.
 * @param macAddress The MAC address to look up.
 * @returns The latest SensorReading object, or undefined if not found.
 */
export function getLatestReading(macAddress: string): SensorReading | undefined {
  if (!macAddress) return undefined;
  return sensorCache.get(macAddress.toUpperCase());
}
