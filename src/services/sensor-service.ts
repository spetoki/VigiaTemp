
'use server';

import { db } from '@/lib/firebase';
import type { Sensor } from '@/types';
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  DocumentData,
} from 'firebase/firestore';

// Helper to convert Firestore doc to Sensor type
const sensorFromDoc = (doc: DocumentData): Sensor => {
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
        // Firestore doesn't store historicalData in this model, it would be a subcollection
        historicalData: [], 
    };
};

/**
 * Fetches all sensors for a given access key.
 * @param accessKey The active access key to scope the sensors.
 * @returns A promise that resolves to an array of sensors.
 */
export async function getSensors(accessKey: string): Promise<Sensor[]> {
  if (!db || !accessKey) {
    console.error("getSensors failed: Firestore not initialized or accessKey is missing.");
    return [];
  }
  try {
    const sensorsCol = collection(db, 'users', accessKey, 'sensors');
    const sensorSnapshot = await getDocs(sensorsCol);
    const sensorList = sensorSnapshot.docs.map(doc => sensorFromDoc(doc));
    return sensorList;
  } catch (error) {
    console.error("Error fetching sensors from Firestore:", error);
    throw new Error("Failed to fetch sensors.");
  }
}

/**
 * Adds a new sensor to Firestore for a given access key.
 * @param accessKey The active access key.
 * @param sensorData The sensor data to add (without id).
 * @returns A promise that resolves to the newly created sensor with its ID.
 */
export async function addSensor(accessKey: string, sensorData: Omit<Sensor, 'id' | 'historicalData' | 'currentTemperature'>): Promise<Sensor> {
  if (!db || !accessKey) {
    throw new Error("addSensor failed: Firestore not initialized or accessKey is missing.");
  }
  try {
    const sensorsCol = collection(db, 'users', accessKey, 'sensors');
    const docRef = await addDoc(sensorsCol, {
        ...sensorData,
        currentTemperature: 25, // Default starting temp
    });

    const newSensor: Sensor = {
        ...sensorData,
        id: docRef.id,
        currentTemperature: 25,
        historicalData: [],
    };
    return newSensor;
  } catch (error) {
    console.error("Error adding sensor to Firestore:", error);
    throw new Error("Failed to add sensor.");
  }
}

/**
 * Updates an existing sensor in Firestore.
 * @param accessKey The active access key.
 * @param sensorId The ID of the sensor to update.
 * @param sensorData The data to update.
 * @returns A promise that resolves when the update is complete.
 */
export async function updateSensor(accessKey: string, sensorId: string, sensorData: Partial<Omit<Sensor, 'id' | 'historicalData'>>) {
   if (!db || !accessKey) {
    throw new Error("updateSensor failed: Firestore not initialized or accessKey is missing.");
  }
  try {
    const sensorDoc = doc(db, 'users', accessKey, 'sensors', sensorId);
    await updateDoc(sensorDoc, sensorData);
  } catch (error) {
    console.error("Error updating sensor in Firestore:", error);
    throw new Error("Failed to update sensor.");
  }
}

/**
 * Deletes a sensor from Firestore.
 * @param accessKey The active access key.
 * @param sensorId The ID of the sensor to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export async function deleteSensor(accessKey: string, sensorId: string) {
   if (!db || !accessKey) {
    throw new Error("deleteSensor failed: Firestore not initialized or accessKey is missing.");
  }
  try {
    const sensorDoc = doc(db, 'users', accessKey, 'sensors', sensorId);
    await deleteDoc(sensorDoc);
  } catch (error) {
    console.error("Error deleting sensor from Firestore:", error);
    throw new Error("Failed to delete sensor.");
  }
}
