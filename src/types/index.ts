
export type TemperatureUnit = 'C' | 'F';
export type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES';

export interface HistoricalDataPoint {
  timestamp: number; // Unix timestamp
  temperature: number; // Always in Celsius for storage
}

export type SensorStatus = 'normal' | 'warning' | 'critical' | 'offline';

export interface Sensor {
  id: string;
  name: string;
  location: string;
  currentTemperature: number; // Always in Celsius for storage
  highThreshold: number; // Always in Celsius
  lowThreshold: number; // Always in Celsius
  historicalData: HistoricalDataPoint[];
  lastUpdatedAt?: number; // Unix timestamp of the last update
  model?: string;
  ipAddress: string | null;
  macAddress: string | null;
  minRecordedTemp?: number;
  maxRecordedTemp?: number;
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
  acknowledgedBy?: string;
  acknowledgementNote?: string;
  acknowledgedAt?: number;
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

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'viewer';
    status: 'active' | 'inactive';
    createdAt: string; // ISO string
}

export type UserFormData = Omit<User, 'id' | 'createdAt'>;

export type SensorFormData = {
  sensorType: 'grouped' | 'individual';
  name?: string;
  greenhouse?: string;
  level?: string;
  location: string;
  model: string;
  ipAddress?: string;
  macAddress?: string;
  lowThreshold: number;
  highThreshold: number;
}
