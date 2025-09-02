
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
