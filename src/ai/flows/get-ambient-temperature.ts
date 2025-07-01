'use server';

/**
 * @fileOverview A Genkit flow to get the current ambient temperature using a weather tool.
 *
 * - getAmbientTemperature - A function that returns the ambient temperature for a hardcoded location.
 * - AmbientTemperatureOutput - The return type for the getAmbientTemperature function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getRealTimeWeather } from '@/ai/tools/weather-tool'; // Import the tool

const AmbientTemperatureOutputSchema = z.object({
  temperature: z.number().describe('The current ambient temperature in Celsius.'),
});
export type AmbientTemperatureOutput = z.infer<typeof AmbientTemperatureOutputSchema>;

export async function getAmbientTemperature(): Promise<AmbientTemperatureOutput> {
  return getAmbientTemperatureFlow();
}

const getAmbientTemperatureFlow = ai.defineFlow(
  {
    name: 'getAmbientTemperatureFlow',
    inputSchema: z.void(),
    outputSchema: AmbientTemperatureOutputSchema,
  },
  async () => {
    try {
      // Call the tool directly instead of using an LLM prompt for this simple task.
      // This is more efficient and robust.
      const weather = await getRealTimeWeather({ location: 'São Paulo, Brazil' });
      return { temperature: weather.temperature };
    } catch (e) {
      // The direct tool call is local, but a fallback is still good practice
      // in case of unexpected errors.
      console.error("Feature failed (getAmbientTemperature):", e);
      return { temperature: 18 };
    }
  }
);
