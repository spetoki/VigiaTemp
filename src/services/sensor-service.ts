
'use server';

import { getDb } from '@/lib/firebase';
import type { Sensor, HistoricalDataPoint } from '@/types';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

// Função para obter sensores uma única vez
export async function getSensors(collectionPath: string): Promise<Sensor[]> {
    if (!collectionPath) return [];
    try {
        const db = getDb();
        const sensorsCol = collection(db, collectionPath);
        const sensorSnapshot = await getDocs(sensorsCol);
        const sensorList = sensorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sensor));
        return sensorList;
    } catch (error) {
        console.error("Erro ao buscar sensores: ", error);
        return [];
    }
}

export async function addSensor(
    collectionPath: string, 
    sensorData: Omit<Sensor, 'id' | 'historicalData'>
): Promise<Sensor> {
    if (!collectionPath) throw new Error("Caminho da coleção inválido.");
    const db = getDb();
    
    // Converte campos que podem ser vazios para null antes de salvar
    const dataToSave = {
        ...sensorData,
        ipAddress: sensorData.ipAddress || null,
        macAddress: sensorData.macAddress || null,
        model: sensorData.model || null,
    };

    const docRef = await addDoc(collection(db, collectionPath), dataToSave);
    
    // Retorna o objeto completo, incluindo o novo ID
    return {
        id: docRef.id,
        ...sensorData,
        historicalData: [] // Inicia com dados históricos vazios
    };
}

export async function updateSensor(
    collectionPath: string,
    sensorId: string,
    sensorData: Partial<Omit<Sensor, 'id' | 'historicalData'>>
): Promise<void> {
    if (!collectionPath) throw new Error("Caminho da coleção inválido.");
    const db = getDb();
    const sensorRef = doc(db, collectionPath, sensorId);
    
    // Converte campos que podem ser vazios para null antes de salvar
    const dataToUpdate = {
        ...sensorData,
        ipAddress: sensorData.ipAddress || null,
        macAddress: sensorData.macAddress || null,
        model: sensorData.model || null,
    };

    await updateDoc(sensorRef, dataToUpdate);
}

export async function deleteSensor(collectionPath: string, sensorId: string): Promise<void> {
    if (!collectionPath) throw new Error("Caminho da coleção inválido.");
    const db = getDb();
    await deleteDoc(doc(db, collectionPath, sensorId));
}

export async function getHistoricalData(collectionPath: string, sensorId: string, timePeriod: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<HistoricalDataPoint[]> {
    if (!collectionPath) return [];
    
    const db = getDb();
    const historyCollectionRef = collection(db, `${collectionPath}/${sensorId}/historicalData`);
    
    try {
        const querySnapshot = await getDocs(historyCollectionRef);
        const data = querySnapshot.docs.map(doc => doc.data() as HistoricalDataPoint);
        
        // Simulação de dados se não houver dados reais
        if (data.length === 0) {
            console.log("Gerando dados históricos simulados pois não há dados reais.");
            const sensorDoc = await getDoc(doc(db, collectionPath, sensorId));
            if (!sensorDoc.exists()) return [];
            const sensor = sensorDoc.data() as Sensor;

            const simulatedData: HistoricalDataPoint[] = [];
            const now = Date.now();
            let steps;
            let interval;

            switch (timePeriod) {
                case 'hour': steps = 60; interval = 60 * 1000; break;
                case 'week': steps = 7 * 24; interval = 60 * 60 * 1000; break;
                case 'month': steps = 30 * 12; interval = 2 * 60 * 60 * 1000; break;
                case 'day': default: steps = 24 * 4; interval = 15 * 60 * 1000; break;
            }

            for (let i = 0; i < steps; i++) {
                const timestamp = now - i * interval;
                const dayCycle = Math.sin((timestamp % (24*60*60*1000)) / (24*60*60*1000) * 2 * Math.PI);
                const temperature = sensor.lowThreshold + ((sensor.highThreshold - sensor.lowThreshold) / 2) + (dayCycle * 5) + (Math.random() - 0.5) * 2;
                simulatedData.push({ timestamp, temperature });
            }
            return simulatedData.reverse();
        }

        return data.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
        console.error("Erro ao buscar dados históricos: ", error);
        return [];
    }
}
