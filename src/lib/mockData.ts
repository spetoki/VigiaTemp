
import type { Sensor, User } from '@/types';

// This list represents the initial state of users, typically for an admin to see.
// New users can be created by signing up. To use the predefined accounts below,
// simply sign up with their respective email and password.
export const demoUsers: User[] = [
  {
    id: 'admin-user-placeholder-id', // This will be replaced by the actual Firebase UID after registration
    name: 'Admin VigiaTemp',
    email: 'admin',
    password: 'admin', // For reference during signup. Not stored securely.
    role: 'Admin',
    status: 'Active',
    joinedDate: '2023-01-15',
    tempCoins: 99999
  },
  {
    id: 'user-placeholder-id', // This will be replaced by the actual Firebase UID after registration
    name: 'Usuário Padrão',
    email: 'user@vigiatemp.com',
    password: 'user123', // For reference during signup. Not stored securely.
    role: 'User',
    status: 'Active',
    joinedDate: '2024-07-01',
    tempCoins: 1000
  },
  {
    id: 'spetoki-user-placeholder-id',
    name: 'Spetoki User',
    email: 'spetoki@gmail.com',
    password: 'spetoki123', // For reference during signup. Not stored securely.
    role: 'User',
    status: 'Active',
    joinedDate: '2024-07-16',
    tempCoins: 500
  }
];


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
    name: 'Alpha Greenhouse - Zone 1',
    location: 'North-East Corner',
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
    name: 'Alpha Greenhouse - Zone 2',
    location: 'South-West Corner',
    currentTemperature: 19.2, // Celsius
    highThreshold: 28, // Celsius
    lowThreshold: 18, // Celsius
    historicalData: generateHistoricalData(22, 30),
    model: 'AmbientePro II',
    ipAddress: '192.168.1.102',
    macAddress: '1A:2B:3C:4D:5E:6F',
    criticalAlertSound: undefined,
  },
];

// Function to simulate real-time temperature updates around a base temperature
export const simulateTemperatureUpdate = (baseTemp: number): number => {
  // Fluctuation of +/- 1.5 degrees around the base temperature
  const change = (Math.random() - 0.5) * 3; 
  return parseFloat((baseTemp + change).toFixed(1));
};
