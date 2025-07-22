
'use server';
/**
 * @fileOverview A Genkit flow to generate a simulated weather forecast.
 * This flow creates plausible weather data for different time periods (day, week, month)
 * without needing a real weather API, making it ideal for demonstration.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema: Defines what information the flow needs.
const GetWeatherForecastInputSchema = z.object({
  location: z.string().describe('The location for the weather forecast (e.g., city, state).'),
  period: z.enum(['day', 'week', 'month']).describe("The forecast period: 'day', 'week', or 'month'."),
});
export type GetWeatherForecastInput = z.infer<typeof GetWeatherForecastInputSchema>;

// Output Schema: Defines the structure of the data the flow returns.
const DailyForecastSchema = z.object({
    date: z.string().describe("The date of the forecast in 'YYYY-MM-DD' format."),
    dayOfWeek: z.string().describe("The day of the week (e.g., 'Segunda-feira')."),
    minTemp: z.number().describe('The minimum forecasted temperature in Celsius.'),
    maxTemp: z.number().describe('The maximum forecasted temperature in Celsius.'),
    condition: z.string().describe("A brief text description of the weather condition (e.g., 'Parcialmente Nublado')."),
    icon: z.enum(['Sun', 'Cloud', 'Cloudy', 'Rain', 'Storm', 'Snowflake']).describe("An icon code representing the condition."),
    humidity: z.number().describe("The average humidity percentage."),
    windSpeed: z.number().describe("The average wind speed in km/h."),
});
export type DailyForecast = z.infer<typeof DailyForecastSchema>;

const GetWeatherForecastOutputSchema = z.object({
  forecasts: z.array(DailyForecastSchema).describe('A list of daily forecast objects for the requested period.'),
});
export type GetWeatherForecastOutput = z.infer<typeof GetWeatherForecastOutputSchema>;

// Exported function that the application will call.
export async function getWeatherForecast(input: GetWeatherForecastInput): Promise<GetWeatherForecastOutput> {
  // Since this is a simulation, we can generate the data directly.
  // In a real scenario, this is where you might call an AI model or an external API.
  return generateSimulatedForecast(input.period);
}


/**
 * Generates a simulated weather forecast.
 * @param period - The period to generate the forecast for.
 * @returns A simulated forecast that matches the output schema.
 */
function generateSimulatedForecast(period: 'day' | 'week' | 'month'): GetWeatherForecastOutput {
  const forecasts: DailyForecast[] = [];
  const today = new Date();
  const days = period === 'day' ? 1 : period === 'week' ? 7 : 30;

  const conditions: {condition: string, icon: 'Sun' | 'Cloud' | 'Cloudy' | 'Rain' | 'Storm'}[] = [
    { condition: 'Ensolarado', icon: 'Sun' },
    { condition: 'Parcialmente Nublado', icon: 'Cloud' },
    { condition: 'Nublado', icon: 'Cloudy' },
    { condition: 'Pancadas de Chuva', icon: 'Rain' },
    { condition: 'Tempestade', icon: 'Storm' },
  ];
  
  const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  for (let i = 0; i < days; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);

    const baseMinTemp = 18;
    const baseMaxTemp = 28;
    
    // Simulate some variation
    const minTemp = parseFloat((baseMinTemp + Math.random() * 4 - 2).toFixed(1)); // +/- 2 degrees
    const maxTemp = parseFloat((baseMaxTemp + Math.random() * 5 - 2.5).toFixed(1)); // +/- 2.5 degrees
    const selectedCondition = conditions[Math.floor(Math.random() * conditions.length)];

    forecasts.push({
      date: futureDate.toISOString().split('T')[0],
      dayOfWeek: dayNames[futureDate.getDay()],
      minTemp: Math.min(minTemp, maxTemp - 2), // Ensure min is always lower
      maxTemp: Math.max(maxTemp, minTemp + 2), // Ensure max is always higher
      condition: selectedCondition.condition,
      icon: selectedCondition.icon,
      humidity: 60 + Math.floor(Math.random() * 25), // 60% - 85%
      windSpeed: 5 + Math.floor(Math.random() * 10), // 5 - 15 km/h
    });
  }

  return { forecasts };
}
