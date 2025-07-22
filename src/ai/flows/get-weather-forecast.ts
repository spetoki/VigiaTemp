
'use server';
/**
 * @fileOverview A Genkit flow to generate a simulated weather forecast.
 * This flow creates plausible weather data for different time periods (day, week, month)
 * including hourly forecasts for each day, without needing a real weather API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema: Defines what information the flow needs.
const GetWeatherForecastInputSchema = z.object({
  location: z.string().describe('The location for the weather forecast (e.g., city, state).'),
  period: z.enum(['day', 'week', 'month']).describe("The forecast period: 'day', 'week', or 'month'."),
});
export type GetWeatherForecastInput = z.infer<typeof GetWeatherForecastInputSchema>;

// Shared type for weather conditions and icons
type WeatherCondition = {
    condition: string;
    icon: 'Sun' | 'Cloud' | 'Cloudy' | 'Rain' | 'Storm' | 'Snowflake';
};

// Output Schema: Defines the structure of the data the flow returns.
const HourlyForecastSchema = z.object({
  time: z.string().describe("The time of the forecast in 'HH:00' format."),
  temp: z.number().describe('The temperature in Celsius.'),
  condition: z.string().describe("A brief text description of the weather condition."),
  icon: z.enum(['Sun', 'Cloud', 'Cloudy', 'Rain', 'Storm', 'Snowflake']).describe("An icon code representing the condition."),
  humidity: z.number().describe("The humidity percentage."),
  windSpeed: z.number().describe("The wind speed in km/h."),
});
export type HourlyForecast = z.infer<typeof HourlyForecastSchema>;

const DailyForecastSchema = z.object({
    date: z.string().describe("The date of the forecast in 'YYYY-MM-DD' format."),
    dayOfWeek: z.string().describe("The day of the week (e.g., 'Segunda-feira')."),
    minTemp: z.number().describe('The minimum forecasted temperature in Celsius.'),
    maxTemp: z.number().describe('The maximum forecasted temperature in Celsius.'),
    condition: z.string().describe("A brief text description of the weather condition (e.g., 'Parcialmente Nublado')."),
    icon: z.enum(['Sun', 'Cloud', 'Cloudy', 'Rain', 'Storm', 'Snowflake']).describe("An icon code representing the condition."),
    humidity: z.number().describe("The average humidity percentage."),
    windSpeed: z.number().describe("The average wind speed in km/h."),
    hourly: z.array(HourlyForecastSchema).describe("An array of hourly forecasts for this day."),
});
export type DailyForecast = z.infer<typeof DailyForecastSchema>;

const GetWeatherForecastOutputSchema = z.object({
  forecasts: z.array(DailyForecastSchema).describe('A list of daily forecast objects for the requested period.'),
});
export type GetWeatherForecastOutput = z.infer<typeof GetWeatherForecastOutputSchema>;

// Exported function that the application will call.
export async function getWeatherForecast(input: GetWeatherForecastInput): Promise<GetWeatherForecastOutput> {
  // Pass the location to the simulation function.
  return generateSimulatedForecast(input.period, input.location);
}

/**
 * Generates a simulated weather forecast.
 * @param period - The period to generate the forecast for.
 * @param location - The location for the forecast.
 * @returns A simulated forecast that matches the output schema.
 */
function generateSimulatedForecast(period: 'day' | 'week' | 'month', location: string): GetWeatherForecastOutput {
  const forecasts: DailyForecast[] = [];
  const today = new Date();
  const days = period === 'day' ? 1 : period === 'week' ? 7 : 30;

  const conditions: WeatherCondition[] = [
    { condition: 'Ensolarado', icon: 'Sun' },
    { condition: 'Parcialmente Nublado', icon: 'Cloud' },
    { condition: 'Nublado', icon: 'Cloudy' },
    { condition: 'Pancadas de Chuva', icon: 'Rain' },
    { condition: 'Tempestade', icon: 'Storm' },
    { condition: 'Neve Leve', icon: 'Snowflake' },
  ];
  
  const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  
  // A simple hash function to get a seed from the location string
  const getLocationSeed = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  const seed = getLocationSeed(location);

  for (let i = 0; i < days; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);

    // Use seed to make the weather consistent for the same location
    const dailyRandomizer = (offset: number) => Math.sin(seed + i * 100 + offset) * 0.5 + 0.5;

    const baseMinTemp = 18 + dailyRandomizer(1) * 4 - 2; // Base min temp for the day
    const baseMaxTemp = 28 + dailyRandomizer(2) * 5 - 2.5; // Base max temp for the day
    
    const hourlyForecasts: HourlyForecast[] = [];
    
    // Determine the primary condition for the day for summary, but allow hourly variations.
    const primaryDayCondition = conditions[Math.floor(dailyRandomizer(3) * (conditions.length - 2))]; // Avoid storm/snow as primary

    for (let h = 0; h < 24; h++) {
        const hourRandomizer = (offset: number) => Math.sin(seed + i * 100 + h * 10 + offset) * 0.5 + 0.5;
        
        // Simulate a daily temperature curve (cooler at night, warmer mid-day)
        const sineWave = -Math.cos((h / 23) * 2 * Math.PI); // Peaks around hour 12
        let temp = baseMinTemp + (baseMaxTemp - baseMinTemp) * (sineWave * 0.5 + 0.5);
        temp += (hourRandomizer(1) - 0.5) * 2; // Add some noise

        // Simulate hourly weather condition changes
        let currentHourCondition = primaryDayCondition;
        // Chance of rain in the afternoon/evening
        if (h > 14 && h < 20 && hourRandomizer(4) > 0.8) {
            currentHourCondition = conditions.find(c => c.icon === 'Rain') as WeatherCondition;
        } else if (hourRandomizer(5) > 0.9) { // Small chance of being different from primary
            currentHourCondition = conditions[Math.floor(hourRandomizer(6) * (conditions.length - 2))];
        }

        hourlyForecasts.push({
            time: `${h.toString().padStart(2, '0')}:00`,
            temp: parseFloat(temp.toFixed(1)),
            condition: currentHourCondition.condition,
            icon: currentHourCondition.icon,
            humidity: 60 + Math.floor(hourRandomizer(2) * 25),
            windSpeed: 5 + Math.floor(hourRandomizer(3) * 10),
        });
    }

    // Calculate daily summary values from hourly data
    const dayTemps = hourlyForecasts.map(h => h.temp);
    const dayMinTemp = Math.min(...dayTemps);
    const dayMaxTemp = Math.max(...dayTemps);
    const avgHumidity = hourlyForecasts.reduce((sum, h) => sum + h.humidity, 0) / 24;
    const avgWindSpeed = hourlyForecasts.reduce((sum, h) => sum + h.windSpeed, 0) / 24;

    forecasts.push({
      date: futureDate.toISOString().split('T')[0],
      dayOfWeek: dayNames[futureDate.getDay()],
      minTemp: parseFloat(dayMinTemp.toFixed(1)),
      maxTemp: parseFloat(dayMaxTemp.toFixed(1)),
      condition: primaryDayCondition.condition, // Use the primary summary condition for the day card
      icon: primaryDayCondition.icon,
      humidity: Math.round(avgHumidity),
      windSpeed: Math.round(avgWindSpeed),
      hourly: hourlyForecasts,
    });
  }

  return { forecasts };
}
