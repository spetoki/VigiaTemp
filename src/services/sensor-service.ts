
'use server';

import { db } from '@/lib/firebase';
import type { Sensor, HistoricalDataPoint } from '@/types';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  query,
  orderBy,
  limit,
  getDoc,
  writeBatch,
} from 'firebase/firestore';

// Helper function to convert a Firestore document to a Sensor object
const sensorFromDoc = (doc: QueryDocumentSnapshot<DocumentData>): Sensor => {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        location: data.location,
        currentTemperature: data.currentTemperature,
        highThreshold: data.highThreshold,
        lowThreshold: data.lowThreshold,
        model: data.model,
        ipAddress: data.ipAddress,
        macAddress: data.macAddress,
        // historicalData is now fetched from a subcollection
        historicalData: [], 
    };
};

export async function getSensors(accessKey: string): Promise<Sensor[]> {
    if (!db) {
        console.warn("Firestore is not configured. Returning empty sensor list.");
        return [];
    }
    try {
        const sensorsCol = collection(db, `users/${accessKey}/sensors`);
        const q = query(sensorsCol, orderBy("name", "asc"));
        const sensorSnapshot = await getDocs(q);
        return sensorSnapshot.docs.map(sensorFromDoc);
    } catch (error) {
        console.error("Error fetching sensors from Firestore:", error);
        throw new Error("Não foi possível carregar os sensores do banco de dados.");
    }
}

export async function addSensor(
    accessKey: string, 
    sensorData: Omit<Sensor, 'id' | 'historicalData' | 'currentTemperature'>
): Promise<Sensor> {
    if (!db) {
      throw new Error("Firestore não está configurado. Não é possível adicionar o sensor.");
    }

    const sensorsCol = collection(db, `users/${accessKey}/sensors`);
    const newSensorPayload = {
        ...sensorData,
        currentTemperature: 25, // Default starting temperature
    };
    
    const docRef = await addDoc(sensorsCol, newSensorPayload);

    return {
        ...newSensorPayload,
        id: docRef.id,
        historicalData: [],
    };
}

export async function updateSensor(
    accessKey: string,
    sensorId: string,
    sensorData: Partial<Sensor>
): Promise<void> {
    if (!db) {
      throw new Error("Firestore não está configurado. Não é possível atualizar o sensor.");
    }
    const sensorDoc = doc(db, `users/${accessKey}/sensors`, sensorId);
    await updateDoc(sensorDoc, sensorData as DocumentData);
}

export async function deleteSensor(accessKey: string, sensorId: string): Promise<void> {
    if (!db) {
      throw new Error("Firestore não está configurado. Não é possível excluir o sensor.");
    }
    const sensorDoc = doc(db, `users/${accessKey}/sensors`, sensorId);
    await deleteDoc(sensorDoc);
}


export async function addHistoricalData(accessKey: string, sensorId: string, dataPoint: HistoricalDataPoint): Promise<void> {
    if (!db) {
      throw new Error("Firestore não está configurado. Não é possível salvar o histórico.");
    }
    const historyCollection = collection(db, `users/${accessKey}/sensors/${sensorId}/historicalData`);
    await addDoc(historyCollection, {
        ...dataPoint,
        timestamp: Timestamp.fromMillis(dataPoint.timestamp),
    });
}

export async function getHistoricalData(accessKey: string, sensorId: string, timePeriod: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<HistoricalDataPoint[]> {
    if (!db) {
        return [];
    }

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

    try {
        const historyCollection = collection(db, `users/${accessKey}/sensors/${sensorId}/historicalData`);
        const q = query(
            historyCollection, 
            orderBy("timestamp", "desc"),
            limit(1000) // Limit to the last 1000 entries to manage performance
        );
        const snapshot = await getDocs(q);
        
        return snapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    timestamp: (data.timestamp as Timestamp).toMillis(),
                    temperature: data.temperature
                } as HistoricalDataPoint;
            })
            .filter(point => point.timestamp >= startTime) // Filter by time period after fetching
            .sort((a, b) => a.timestamp - b.timestamp); // Sort ascending for the chart
    } catch (error) {
        console.error(`Error fetching historical data for sensor ${sensorId}:`, error);
        return [];
    }
}
