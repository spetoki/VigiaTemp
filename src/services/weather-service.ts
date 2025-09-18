
'use server';
/**
 * @fileOverview A service for fetching real weather information using an API key.
 * This file contains the core logic for making external API calls to a weather service.
 */

/**
 * The actual logic for fetching weather. This now calls a real weather API.
 * @param location - The location to fetch weather for.
 * @returns An object with the temperature.
 */
export async function fetchSimulatedWeather(
    location: string
): Promise<{temperature: number}> {
  
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    console.warn("WEATHER_API_KEY is not set in environment variables. Falling back to simulated data.");
    // Fallback to simulation if API key is not available
    const simulatedTemp = 20 + Math.random() * 5; 
    return {
      temperature: parseFloat(simulatedTemp.toFixed(1)),
    };
  }

  // URL for the WeatherAPI.com service
  const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&aqi=no`;

  try {
    const response = await fetch(apiUrl, { next: { revalidate: 300 } }); // Cache for 5 minutes

    if (!response.ok) {
      console.error(`Weather API error: ${response.status} ${response.statusText}`);
      // In case of API error, provide a fallback temperature to avoid breaking the UI
      return { temperature: 22 };
    }

    const data = await response.json();
    
    if (data && data.current && typeof data.current.temp_c !== 'undefined') {
      return {
        temperature: data.current.temp_c,
      };
    } else {
        // Fallback if the response format is unexpected
        return { temperature: 22 };
    }

  } catch (error) {
    console.error("Failed to fetch real weather data:", error);
    // Fallback in case of network or other errors
    return { temperature: 22 };
  }
}
