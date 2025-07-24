
'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  addDoc,
  query,
  orderBy,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';

// --- Types ---
export interface TraceabilityData {
  id: string;
  createdAt: string; // Stored as ISO string
  lotDescription: string;
  name: string;
  wetCocoaWeight: number | '';
  dryCocoaWeight: number | '';
  fermentationTime: number | '';
  dryingTime: number | '';
  isoClassification: string;
  classificationBoardImageBase64: string | null;
}

export interface TraceabilityFormData {
  lotDescription: string;
  name: string;
  wetCocoaWeight: number | '';
  dryCocoaWeight: number | '';
  fermentationTime: number | '';
  dryingTime: number | '';
  isoClassification: string;
  classificationBoardImageBase64: string | null;
}

// Helper to convert Firestore doc to TraceabilityData
const lotFromDoc = (doc: DocumentData): TraceabilityData => {
    const data = doc.data();
    // Convert Firestore Timestamp to ISO string for consistency
    const createdAt = data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate().toISOString()
        : new Date().toISOString();

    return {
        id: doc.id,
        createdAt: createdAt,
        lotDescription: data.lotDescription || '',
        name: data.name || '',
        wetCocoaWeight: data.wetCocoaWeight || '',
        dryCocoaWeight: data.dryCocoaWeight || '',
        fermentationTime: data.fermentationTime || '',
        dryingTime: data.dryingTime || '',
        isoClassification: data.isoClassification || '',
        classificationBoardImageBase64: data.classificationBoardImageBase64 || null,
    };
};

/**
 * Fetches all traceability lots for a given access key, ordered by creation date.
 * @param accessKey The active access key to scope the lots.
 * @returns A promise that resolves to an array of lots.
 */
export async function getLots(accessKey: string): Promise<TraceabilityData[]> {
  if (!accessKey) {
    console.error("getLots failed: accessKey is required.");
    return [];
  }
  try {
    const lotsCol = collection(db, 'users', accessKey, 'traceabilityLots');
    const q = query(lotsCol, orderBy('createdAt', 'desc'));
    const lotSnapshot = await getDocs(q);
    const lotList = lotSnapshot.docs.map(doc => lotFromDoc(doc));
    return lotList;
  } catch (error) {
    console.error("Error fetching lots from Firestore:", error);
    throw new Error("Failed to fetch lots.");
  }
}

/**
 * Adds a new lot to Firestore for a given access key.
 * @param accessKey The active access key.
 * @param lotData The lot data to add.
 * @returns A promise that resolves to the newly created lot with its ID and timestamp.
 */
export async function addLot(accessKey: string, lotData: TraceabilityFormData): Promise<TraceabilityData> {
  if (!accessKey) {
    throw new Error("addLot failed: accessKey is required.");
  }
  try {
    const lotsCol = collection(db, 'users', accessKey, 'traceabilityLots');
    
    const dataToSave = {
      ...lotData,
      // Convert empty strings to null for Firestore if necessary, or handle in form
      wetCocoaWeight: lotData.wetCocoaWeight !== '' ? Number(lotData.wetCocoaWeight) : null,
      dryCocoaWeight: lotData.dryCocoaWeight !== '' ? Number(lotData.dryCocoaWeight) : null,
      fermentationTime: lotData.fermentationTime !== '' ? Number(lotData.fermentationTime) : null,
      dryingTime: lotData.dryingTime !== '' ? Number(lotData.dryingTime) : null,
      createdAt: Timestamp.now(), // Use server timestamp for accuracy
    };

    const docRef = await addDoc(lotsCol, dataToSave);

    const newLot: TraceabilityData = {
      ...lotData,
      id: docRef.id,
      createdAt: new Date().toISOString(), // Use client-side date as an immediate fallback
    };
    return newLot;
  } catch (error) {
    console.error("Error adding lot to Firestore:", error);
    throw new Error("Failed to add lot.");
  }
}
