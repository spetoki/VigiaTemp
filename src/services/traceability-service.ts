
'use server';

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

// Helper to get lots from localStorage
const getStoredLots = (key: string): TraceabilityData[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse lots from localStorage", error);
    return [];
  }
};

// Helper to save lots to localStorage
const setStoredLots = (key: string, lots: TraceabilityData[]) => {
  if (typeof window === 'undefined') return;
  // This can fail if storage is full (e.g., too many large images)
  try {
    localStorage.setItem(key, JSON.stringify(lots));
  } catch (error) {
     console.error("Failed to save lots to localStorage. Storage may be full.", error);
     throw new Error("Failed to save lot. Local storage quota may be exceeded.");
  }
};


export async function getLots(accessKey: string): Promise<TraceabilityData[]> {
    const storageKey = `${accessKey}_demo_traceability_lots`;
    const lots = getStoredLots(storageKey);
    // Sort by creation date descending
    return lots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addLot(accessKey: string, lotData: Omit<TraceabilityData, 'id' | 'createdAt'>): Promise<TraceabilityData> {
    const storageKey = `${accessKey}_demo_traceability_lots`;
    const lots = getStoredLots(storageKey);
    const newLot: TraceabilityData = {
        ...lotData,
        id: `lot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
    };
    const updatedLots = [newLot, ...lots];
    setStoredLots(storageKey, updatedLots);
    return newLot;
}
