'use server';
/**
 * @fileOverview A tool for fetching real-time weather information.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * The actual logic for fetching weather. In a real app, this would call an API.
 * Here, it simulates a cool temperature.
 * @param location - The location to fetch weather for (unused in simulation).
 * @returns An object with the temperature.
 */
export async function fetchSimulatedWeather(
    location: string
): Promise<{temperature: number}> {
  // In a real application, you would call a real weather API here.
  // For this simulation, we'll return a random cool temperature
  // to better match the user's context.
  const simulatedTemp = 3 + Math.random() * 5; // Random temp between 3°C and 8°C
  return {
    temperature: parseFloat(simulatedTemp.toFixed(1)),
  };
}


export const getRealTimeWeather = ai.defineTool(
  {
    name: 'getRealTimeWeather',
    description: 'Returns the current weather for a given location.',
    inputSchema: z.object({
      location: z.string().describe('The city and state, e.g., San Francisco, CA'),
    }),
    outputSchema: z.object({
        temperature: z.number().describe('The current temperature in Celsius.'),
    }),
  },
  async ({location}) => {
    return await fetchSimulatedWeather(location);
  }
);
