
import type { Sensor } from '@/types';

const generateHistoricalData = (baseTemp: number, days: number): { timestamp: number, temperature: number }[] => {
  const data = [];
  const now = Date.now();
  for (let i = 0; i < days * 24; i++) { // Hourly data for `days`
    const timestamp = now - i * 60 * 60 * 1000;
    const temperature = baseTemp + (Math.random() - 0.5) * 5; // +/- 2.5 degree variation
    data.push({ timestamp, temperature: parseFloat(temperature.toFixed(1)) });
  }
  return data.reverse(); // Oldest first
};

// New users should start with an empty list of sensors.
// This data can be used for demos or seeding specific accounts if needed.
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
    currentTemperature: 31.0, // Celsius - Should trigger critical alert
    highThreshold: 29, // Celsius
    lowThreshold: 21, // Celsius
    historicalData: generateHistoricalData(26, 30),
    model: 'AgriSense X1',
    ipAddress: '192.168.1.103',
    macAddress: '2A:3B:4C:5D:6E:7F',
    criticalAlertSound: undefined,
  },
  {
    id: 'sensor-4',
    name: 'Caixa de Fermentação',
    location: 'Armazém Principal',
    currentTemperature: 21.5, // Celsius - Should trigger warning
    highThreshold: 32, // Celsius
    lowThreshold: 22, // Celsius
    historicalData: generateHistoricalData(28, 30),
    model: 'HydroTemp Advanced',
    ipAddress: '192.168.1.104',
    macAddress: '3A:4B:5C:6D:7E:8F',
    criticalAlertSound: undefined,
  },
];

// Function to simulate real-time temperature updates
export const simulateTemperatureUpdate = (currentTemp: number): number => {
  // A small, random change to simulate real-world fluctuation
  const change = (Math.random() - 0.5) * 0.5; // +/- 0.25 degrees
  return parseFloat((currentTemp + change).toFixed(1));
};
