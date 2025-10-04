
'use server';

import { getDb } from './db';
import type { Sensor, HistoricalDataPoint } from '@/types';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, getDoc, query, where, Timestamp, writeBatch, limit } from 'firebase/firestore';
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
                model: data.model || 'Não especificado',
                ipAddress: data.ipAddress || null,
                macAddress: data.macAddress || null,
                historicalData: [], // Assume empty if not present
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
    };
    
    const docRef = await addDoc(collection(db, collectionPath), dataToSave);
    
    return {
        id: docRef.id,
        ...dataToSave,
        historicalData: [] // Initialize historicalData as an empty array
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
    const historyCollectionRef = collection(db, `${collectionPath}/${sensorId}/historicalData`);
    
    try {
        const querySnapshot = await getDocs(historyCollectionRef);
        let data = querySnapshot.docs.map(doc => doc.data() as HistoricalDataPoint);

        if (data.length > 0) {
           return data.sort((a, b) => a.timestamp - b.timestamp);
        }

        console.warn(`Gerando dados históricos SIMULADOS para o sensor ${sensorId} pois não há dados reais.`);
        const sensorDoc = await getDoc(doc(db, collectionPath, sensorId));
        if (!sensorDoc.exists()) return [];
        
        const sensor = sensorDoc.data() as Omit<Sensor, 'id'>;

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
            const timestamp = now - (steps - i) * interval;
            const dayCycle = Math.sin(((timestamp % 86400000) / 86400000) * 2 * Math.PI - Math.PI / 2);
            const baseTemp = (sensor.highThreshold + sensor.lowThreshold) / 2;
            const amplitude = (sensor.highThreshold - sensor.lowThreshold) / 2;
            const randomNoise = (Math.random() - 0.5) * 2;
            
            const temperature = baseTemp + (dayCycle * amplitude * 0.7) + randomNoise;
            
            simulatedData.push({ timestamp, temperature });
        }
        return simulatedData;

    } catch (error) {
        console.error("Erro ao buscar dados históricos: ", error);
        return [];
    }
}


export async function updateSensorDataFromDevice(macAddress: string, temperature: number): Promise<{id: string} | null> {
    const db = getDb();
    const usersCollectionRef = collection(db, 'users');
    
    try {
        const usersSnapshot = await getDocs(usersCollectionRef);
        
        for (const userDoc of usersSnapshot.docs) {
            const sensorsCollectionPath = `users/${userDoc.id}/sensors`;
            const sensorsCollectionRef = collection(db, sensorsCollectionPath);
            
            // Busca pelo sensor com o MAC address correspondente
            const q = query(sensorsCollectionRef, where("macAddress", "==", macAddress), limit(1));
            const sensorSnapshot = await getDocs(q);

            if (!sensorSnapshot.empty) {
                const sensorDoc = sensorSnapshot.docs[0];
                const sensorId = sensorDoc.id;
                
                // Sensor encontrado, iniciar batch de escrita
                const batch = writeBatch(db);

                // 1. Atualiza a temperatura atual no documento do sensor
                const sensorRef = doc(db, sensorsCollectionPath, sensorId);
                batch.update(sensorRef, { currentTemperature: temperature });
                
                // 2. Adiciona um novo ponto de dado na subcoleção historicalData
                const historyCollectionRef = collection(db, `${sensorsCollectionPath}/${sensorId}/historicalData`);
                const newHistoryDocRef = doc(historyCollectionRef); // Gera um novo ID para o ponto histórico
                batch.set(newHistoryDocRef, {
                    timestamp: Timestamp.now().toMillis(),
                    temperature: temperature
                });

                // Executa as operações em lote
                await batch.commit();
                
                console.log(`Dados atualizados para o sensor ${sensorId} do usuário ${userDoc.id}`);
                return { id: sensorId }; // Retorna o ID do sensor atualizado
            }
        }
        
        // Se o loop terminar e nenhum sensor for encontrado
        console.warn(`Nenhum sensor encontrado com o MAC Address: ${macAddress} em nenhum usuário.`);
        return null;

    } catch (error) {
        console.error("Erro ao atualizar dados do dispositivo:", error);
        throw error;
    }
}
