
export type TemperatureUnit = 'C' | 'F';
export type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES';

export interface HistoricalDataPoint {
  timestamp: number; // Unix timestamp
  temperature: number; // Always in Celsius for storage
}

export type SensorStatus = 'normal' | 'warning' | 'critical';

export interface Sensor {
  id: string;
  name: string;
  location: string;
  currentTemperature: number; // Always in Celsius for storage
  highThreshold: number; // Always in Celsius
  lowThreshold: number; // Always in Celsius
  historicalData: HistoricalDataPoint[]; // Note: This is not persisted in the main sensor document in Firestore
  model?: string;
  ipAddress?: string;
  macAddress?: string;
  criticalAlertSound?: string; // Data URI for the sound
}

export interface Alert {
  id: string;
  sensorId: string;
  sensorName: string;
  timestamp: number;
  level: 'warning' | 'critical';
  message: string;
  acknowledged: boolean;
  reason?: 'high' | 'low';
}
