
import type { Sensor, HistoricalDataPoint } from '@/types';

// Stores the timestamp of the last temperature spike for TESTE01
let lastSpikeTime = 0;

// Function to simulate real-time temperature updates
export const simulateTemperatureUpdate = (sensor: { currentTemperature: number, name: string }): number => {
  const currentTemp = sensor.currentTemperature;

  // Special simulation logic for TESTE01
  if (sensor.name === 'TESTE01') {
    // New logic: Fluctuate between -5°C and 10°C
    const minTemp = -5;
    const maxTemp = 10;
    let newTemp = currentTemp + (Math.random() - 0.5) * 1.5; // Fluctuate more
    
    // Keep it within bounds
    if (newTemp > maxTemp) newTemp = maxTemp - Math.random();
    if (newTemp < minTemp) newTemp = minTemp + Math.random();

    return parseFloat(newTemp.toFixed(1));
  }

  // Default simulation for all other sensors
  const change = (Math.random() - 0.5) * 0.5; // +/- 0.25 degrees
  return parseFloat((currentTemp + change).toFixed(1));
};
