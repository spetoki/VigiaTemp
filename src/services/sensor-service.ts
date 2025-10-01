
'use server';

import type { Sensor, HistoricalDataPoint } from '@/types';
import { demoSensors, simulateTemperatureUpdate } from '@/lib/mockData';

// Emula um banco de dados na memória. Os dados são perdidos ao recarregar a página.
let inMemorySensors: Sensor[] = [...demoSensors];

// Inicializa dados históricos de demonstração
inMemorySensors.forEach(sensor => {
    const data = [];
    const now = Date.now();
    for (let i = 0; i < 24 * 7; i++) { // 7 dias de dados por hora
      const timestamp = now - i * 60 * 60 * 1000;
      const dayCycle = Math.sin((timestamp % (24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000) * 2 * Math.PI);
      const temperature = sensor.lowThreshold + ((sensor.highThreshold - sensor.lowThreshold) / 2) + (dayCycle * 5) + (Math.random() - 0.5) * 2;
      data.push({ timestamp, temperature: parseFloat(temperature.toFixed(1)) });
    }
    sensor.historicalData = data.reverse();
});

// Simula atualizações de temperatura em tempo real
setInterval(() => {
    inMemorySensors = inMemorySensors.map(sensor => ({
        ...sensor,
        currentTemperature: simulateTemperatureUpdate(sensor),
        historicalData: [
            ...sensor.historicalData.slice(1),
            { timestamp: Date.now(), temperature: sensor.currentTemperature }
        ]
    }));
}, 5000); // Atualiza a cada 5 segundos

export async function getSensors(collectionPath: string): Promise<Sensor[]> {
    console.log("Modo Demo: Retornando sensores da memória.");
    // Ignora collectionPath e retorna os dados em memória
    return Promise.resolve(inMemorySensors);
}

export async function addSensor(
    collectionPath: string, 
    sensorData: Omit<Sensor, 'id' | 'historicalData' | 'currentTemperature'>
): Promise<Sensor> {
    console.log("Modo Demo: Adicionando sensor na memória.");
    const newSensor: Sensor = {
        ...sensorData,
        id: `sensor-${Date.now()}`,
        currentTemperature: 25,
        historicalData: []
    };
    inMemorySensors.unshift(newSensor);
    return Promise.resolve(newSensor);
}

export async function updateSensor(
    collectionPath: string,
    sensorId: string,
    sensorData: Partial<Sensor>
): Promise<void> {
    console.log(`Modo Demo: Atualizando sensor ${sensorId} na memória.`);
    inMemorySensors = inMemorySensors.map(sensor => 
        sensor.id === sensorId ? { ...sensor, ...sensorData } : sensor
    );
    return Promise.resolve();
}

export async function deleteSensor(collectionPath: string, sensorId: string): Promise<void> {
    console.log(`Modo Demo: Deletando sensor ${sensorId} da memória.`);
    inMemorySensors = inMemorySensors.filter(sensor => sensor.id !== sensorId);
    return Promise.resolve();
}


export async function getHistoricalData(collectionPath: string, sensorId: string, timePeriod: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<HistoricalDataPoint[]> {
    const sensor = inMemorySensors.find(s => s.id === sensorId);
    if (!sensor) return [];

    const now = Date.now();
    let startTime: number;

    switch (timePeriod) {
        case 'hour':
            startTime = now - 60 * 60 * 1000;
            break;
        case 'week':
            startTime = now - 7 * 24 * 60 * 60 * 1000;
            break;
        case 'month':
            startTime = now - 30 * 24 * 60 * 60 * 1000;
            break;
        case 'day':
        default:
            startTime = now - 24 * 60 * 60 * 1000;
            break;
    }

    return sensor.historicalData.filter(point => point.timestamp >= startTime);
}
