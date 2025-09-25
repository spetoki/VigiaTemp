
'use server';

import { getDb } from '@/lib/firebase';
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
  updateDoc,
  deleteDoc,
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

export async function getAlerts(collectionPath: string): Promise<Alert[]> {
    const db = getDb();
    if (!collectionPath.startsWith('users/')) {
        console.warn("Collection path is invalid. Returning empty alerts list.");
        return [];
    }
    try {
        const alertsCol = collection(db, collectionPath);
        // Order by most recent and limit to the last 100 to avoid performance issues
        const q = query(alertsCol, orderBy("timestamp", "desc"), limit(100));
        const alertSnapshot = await getDocs(q);
        return alertSnapshot.docs.map(alertFromDoc);
    } catch (error) {
        console.error("Error fetching alerts from Firestore:", error);
        throw new Error("Não foi possível carregar os alertas do banco de dados.");
    }
}


export async function addAlert(collectionPath: string, alertData: Omit<Alert, 'id'>): Promise<Alert> {
    const db = getDb();
    if (!collectionPath.startsWith('users/')) {
        throw new Error("Caminho da coleção é inválido. Não é possível adicionar alerta.");
    }
    
    const alertsCol = collection(db, collectionPath);
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


export async function updateAlert(collectionPath: string, alertId: string, updateData: Partial<Alert>) {
    const db = getDb();
    if (!collectionPath.startsWith('users/')) {
      throw new Error("Caminho da coleção é inválido. Não é possível atualizar alerta.");
    }
    const alertDoc = doc(db, collectionPath, alertId);
    await updateDoc(alertDoc, updateData as DocumentData);
}

export async function updateMultipleAlerts(collectionPath: string, alertIds: string[], updateData: Partial<Alert>) {
    const db = getDb();
    if (alertIds.length === 0 || !collectionPath.startsWith('users/')) {
      return;
    }
    const batch = writeBatch(db);
    alertIds.forEach(id => {
        const alertDoc = doc(db, collectionPath, id);
        batch.update(alertDoc, updateData as DocumentData);
    });

    await batch.commit();
}


export async function deleteMultipleAlerts(collectionPath: string, alertIds: string[]): Promise<void> {
  const db = getDb();
  if (alertIds.length === 0 || !collectionPath.startsWith('users/')) {
    return;
  }
  
  const batch = writeBatch(db);
  alertIds.forEach(id => {
    const alertDoc = doc(db, collectionPath, id);
    batch.delete(alertDoc);
  });
  
  await batch.commit();
}
