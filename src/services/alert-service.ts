
'use server';

import { getDb } from './db';
import type { Alert } from '@/types';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

export async function getAlerts(collectionPath: string): Promise<Alert[]> {
    if (!collectionPath) return [];
    try {
        const db = getDb();
        const alertsCol = collection(db, collectionPath);
        const alertSnapshot = await getDocs(alertsCol);
        const alertList = alertSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
        return alertList.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
        console.error("Erro ao buscar alertas: ", error);
        return [];
    }
}

export async function addAlert(collectionPath: string, alertData: Omit<Alert, 'id'>): Promise<Alert> {
    if (!collectionPath) throw new Error("Caminho da coleção inválido.");
    const db = getDb();
    const docRef = await addDoc(collection(db, collectionPath), alertData);
    return { id: docRef.id, ...alertData };
}

export async function updateAlert(collectionPath: string, alertId: string, updateData: Partial<Alert>): Promise<void> {
    if (!collectionPath) throw new Error("Caminho da coleção inválido.");
    const db = getDb();
    const alertRef = doc(db, collectionPath, alertId);
    await updateDoc(alertRef, updateData);
}

export async function updateMultipleAlerts(collectionPath: string, alertIds: string[], updateData: Partial<Alert>): Promise<void> {
    if (!collectionPath || alertIds.length === 0) return;
    const db = getDb();
    const batch = writeBatch(db);
    alertIds.forEach(id => {
        const alertRef = doc(db, collectionPath, id);
        batch.update(alertRef, updateData);
    });
    await batch.commit();
}

export async function deleteMultipleAlerts(collectionPath: string, alertIds: string[]): Promise<void> {
    if (!collectionPath || alertIds.length === 0) return;
    const db = getDb();
    const batch = writeBatch(db);
    alertIds.forEach(id => {
        const alertRef = doc(db, collectionPath, id);
        batch.delete(alertRef);
    });
    await batch.commit();
}
