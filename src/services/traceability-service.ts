
'use server';

import { getDb } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  query,
  orderBy,
  doc,
  deleteDoc,
} from 'firebase/firestore';


// The data structure used within the application
export interface TraceabilityData {
  id: string;
  createdAt: string; // Stored as ISO string
  lotDescription: string;
  name: string;
  wetCocoaWeight: number;
  dryCocoaWeight: number;
  fermentationTime: number;
  dryingTime: number;
  isoClassification: string;
}

// The data structure received from the form
export interface TraceabilityFormData {
  lotDescription: string;
  name: string;
  wetCocoaWeight: string;
  dryCocoaWeight: string;
  fermentationTime: string;
  dryingTime: string;
  isoClassification: string;
}


const lotFromDoc = (doc: QueryDocumentSnapshot<DocumentData>): TraceabilityData => {
    const data = doc.data();
    return {
        id: doc.id,
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        lotDescription: data.lotDescription || '',
        name: data.name,
        wetCocoaWeight: data.wetCocoaWeight || 0,
        dryCocoaWeight: data.dryCocoaWeight || 0,
        fermentationTime: data.fermentationTime || 0,
        dryingTime: data.dryingTime || 0,
        isoClassification: data.isoClassification,
    };
};

export async function getLots(collectionPath: string): Promise<TraceabilityData[]> {
    const db = getDb();
    if (!collectionPath.startsWith('users/')) {
        console.warn("Collection path is invalid. Returning empty lots list.");
        return [];
    }
    try {
        const lotsCol = collection(db, collectionPath);
        const q = query(lotsCol, orderBy("createdAt", "desc"));
        const lotSnapshot = await getDocs(q);
        return lotSnapshot.docs.map(lotFromDoc);
    } catch (error) {
        console.error("Error fetching lots from Firestore:", error);
        throw new Error("Não foi possível carregar os lotes do banco de dados.");
    }
}

export async function addLot(collectionPath: string, lotData: TraceabilityFormData): Promise<TraceabilityData> {
    const db = getDb();
    if (!collectionPath.startsWith('users/')) {
        throw new Error("Caminho da coleção é inválido. Não é possível adicionar o lote.");
    }

    const lotsCol = collection(db, collectionPath);
    
    // Create a clean data object to be saved, converting strings to numbers
    const dataToSave: Omit<TraceabilityData, 'id' | 'createdAt'> & { createdAt: Timestamp } = {
        name: lotData.name,
        lotDescription: lotData.lotDescription,
        wetCocoaWeight: parseFloat(lotData.wetCocoaWeight) || 0,
        dryCocoaWeight: parseFloat(lotData.dryCocoaWeight) || 0,
        fermentationTime: parseInt(lotData.fermentationTime, 10) || 0,
        dryingTime: parseInt(lotData.dryingTime, 10) || 0,
        isoClassification: lotData.isoClassification,
        createdAt: Timestamp.now(),
    };
    
    // Ensure no undefined values are sent to Firestore
    Object.keys(dataToSave).forEach(key => {
        const dataKey = key as keyof typeof dataToSave;
        if (dataToSave[dataKey] === undefined) {
            delete dataToSave[dataKey];
        }
    });

    const docRef = await addDoc(lotsCol, dataToSave as DocumentData);
    
    return {
        id: docRef.id,
        createdAt: dataToSave.createdAt.toDate().toISOString(),
        name: dataToSave.name,
        lotDescription: dataToSave.lotDescription,
        wetCocoaWeight: dataToSave.wetCocoaWeight,
        dryCocoaWeight: dataToSave.dryCocoaWeight,
        fermentationTime: dataToSave.fermentationTime,
        dryingTime: dataToSave.dryingTime,
        isoClassification: dataToSave.isoClassification,
    };
}


export async function deleteLot(collectionPath: string, lotId: string): Promise<void> {
    const db = getDb();
    if (!collectionPath.startsWith('users/')) {
        throw new Error("Caminho da coleção é inválido. Não é possível excluir o lote.");
    }
    const lotDoc = doc(db, collectionPath, lotId);
    await deleteDoc(lotDoc);
}

    
