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

// Define the prompt outside the flow for efficiency
const getAmbientTemperaturePrompt = ai.definePrompt({
    name: 'getAmbientTemperaturePrompt',
    tools: [getRealTimeWeather],
    // The output schema tells the LLM what we expect back
    output: { schema: AmbientTemperatureOutputSchema },
    prompt: 'What is the current temperature in São Paulo, Brazil? Use the available tools.'
});


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
      // Call the pre-defined prompt
      const result = await getAmbientTemperaturePrompt();

      const temp = result.output?.temperature;

      if (temp === undefined) {
        // Fallback in case the tool use fails silently.
        return { temperature: 18 };
      }

      return { temperature: temp };
    } catch (e) {
      // AI features are disabled if the API key is missing or invalid.
      // Return a default temperature to allow the app to function.
      console.error("AI feature failed (getAmbientTemperature):", e);
      return { temperature: 18 };
    }
  }
);
