
'use server';

import { getDb } from './db';
import type { TraceabilityData, TraceabilityFormData } from '@/types';
import { collection, getDocs, addDoc, doc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export type { TraceabilityData, TraceabilityFormData };

// Firestore data structure for a lot
interface LotDocument {
  createdAt: Timestamp;
  lotDescription: string;
  name: string;
  wetCocoaWeight: number;
  dryCocoaWeight: number;
  fermentationTime: number;
  dryingTime: number;
  isoClassification: string;
}


export async function getLots(collectionPath: string): Promise<TraceabilityData[]> {
    if (!collectionPath) return [];
    try {
        const db = getDb();
        const lotsCol = collection(db, collectionPath);
        const lotSnapshot = await getDocs(lotsCol);
        const lotList = lotSnapshot.docs.map(doc => {
            const data = doc.data() as LotDocument;
            return {
                id: doc.id,
                ...data,
                // Convert Firestore Timestamp to ISO string for client-side compatibility
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });
        return lotList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
        console.error("Erro ao buscar lotes: ", error);
        return [];
    }
}

export async function addLot(collectionPath: string, lotData: TraceabilityFormData): Promise<TraceabilityData> {
    if (!collectionPath) {
        throw new Error("Chave de acesso não encontrada. Não é possível salvar o lote.");
    }
    const db = getDb();
    
    // Convert string form data to numbers for Firestore, with fallbacks.
    const dataToSave = {
        lotDescription: lotData.lotDescription,
        name: lotData.name,
        isoClassification: lotData.isoClassification,
        wetCocoaWeight: parseFloat(lotData.wetCocoaWeight) || 0,
        dryCocoaWeight: parseFloat(lotData.dryCocoaWeight) || 0,
        fermentationTime: parseInt(lotData.fermentationTime, 10) || 0,
        dryingTime: parseInt(lotData.dryingTime, 10) || 0,
        createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, collectionPath), dataToSave);
    
    // Return a TraceabilityData object consistent with what getLots returns
    return {
        id: docRef.id,
        createdAt: new Date().toISOString(), // Return current date as a client-side estimate
        lotDescription: dataToSave.lotDescription,
        name: dataToSave.name,
        isoClassification: dataToSave.isoClassification,
        wetCocoaWeight: dataToSave.wetCocoaWeight,
        dryCocoaWeight: dataToSave.dryCocoaWeight,
        fermentationTime: dataToSave.fermentationTime,
        dryingTime: dataToSave.dryingTime,
    };
}


export async function deleteLot(collectionPath: string, lotId: string): Promise<void> {
    if (!collectionPath) throw new Error("Caminho da coleção inválido.");
    const db = getDb();
    await deleteDoc(doc(db, collectionPath, lotId));
}
