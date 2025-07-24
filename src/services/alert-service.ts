
'use server';

import { db } from '@/lib/firebase';
import type { Alert } from '@/types';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  writeBatch,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  query,
  orderBy,
  limit,
  updateDoc
} from 'firebase/firestore';


const alertFromDoc = (doc: QueryDocumentSnapshot<DocumentData>): Alert => {
    const data = doc.data();
    return {
        id: doc.id,
        sensorId: data.sensorId,
        sensorName: data.sensorName,
        timestamp: (data.timestamp as Timestamp).toMillis(),
        level: data.level,
        message: data.message,
        acknowledged: data.acknowledged,
        reason: data.reason,
    };
};

export async function getAlerts(accessKey: string): Promise<Alert[]> {
    if (!db) {
        console.warn("Firestore is not configured. Returning empty alerts list.");
        return [];
    }
    try {
        const alertsCol = collection(db, `users/${accessKey}/alerts`);
        // Order by most recent and limit to the last 100 to avoid performance issues
        const q = query(alertsCol, orderBy("timestamp", "desc"), limit(100));
        const alertSnapshot = await getDocs(q);
        return alertSnapshot.docs.map(alertFromDoc);
    } catch (error) {
        console.error("Error fetching alerts from Firestore:", error);
        throw new Error("Não foi possível carregar os alertas do banco de dados.");
    }
}


export async function addAlert(accessKey: string, alertData: Omit<Alert, 'id'>): Promise<Alert> {
    if (!db) throw new Error("Firestore not configured.");
    
    const alertsCol = collection(db, `users/${accessKey}/alerts`);
    const newAlertData = {
      ...alertData,
      timestamp: Timestamp.fromMillis(alertData.timestamp)
    };
    
    const docRef = await addDoc(alertsCol, newAlertData);
    
    return {
        ...alertData,
        id: docRef.id,
    };
}


export async function updateAlert(accessKey: string, alertId: string, updateData: Partial<Alert>) {
    if (!db) throw new Error("Firestore not configured.");

    const alertDoc = doc(db, `users/${accessKey}/alerts`, alertId);
    // Explicitly cast updateData to the expected type for Firestore
    await updateDoc(alertDoc, updateData as DocumentData);
}

export async function updateMultipleAlerts(accessKey: string, alertIds: string[], updateData: Partial<Alert>) {
    if (!db || alertIds.length === 0) return;

    const batch = writeBatch(db);
    alertIds.forEach(id => {
        const alertDoc = doc(db, `users/${accessKey}/alerts`, id);
        // Explicitly cast updateData to the expected type for Firestore
        batch.update(alertDoc, updateData as DocumentData);
    });

    await batch.commit();
}
