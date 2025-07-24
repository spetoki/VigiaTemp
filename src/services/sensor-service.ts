
'use server';

import { db } from '@/lib/firebase';
import type { Sensor } from '@/types';
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
        criticalAlertSound: data.criticalAlertSound,
        // historicalData is not stored in the main document
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
    if (!db) throw new Error("Firestore not configured.");

    const sensorsCol = collection(db, `users/${accessKey}/sensors`);
    const docRef = await addDoc(sensorsCol, {
        ...sensorData,
        currentTemperature: 25, // Default starting temperature
    });

    return {
        ...sensorData,
        id: docRef.id,
        currentTemperature: 25,
        historicalData: [],
    };
}

export async function updateSensor(
    accessKey: string,
    sensorId: string,
    sensorData: Partial<Sensor>
): Promise<Sensor> {
    if (!db) throw new Error("Firestore not configured.");

    const sensorDoc = doc(db, `users/${accessKey}/sensors`, sensorId);
    // Explicitly cast sensorData to the expected type for Firestore
    await updateDoc(sensorDoc, sensorData as DocumentData);
    
    // This return is optimistic; it doesn't re-fetch the data
    return { id: sensorId, ...sensorData } as Sensor;
}

export async function deleteSensor(accessKey: string, sensorId: string): Promise<void> {
    if (!db) throw new Error("Firestore not configured.");

    const sensorDoc = doc(db, `users/${accessKey}/sensors`, sensorId);
    await deleteDoc(sensorDoc);
}
