
'use server';
/**
 * @fileOverview A service for fetching simulated weather information.
 * This file contains the core logic for weather simulation, decoupled
 * from any AI or Genkit-specific implementations.
 */

/**
 * The actual logic for fetching weather. In a real app, this would call an API.
 * Here, it simulates a cool temperature.
 * @param location - The location to fetch weather for (unused in simulation).
 * @returns An object with the temperature.
 */
export async function fetchSimulatedWeather(
    location: string
): Promise<{temperature: number}> {
  // In a real application, you would call a real weather API here using
  // a key from process.env, like process.env.WEATHER_API_KEY
  // For this simulation, we'll return a random cool temperature
  // to better match the user's context.
  const simulatedTemp = 20 + Math.random() * 5; // Random temp between 20°C and 25°C
  return {
    temperature: parseFloat(simulatedTemp.toFixed(1)),
  };
}
