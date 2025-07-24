
'use server';

import { demoSensors } from '@/lib/mockData';
import type { Sensor } from '@/types';

const getStoredSensors = (key: string): Sensor[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    // If nothing is stored, initialize with demo data
    setStoredSensors(key, demoSensors);
    return demoSensors;
  } catch (error) {
    console.error("Failed to parse sensors from localStorage", error);
    return demoSensors; // Fallback to demo data
  }
};

const setStoredSensors = (key: string, sensors: Sensor[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(sensors));
};

export async function getSensors(accessKey: string): Promise<Sensor[]> {
  const storageKey = `${accessKey}_demo_sensors`;
  return getStoredSensors(storageKey);
}

export async function addSensor(accessKey: string, sensorData: Omit<Sensor, 'id' | 'historicalData' | 'currentTemperature'>): Promise<Sensor> {
  const storageKey = `${accessKey}_demo_sensors`;
  const sensors = getStoredSensors(storageKey);
  const newSensor: Sensor = {
    ...sensorData,
    id: `sensor_${Date.now()}`,
    currentTemperature: 25, // Default starting temp
    historicalData: [], // This will be populated by simulation
  };
  const updatedSensors = [newSensor, ...sensors];
  setStoredSensors(storageKey, updatedSensors);
  return newSensor;
}

export async function updateSensor(accessKey: string, sensorId: string, sensorData: Partial<Sensor>): Promise<Sensor> {
  const storageKey = `${accessKey}_demo_sensors`;
  let sensors = getStoredSensors(storageKey);
  let updatedSensor: Sensor | undefined;
  const updatedSensors = sensors.map(s => {
    if (s.id === sensorId) {
      updatedSensor = { ...s, ...sensorData };
      return updatedSensor;
    }
    return s;
  });
  setStoredSensors(storageKey, updatedSensors);
  if (!updatedSensor) {
    throw new Error("Sensor not found");
  }
  return updatedSensor;
}

export async function deleteSensor(accessKey: string, sensorId: string): Promise<void> {
  const storageKey = `${accessKey}_demo_sensors`;
  let sensors = getStoredSensors(storageKey);
  const updatedSensors = sensors.filter(s => s.id !== sensorId);
  setStoredSensors(storageKey, updatedSensors);
}
