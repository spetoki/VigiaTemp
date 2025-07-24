
'use server';

import { db } from '@/lib/firebase';
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


// The data structure used within the application
export interface TraceabilityData {
  id: string;
  createdAt: string; // Stored as ISO string
  lotDescription: string;
  name: string;
  wetCocoaWeight: string;
  dryCocoaWeight: string;
  fermentationTime: string;
  dryingTime: string;
  isoClassification: string;
  classificationBoardImageBase64: string | null;
}

const lotFromDoc = (doc: QueryDocumentSnapshot<DocumentData>): TraceabilityData => {
    const data = doc.data();
    return {
        id: doc.id,
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        lotDescription: data.lotDescription,
        name: data.name,
        wetCocoaWeight: data.wetCocoaWeight,
        dryCocoaWeight: data.dryCocoaWeight,
        fermentationTime: data.fermentationTime,
        dryingTime: data.dryingTime,
        isoClassification: data.isoClassification,
        classificationBoardImageBase64: data.classificationBoardImageBase64,
    };
};

export async function getLots(accessKey: string): Promise<TraceabilityData[]> {
    if (!db) {
        console.warn("Firestore is not configured. Returning empty lots list.");
        return [];
    }
    try {
        const lotsCol = collection(db, `users/${accessKey}/lots`);
        const q = query(lotsCol, orderBy("createdAt", "desc"));
        const lotSnapshot = await getDocs(q);
        return lotSnapshot.docs.map(lotFromDoc);
    } catch (error) {
        console.error("Error fetching lots from Firestore:", error);
        throw new Error("Não foi possível carregar os lotes do banco de dados.");
    }
}

export async function addLot(accessKey: string, lotData: Omit<TraceabilityData, 'id' | 'createdAt'>): Promise<TraceabilityData> {
    if (!db) throw new Error("Firestore not configured.");

    const lotsCol = collection(db, `users/${accessKey}/lots`);
    const newLotData = {
        ...lotData,
        createdAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(lotsCol, newLotData);
    
    return {
        ...lotData,
        id: docRef.id,
        createdAt: newLotData.createdAt.toDate().toISOString(),
    };
}
