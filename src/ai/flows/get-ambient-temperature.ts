
'use server';

/**
 * @fileOverview A Genkit flow to get the current ambient temperature for a given location.
 * This flow now uses a tool to fetch weather data, making it more robust and extensible.
 *
 * - getAmbientTemperature - A function that returns the ambient temperature for a hardcoded location.
 * - AmbientTemperatureOutput - The return type for the getAmbientTemperature function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getRealTimeWeather } from '../tools/weather-tool';

const AmbientTemperatureOutputSchema = z.object({
  temperature: z.number().describe('The current ambient temperature in Celsius.'),
});
export type AmbientTemperatureOutput = z.infer<typeof AmbientTemperatureOutputSchema>;

const getAmbientTemperatureFlow = ai.defineFlow(
  {
    name: 'getAmbientTemperatureFlow',
    inputSchema: z.string(),
    outputSchema: AmbientTemperatureOutputSchema,
  },
  async (location) => {
    const llmResponse = await ai.generate({
      prompt: `What is the current temperature in ${location}?`,
      model: 'googleai/gemini-1.5-flash-latest',
      tools: [getRealTimeWeather],
    });

    const toolRequests = llmResponse.toolRequests;
    
    if (toolRequests && toolRequests.length > 0) {
      // We only expect one tool request in this flow
      const toolRequest = toolRequests[0];
      const toolOutput = await toolRequest.function();
      
      if (toolOutput && typeof toolOutput.temperature === 'number') {
          return { temperature: toolOutput.temperature };
      }
    }

    // Fallback if the tool doesn't work or is not called
    console.warn("AI did not use the weather tool, or tool returned invalid data. Falling back to default temperature.");
    return { temperature: 22 };
  }
);


export async function getAmbientTemperature(): Promise<AmbientTemperatureOutput> {
  // Simulate fetching ambient temperature from an external source
  try {
    // In a real application, you might use a location from the user's profile.
    const location = "Fazenda de Cacau, Bahia";
    return await getAmbientTemperatureFlow(location);
  } catch (e) {
    console.error("Feature failed (getAmbientTemperature):", e);
    // Provide a fallback temperature
    return { temperature: 18 };
  }
}
