
'use server';

import { db } from '@/lib/firebase';
import type { Alert } from '@/types';
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  DocumentData,
  writeBatch,
} from 'firebase/firestore';

// Helper to convert Firestore doc to Alert type
const alertFromDoc = (doc: DocumentData): Alert => {
    const data = doc.data();
    return {
        id: doc.id,
        sensorId: data.sensorId,
        sensorName: data.sensorName,
        timestamp: data.timestamp,
        level: data.level,
        message: data.message,
        acknowledged: data.acknowledged,
        reason: data.reason,
    };
};

/**
 * Fetches the most recent alerts for a given access key.
 * @param accessKey The active access key to scope the alerts.
 * @returns A promise that resolves to an array of alerts.
 */
export async function getAlerts(accessKey: string): Promise<Alert[]> {
  if (!db || !accessKey) {
    console.error("getAlerts failed: Firestore not initialized or accessKey is missing.");
    return [];
  }
  try {
    const alertsCol = collection(db, 'users', accessKey, 'alerts');
    // Order by timestamp in descending order and limit to the latest 100
    const q = query(alertsCol, orderBy('timestamp', 'desc'), limit(100));
    const alertSnapshot = await getDocs(q);
    const alertList = alertSnapshot.docs.map(doc => alertFromDoc(doc));
    return alertList;
  } catch (error) {
    console.error("Error fetching alerts from Firestore:", error);
    throw new Error("Failed to fetch alerts.");
  }
}

/**
 * Adds a new alert to Firestore for a given access key.
 * @param accessKey The active access key.
 * @param alertData The alert data to add.
 * @returns A promise that resolves to the newly created alert.
 */
export async function addAlert(accessKey: string, alertData: Omit<Alert, 'id'>): Promise<Alert> {
  if (!db || !accessKey) {
    throw new Error("addAlert failed: Firestore not initialized or accessKey is missing.");
  }
  try {
    const alertsCol = collection(db, 'users', accessKey, 'alerts');
    const docRef = await addDoc(alertsCol, alertData);
    
    return {
        id: docRef.id,
        ...alertData,
    };
  } catch (error) {
    console.error("Error adding alert to Firestore:", error);
    throw new Error("Failed to add alert.");
  }
}

/**
 * Updates an existing alert in Firestore, e.g., to acknowledge it.
 * @param accessKey The active access key.
 * @param alertId The ID of the alert to update.
 * @param updateData The data to update.
 */
export async function updateAlert(accessKey: string, alertId: string, updateData: Partial<Alert>) {
   if (!db || !accessKey) {
    throw new Error("updateAlert failed: Firestore not initialized or accessKey is missing.");
  }
  try {
    const alertDoc = doc(db, 'users', accessKey, 'alerts', alertId);
    await updateDoc(alertDoc, updateData);
  } catch (error) {
    console.error("Error updating alert in Firestore:", error);
    throw new Error("Failed to update alert.");
  }
}

/**
 * Updates multiple alerts at once, e.g., to acknowledge all.
 * @param accessKey The active access key.
 * @param alertIds The IDs of the alerts to update.
 * @param updateData The data to update on all specified alerts.
 */
export async function updateMultipleAlerts(accessKey: string, alertIds: string[], updateData: Partial<Alert>) {
    if (!db || !accessKey || alertIds.length === 0) {
        return;
    }
    try {
        const batch = writeBatch(db);

        alertIds.forEach(alertId => {
            const alertDoc = doc(db, 'users', accessKey, 'alerts', alertId);
            batch.update(alertDoc, updateData);
        });

        await batch.commit();
    } catch (error) {
        console.error("Error batch updating alerts in Firestore:", error);
        throw new Error("Failed to batch update alerts.");
    }
}
