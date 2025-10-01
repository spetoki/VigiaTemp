
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
  historicalData: HistoricalDataPoint[];
  model?: string;
  ipAddress?: string;
  macAddress?: string;
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

// The data structure used within the application
export interface TraceabilityData {
  id: string;
  createdAt: string; // Stored as ISO string
  lotDescription: string;
  name: string;
  wetCocoaWeight: number;
  dryCocoaWeight: number;
  fermentationTime: number;
  dryingTime: number;
  isoClassification: string;
}

// The data structure received from the form
export interface TraceabilityFormData {
  lotDescription: string;
  name: string;
  wetCocoaWeight: string;
  dryCocoaWeight: string;
  fermentationTime: string;
  dryingTime: string;
  isoClassification: string;
}
