
'use server';

/**
 * @fileOverview A server action to get the current ambient temperature.
 * This has been converted from a Genkit flow to a standard Next.js Server Action.
 * This change prevents the server from crashing on startup if a Genkit-related
 * API key (like GOOGLE_API_KEY) is not configured in the environment,
 * as this function does not require AI capabilities.
 *
 * - getAmbientTemperature - A function that returns the ambient temperature for a hardcoded location.
 * - AmbientTemperatureOutput - The return type for the getAmbientTemperature function.
 */

import {z} from 'zod';

const AmbientTemperatureOutputSchema = z.object({
  temperature: z.number().describe('The current ambient temperature in Celsius.'),
});
export type AmbientTemperatureOutput = z.infer<typeof AmbientTemperatureOutputSchema>;

/**
 * Gets the simulated ambient temperature. In a real application this could
 * call a weather API. For this prototype, it returns a static value.
 * This is a server action and does not require Genkit to be initialized,
 * making the application's home page more resilient.
 * @returns {Promise<AmbientTemperatureOutput>} An object containing the temperature.
 */
export async function getAmbientTemperature(): Promise<AmbientTemperatureOutput> {
  // Simulate fetching ambient temperature from an external source
  try {
    // In a real application, you might call a weather API.
    // For this prototype, we'll return a static cool temperature.
    return { temperature: 24 };
  } catch (e) {
    console.error("Feature failed (getAmbientTemperature):", e);
    // Provide a fallback temperature
    return { temperature: 18 };
  }
}
