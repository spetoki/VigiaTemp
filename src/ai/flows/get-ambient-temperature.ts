
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
import { fetchSimulatedWeather } from '@/ai/tools/weather-tool';

const AmbientTemperatureOutputSchema = z.object({
  temperature: z.number().describe('The current ambient temperature in Celsius.'),
});
export type AmbientTemperatureOutput = z.infer<typeof AmbientTemperatureOutputSchema>;

/**
 * Gets the simulated ambient temperature by calling the weather tool directly.
 * This is a server action and does not require Genkit to be initialized,
 * making the application's home page more resilient.
 * @returns {Promise<AmbientTemperatureOutput>} An object containing the temperature.
 */
export async function getAmbientTemperature(): Promise<AmbientTemperatureOutput> {
  try {
    // For this simple task, it's more efficient to call the underlying
    // weather logic directly instead of invoking an LLM or a Genkit flow.
    const weather = await fetchSimulatedWeather('São Paulo, Brazil');
    return { temperature: weather.temperature };
  } catch (e) {
    // The direct function call is local, but a fallback is still good practice
    // in case of unexpected errors.
    console.error("Feature failed (getAmbientTemperature):", e);
    return { temperature: 18 };
  }
}
