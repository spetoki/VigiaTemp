
'use server';

import { getDb } from '@/lib/firebase';
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
    
    const newLotData = {
        ...lotData,
        createdAt: serverTimestamp(), // Use server timestamp for creation
        wetCocoaWeight: parseFloat(lotData.wetCocoaWeight) || 0,
        dryCocoaWeight: parseFloat(lotData.dryCocoaWeight) || 0,
        fermentationTime: parseInt(lotData.fermentationTime, 10) || 0,
        dryingTime: parseInt(lotData.dryingTime, 10) || 0,
    };
    
    const docRef = await addDoc(collection(db, collectionPath), newLotData);
    
    return {
        ...lotData,
        id: docRef.id,
        createdAt: new Date().toISOString(), // Return current date as an estimate
        wetCocoaWeight: newLotData.wetCocoaWeight,
        dryCocoaWeight: newLotData.dryCocoaWeight,
        fermentationTime: newLotData.fermentationTime,
        dryingTime: newLotData.dryingTime,
    };
}


export async function deleteLot(collectionPath: string, lotId: string): Promise<void> {
    if (!collectionPath) throw new Error("Caminho da coleção inválido.");
    const db = getDb();
    await deleteDoc(doc(db, collectionPath, lotId));
}
