
'use server';

import { getDb } from './db';
import type { Sensor, HistoricalDataPoint } from '@/types';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, getDoc, query, where, Timestamp } from 'firebase/firestore';
import { SensorFormData } from '@/components/sensors/SensorForm';

// Função para obter sensores uma única vez
export async function getSensors(collectionPath: string): Promise<Sensor[]> {
    if (!collectionPath) return [];
    try {
        const db = getDb();
        const sensorsCol = collection(db, collectionPath);
        const sensorSnapshot = await getDocs(sensorsCol);
        const sensorList = sensorSnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id,
                name: data.name || 'Sensor Desconhecido',
                location: data.location || 'Localização Desconhecida',
                currentTemperature: data.currentTemperature ?? 0,
                highThreshold: data.highThreshold ?? 0,
                lowThreshold: data.lowThreshold ?? 0,
                historicalData: data.historicalData || [],
                model: data.model || 'Não especificado',
                ipAddress: data.ipAddress || null,
                macAddress: data.macAddress || null,
            } as Sensor
        });
        return sensorList;
    } catch (error) {
        console.error("Erro ao buscar sensores: ", error);
        return [];
    }
}

export async function addSensor(
    collectionPath: string, 
    sensorData: SensorFormData
): Promise<Sensor> {
    if (!collectionPath) {
        throw new Error("Caminho da coleção inválido. Verifique se a chave de acesso está ativa.");
    }
    const db = getDb();

    // Os dados do formulário já são validados como números pelo Zod,
    // então podemos usá-los diretamente.
    const dataToSave = {
        name: sensorData.name,
        location: sensorData.location,
        model: sensorData.model || 'Não especificado',
        ipAddress: sensorData.ipAddress || null,
        macAddress: sensorData.macAddress || null,
        // Limites já são números do formulário.
        lowThreshold: sensorData.lowThreshold,
        highThreshold: sensorData.highThreshold,
        // Valor inicial padrão em Celsius para um novo sensor.
        currentTemperature: 25, 
    };
    
    const docRef = await addDoc(collection(db, collectionPath), dataToSave);
    
    return {
        id: docRef.id,
        ...dataToSave,
        historicalData: [], // Um novo sensor começa sem dados históricos.
    };
}

export async function updateSensor(
    collectionPath: string,
    sensorId: string,
    sensorData: Partial<SensorFormData>
): Promise<void> {
    if (!collectionPath) throw new Error("Caminho da coleção inválido.");
    const db = getDb();
    const sensorRef = doc(db, collectionPath, sensorId);
    
    // Os dados já chegam no formato correto do formulário.
    const dataToUpdate: { [key: string]: any } = { ...sensorData };
   
    if (sensorData.ipAddress === '') {
        dataToUpdate.ipAddress = null;
    }
    if (sensorData.macAddress === '') {
        dataToUpdate.macAddress = null;
    }

    await updateDoc(sensorRef, dataToUpdate);
}

export async function deleteSensor(collectionPath: string, sensorId: string): Promise<void> {
    if (!collectionPath) throw new Error("Caminho da coleção inválido.");
    const db = getDb();
    await deleteDoc(doc(db, collectionPath, sensorId));
}

// Função para buscar dados históricos de um sensor
export async function getHistoricalData(collectionPath: string, sensorId: string, timePeriod: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<HistoricalDataPoint[]> {
    if (!collectionPath) return [];

    const db = getDb();
    const historyCollectionRef = collection(db, `${collectionPath}/${sensorId}/historicalData`);
    
    try {
        const querySnapshot = await getDocs(historyCollectionRef);
        let data = querySnapshot.docs.map(doc => doc.data() as HistoricalDataPoint);

        if (data.length === 0) {
            console.warn(`Gerando dados históricos SIMULADOS para o sensor ${sensorId} pois não há dados reais.`);
            const sensorDoc = await getDoc(doc(db, collectionPath, sensorId));
            if (!sensorDoc.exists()) return [];
            
            const sensor = sensorDoc.data() as Omit<Sensor, 'id'>;

            const simulatedData: HistoricalDataPoint[] = [];
            const now = Date.now();
            let steps;
            let interval;

            switch (timePeriod) {
                case 'hour': steps = 60; interval = 60 * 1000; break; // 1 ponto por minuto
                case 'week': steps = 7 * 24; interval = 60 * 60 * 1000; break; // 1 ponto por hora
                case 'month': steps = 30 * 12; interval = 2 * 60 * 60 * 1000; break; // 1 ponto a cada 2 horas
                case 'day': default: steps = 24 * 4; interval = 15 * 60 * 1000; break; // 1 ponto a cada 15 minutos
            }

            for (let i = 0; i < steps; i++) {
                const timestamp = now - (steps - i) * interval;
                const dayCycle = Math.sin(((timestamp % 86400000) / 86400000) * 2 * Math.PI - Math.PI / 2);
                const baseTemp = (sensor.highThreshold + sensor.lowThreshold) / 2;
                const amplitude = (sensor.highThreshold - sensor.lowThreshold) / 2;
                const randomNoise = (Math.random() - 0.5) * 2;
                
                const temperature = baseTemp + (dayCycle * amplitude * 0.7) + randomNoise;
                
                simulatedData.push({ timestamp, temperature });
            }
            return simulatedData;
        }

        return data.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
        console.error("Erro ao buscar dados históricos: ", error);
        return [];
    }
}
