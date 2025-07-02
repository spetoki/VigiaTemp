'use server';
/**
 * @fileOverview A tool for fetching real-time weather information.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { fetchSimulatedWeather } from '@/services/weather-service';

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
