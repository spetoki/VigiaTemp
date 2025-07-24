
'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  addDoc,
  Timestamp,
  query,
  orderBy,
  DocumentData,
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

// Helper to convert a Firestore document to our TraceabilityData type
const lotFromDoc = (doc: DocumentData): TraceabilityData => {
    const data = doc.data();
    // Convert Firestore Timestamp to ISO string for consistency
    const createdAt = data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate().toISOString()
        : new Date().toISOString();

    return {
        id: doc.id,
        createdAt,
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

/**
 * Fetches all traceability lots for a given access key.
 * @param accessKey The active access key to scope the lots.
 * @returns A promise that resolves to an array of lots.
 */
export async function getLots(accessKey: string): Promise<TraceabilityData[]> {
  if (!db || !accessKey) {
    console.error("getLots failed: Firestore not initialized or accessKey is missing.");
    return [];
  }
  try {
    const lotsCol = collection(db, 'users', accessKey, 'traceabilityLots');
    const q = query(lotsCol, orderBy('createdAt', 'desc'));
    const lotSnapshot = await getDocs(q);
    const lotList = lotSnapshot.docs.map(lotFromDoc);
    return lotList;
  } catch (error) {
    console.error("Error fetching lots from Firestore:", error);
    throw new Error("Failed to fetch lots.");
  }
}

/**
 * Adds a new traceability lot to Firestore for a given access key.
 * @param accessKey The active access key.
 * @param lotData The lot data to add.
 * @returns A promise that resolves to the newly created lot with its ID and timestamp.
 */
export async function addLot(accessKey: string, lotData: Omit<TraceabilityData, 'id' | 'createdAt'>): Promise<TraceabilityData> {
  if (!db || !accessKey) {
    throw new Error("addLot failed: Firestore not initialized or accessKey is missing.");
  }
  try {
    const lotsCol = collection(db, 'users', accessKey, 'traceabilityLots');
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
  } catch (error) {
    console.error("Error adding lot to Firestore:", error);
    throw new Error("Failed to add lot.");
  }
}
