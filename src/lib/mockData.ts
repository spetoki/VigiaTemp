
import type { Sensor, HistoricalDataPoint } from '@/types';

export const generateHistoricalData = (baseTemp: number, days: number): HistoricalDataPoint[] => {
  const data = [];
  const now = Date.now();
  for (let i = 0; i < days * 24; i++) { // Hourly data for `days`
    const timestamp = now - i * 60 * 60 * 1000;
    // Simulate a daily sine wave for more realistic temperature changes
    const dayCycle = Math.sin((timestamp % (24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000) * 2 * Math.PI);
    const temperature = baseTemp + (dayCycle * 3) + (Math.random() - 0.5) * 2; // Sine wave +/- 3 degrees, random noise +/- 1
    data.push({ timestamp, temperature: parseFloat(temperature.toFixed(1)) });
  }
  return data.reverse(); // Oldest first
};

// This data is used as a fallback if Firestore is not available or empty.
// Note: With Firestore integration, this data is NOT the primary source of truth.
export const demoSensors: Sensor[] = [
  {
    id: 'sensor-1',
    name: 'Estufa Alpha - Zona 1',
    location: 'Canto Nordeste',
    currentTemperature: 26.5, // Celsius
    highThreshold: 30, // Celsius
    lowThreshold: 20, // Celsius
    historicalData: generateHistoricalData(25, 30), // 30 days of data
    model: 'TermoX 5000',
    ipAddress: '192.168.1.101',
    macAddress: '0A:1B:2C:3D:4E:5F',
    criticalAlertSound: undefined,
  },
  {
    id: 'sensor-2',
    name: 'Estufa Alpha - Zona 2',
    location: 'Canto Sudoeste',
    currentTemperature: 19.2, // Celsius
    highThreshold: 28, // Celsius
    lowThreshold: 18, // Celsius
    historicalData: generateHistoricalData(22, 30),
    model: 'AmbientePro II',
    ipAddress: '192.168.1.102',
    macAddress: '1A:2B:3C:4D:5E:6F',
    criticalAlertSound: undefined,
  },
  {
    id: 'sensor-3',
    name: 'Estufa Beta - Centro',
    location: 'Centro',
    currentTemperature: 31.0, // Celsius
    highThreshold: 29, // Celsius
    lowThreshold: 21, // Celsius
    historicalData: generateHistoricalData(26, 30),
    model: 'AgriSense X1',
    ipAddress: '192.168.1.103',
    macAddress: '2A:3B:4C:5D:6E:7F',
    criticalAlertSound: undefined,
  },
];

// Function to simulate real-time temperature updates
export const simulateTemperatureUpdate = (currentTemp: number): number => {
  // A small, random change to simulate real-world fluctuation
  const change = (Math.random() - 0.5) * 0.5; // +/- 0.25 degrees
  return parseFloat((currentTemp + change).toFixed(1));
};
