
'use server';

import type { Sensor, HistoricalDataPoint } from '@/types';
import { simulateTemperatureUpdate } from '@/lib/mockData';
import { v4 as uuidv4 } from 'uuid';

// Helper function to simulate network delay.
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- In-Memory Store for Demonstration ---
let localSensors: Sensor[] = [
    {
        id: '1',
        name: 'Estufa de Fermentação A',
        location: 'Bloco 1, Nível Superior',
        currentTemperature: 28.5,
        highThreshold: 32,
        lowThreshold: 25,
        historicalData: [],
        model: 'TermoX 5000',
        macAddress: 'AB:CD:EF:12:34:56'
    },
    {
        id: '2',
        name: 'Secador de Sementes B',
        location: 'Área de Secagem',
        currentTemperature: 45.2,
        highThreshold: 50,
        lowThreshold: 40,
        historicalData: [],
        model: 'AgriSense X1'
    },
    {
        id: '3',
        name: 'Câmara Fria C',
        location: 'Armazenamento',
        currentTemperature: 5.1,
        highThreshold: 8,
        lowThreshold: 2,
        historicalData: [],
        model: 'TempGuard Standard'
    },
];

// This function now uses the in-memory store and simulates real-time updates.
export async function getSensors(collectionPath: string): Promise<Sensor[]> {
    await sleep(200); // Simulate network delay
    // Apply real-time simulation to the local data
    localSensors = localSensors.map(s => ({
        ...s,
        currentTemperature: simulateTemperatureUpdate(s)
    }));
    return Promise.resolve(localSensors);
}

export async function addSensor(
    collectionPath: string, 
    sensorData: Omit<Sensor, 'id' | 'historicalData' | 'currentTemperature'>
): Promise<Sensor> {
    await sleep(100);
    const newSensor: Sensor = {
        id: uuidv4(),
        ...sensorData,
        currentTemperature: 25, // Default starting temp
        historicalData: []
    };
    localSensors.push(newSensor);
    return Promise.resolve(newSensor);
}

export async function updateSensor(
    collectionPath: string,
    sensorId: string,
    sensorData: Partial<Omit<Sensor, 'id' | 'historicalData' | 'currentTemperature'>>
): Promise<void> {
    await sleep(100);
    const sensorIndex = localSensors.findIndex(s => s.id === sensorId);
    if (sensorIndex !== -1) {
        localSensors[sensorIndex] = { ...localSensors[sensorIndex], ...sensorData };
    }
    return Promise.resolve();
}

export async function deleteSensor(collectionPath: string, sensorId: string): Promise<void> {
    await sleep(100);
    localSensors = localSensors.filter(s => s.id !== sensorId);
    return Promise.resolve();
}

export async function getHistoricalData(collectionPath: string, sensorId: string, timePeriod: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<HistoricalDataPoint[]> {
    const sensor = localSensors.find(s => s.id === sensorId);
    if (!sensor) return Promise.resolve([]);

    const data: HistoricalDataPoint[] = [];
    const now = Date.now();
    let steps;
    let interval;

    switch (timePeriod) {
        case 'hour':
            steps = 60;
            interval = 60 * 1000;
            break;
        case 'week':
            steps = 7 * 24;
            interval = 60 * 60 * 1000;
            break;
        case 'month':
            steps = 30 * 12; // every 2 hours
            interval = 2 * 60 * 60 * 1000;
            break;
        case 'day':
        default:
            steps = 24 * 4; // every 15 minutes
            interval = 15 * 60 * 1000;
            break;
    }

    for (let i = 0; i < steps; i++) {
        const timestamp = now - i * interval;
        const dayCycle = Math.sin((timestamp % (24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000) * 2 * Math.PI);
        const temperature = sensor.lowThreshold + ((sensor.highThreshold - sensor.lowThreshold) / 2) + (dayCycle * 5) + (Math.random() - 0.5) * 2;
        data.push({ timestamp, temperature: parseFloat(temperature.toFixed(1)) });
    }
    
    return Promise.resolve(data.reverse());
}
