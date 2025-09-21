
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

export interface StockItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string; // e.g., 'kg', 'sacos', 'litros', 'unidades'
    supplier?: string;
    lastUpdated: string; // ISO date string
}

export interface StockItemFormData {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    supplier?: string;
}
