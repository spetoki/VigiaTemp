
'use server';

import type { Sensor, HistoricalDataPoint } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { simulateTemperatureUpdate } from '@/lib/mockData';

// This function now directly fetches from Supabase.
export async function getSensors(collectionPath: string): Promise<Sensor[]> {
    const { data, error } = await supabase.from('sensors').select('*').order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching sensors from Supabase:", error);
        return [];
    }

    // The temperature update simulation is now applied to the fetched data
    // to keep the demo aspect of real-time fluctuation.
    return data.map(s => ({
        id: s.id,
        name: s.name,
        location: s.location,
        model: s.model,
        ipAddress: s.ip_address,
        macAddress: s.mac_address,
        lowThreshold: s.low_threshold,
        highThreshold: s.high_threshold,
        currentTemperature: simulateTemperatureUpdate({ ...s, currentTemperature: s.current_temperature } as Sensor),
        historicalData: [] // Historical data is fetched on demand
    }));
}


export async function addSensor(
    collectionPath: string, 
    sensorData: Omit<Sensor, 'id' | 'historicalData' | 'currentTemperature'>
): Promise<Sensor> {
    const { data, error } = await supabase
        .from('sensors')
        .insert([{ 
            name: sensorData.name,
            location: sensorData.location,
            model: sensorData.model,
            ip_address: sensorData.ipAddress,
            mac_address: sensorData.macAddress,
            low_threshold: sensorData.lowThreshold,
            high_threshold: sensorData.highThreshold,
            current_temperature: 25 // Default starting temp
        }])
        .select()
        .single();

    if (error) {
        console.error("Supabase addSensor error:", error);
        throw new Error('Falha ao adicionar sensor no Supabase.');
    }

    const newSensor: Sensor = {
        id: data.id,
        name: data.name,
        location: data.location,
        model: data.model,
        ipAddress: data.ip_address,
        macAddress: data.mac_address,
        lowThreshold: data.low_threshold,
        highThreshold: data.high_threshold,
        currentTemperature: data.current_temperature,
        historicalData: []
    };
    
    return newSensor;
}

export async function updateSensor(
    collectionPath: string,
    sensorId: string,
    sensorData: Partial<Sensor>
): Promise<void> {
    const { error } = await supabase
        .from('sensors')
        .update({
            name: sensorData.name,
            location: sensorData.location,
            model: sensorData.model,
            ip_address: sensorData.ipAddress,
            mac_address: sensorData.macAddress,
            low_threshold: sensorData.lowThreshold,
            high_threshold: sensorData.highThreshold
        })
        .eq('id', sensorId);

    if (error) {
        console.error("Supabase updateSensor error:", error);
        throw new Error('Falha ao atualizar sensor no Supabase.');
    }
}

export async function deleteSensor(collectionPath: string, sensorId: string): Promise<void> {
    const { error } = await supabase
        .from('sensors')
        .delete()
        .eq('id', sensorId);

    if (error) {
        console.error("Supabase deleteSensor error:", error);
        throw new Error('Falha ao deletar sensor no Supabase.');
    }
}


export async function getHistoricalData(collectionPath: string, sensorId: string, timePeriod: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<HistoricalDataPoint[]> {
    // This function will now be a placeholder as we are not storing historical data in Supabase in this iteration.
    // It can be implemented later if needed.
    const { data: sensorData, error } = await supabase.from('sensors').select('low_threshold, high_threshold').eq('id', sensorId).single();

    if (error || !sensorData) {
        console.error("Error fetching sensor for historical data simulation:", error);
        return [];
    }
    
    const sensor = { lowThreshold: sensorData.low_threshold, highThreshold: sensorData.high_threshold };

    // Generate some random data for chart demonstration purposes
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
