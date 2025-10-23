
'use server';

import { getDb } from './db';
import type { Sensor, HistoricalDataPoint } from '@/types';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, getDoc, query, where, Timestamp, writeBatch, limit, orderBy } from 'firebase/firestore';
import { SensorFormData } from '@/components/sensors/SensorForm';

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
                currentTemperature: data.currentTemperature ?? 25,
                highThreshold: data.highThreshold ?? 30,
                lowThreshold: data.lowThreshold ?? 20,
                lastUpdatedAt: data.lastUpdatedAt || null,
                model: data.model || 'Não especificado',
                ipAddress: data.ipAddress || null,
                macAddress: data.macAddress || null,
                minRecordedTemp: data.minRecordedTemp,
                maxRecordedTemp: data.maxRecordedTemp,
                historicalData: [], // This is now fetched separately
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

    const dataToSave = {
        name: sensorData.name,
        location: sensorData.location,
        model: sensorData.model || 'Não especificado',
        ipAddress: sensorData.ipAddress || null,
        macAddress: sensorData.macAddress || null,
        lowThreshold: Number(sensorData.lowThreshold),
        highThreshold: Number(sensorData.highThreshold),
        currentTemperature: 25, 
        lastUpdatedAt: Date.now(),
        // Initialize recorded temps
        minRecordedTemp: 25,
        maxRecordedTemp: 25,
    };
    
    const docRef = await addDoc(collection(db, collectionPath), dataToSave);
    
    return {
        id: docRef.id,
        ...dataToSave,
        historicalData: []
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
    
    const dataToUpdate: { [key: string]: any } = { ...sensorData };
    if (typeof sensorData.lowThreshold !== 'undefined') {
        dataToUpdate.lowThreshold = Number(sensorData.lowThreshold);
    }
    if (typeof sensorData.highThreshold !== 'undefined') {
        dataToUpdate.highThreshold = Number(sensorData.highThreshold);
    }
   
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

export async function getHistoricalData(collectionPath: string, sensorId: string, timePeriod: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<HistoricalDataPoint[]> {
    if (!collectionPath) return [];

    const db = getDb();
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

    const historyCollectionRef = collection(db, `${collectionPath}/${sensorId}/historicalData`);
    const q = query(historyCollectionRef, where("timestamp", ">=", startTime), orderBy("timestamp", "asc"));
    
    try {
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => doc.data() as HistoricalDataPoint);
        return data;
    } catch (error) {
        console.error(`Erro ao buscar dados históricos para o sensor ${sensorId}: `, error);
        return []; // Retorna um array vazio em caso de erro para não quebrar os gráficos
    }
}


export async function updateSensorDataFromDevice(accessKey: string, macAddress: string, temperature: number): Promise<{id: string} | null> {
    const db = getDb();
    const sensorsCollectionPath = `users/${accessKey}/sensors`;
    const now = Date.now();
    
    try {
        const sensorsCollectionRef = collection(db, sensorsCollectionPath);
        
        // Busca pelo sensor com o MAC address correspondente dentro do workspace da chave
        const q = query(sensorsCollectionRef, where("macAddress", "==", macAddress), limit(1));
        const sensorSnapshot = await getDocs(q);

        if (!sensorSnapshot.empty) {
            const sensorDoc = sensorSnapshot.docs[0];
            const sensorId = sensorDoc.id;
            const sensorData = sensorDoc.data() as Sensor;
            
            const batch = writeBatch(db);

            // 1. Atualiza a temperatura atual e o timestamp no documento do sensor
            const sensorRef = doc(db, sensorsCollectionPath, sensorId);
            
            const updatePayload: Partial<Sensor> = { 
              currentTemperature: temperature,
              lastUpdatedAt: now
            };

            // 2. Verifica e atualiza as temperaturas mínimas e máximas registradas
            if (typeof sensorData.minRecordedTemp === 'undefined' || temperature < sensorData.minRecordedTemp) {
                updatePayload.minRecordedTemp = temperature;
            }
            if (typeof sensorData.maxRecordedTemp === 'undefined' || temperature > sensorData.maxRecordedTemp) {
                updatePayload.maxRecordedTemp = temperature;
            }
            
            batch.update(sensorRef, updatePayload);
            
            // 3. Adiciona um novo ponto de dado na subcoleção historicalData
            const historyCollectionRef = collection(db, `${sensorsCollectionPath}/${sensorId}/historicalData`);
            const newHistoryDocRef = doc(historyCollectionRef); 
            batch.set(newHistoryDocRef, {
                timestamp: now,
                temperature: temperature
            });

            await batch.commit();
            
            console.log(`Dados atualizados para o sensor ${sensorId} no espaço de trabalho da chave ${accessKey}`);
            return { id: sensorId };
        }
        
        console.warn(`Nenhum sensor encontrado com o MAC Address: ${macAddress} para a chave ${accessKey}.`);
        return null;

    } catch (error) {
        console.error("Erro ao atualizar dados do dispositivo:", error);
        throw error;
    }
}

/**
 * Resets the minimum and maximum recorded temperatures for a specific sensor.
 * Sets both minRecordedTemp and maxRecordedTemp to the current temperature.
 * @param collectionPath - The path to the sensors collection (e.g., 'users/{key}/sensors').
 * @param sensorId - The ID of the sensor to reset.
 */
export async function resetMinMaxTemperatures(collectionPath: string, sensorId: string): Promise<void> {
    if (!collectionPath) throw new Error("Caminho da coleção inválido.");
    
    const db = getDb();
    const sensorRef = doc(db, collectionPath, sensorId);

    try {
        const sensorSnap = await getDoc(sensorRef);
        if (!sensorSnap.exists()) {
            throw new Error("Sensor não encontrado.");
        }

        const sensorData = sensorSnap.data();
        const currentTemperature = sensorData.currentTemperature;

        // Reset min and max to the current temperature
        await updateDoc(sensorRef, {
            minRecordedTemp: currentTemperature,
            maxRecordedTemp: currentTemperature
        });

    } catch (error) {
        console.error("Erro ao zerar temperaturas min/max:", error);
        throw error;
    }
}
