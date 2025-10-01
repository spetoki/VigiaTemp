
'use server';

import type { TraceabilityData, TraceabilityFormData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export type { TraceabilityData, TraceabilityFormData };

// In-memory store for traceability lots.
let localLots: TraceabilityData[] = [];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getLots(collectionPath: string): Promise<TraceabilityData[]> {
    await sleep(100);
    return Promise.resolve(localLots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
}

export async function addLot(collectionPath: string, lotData: TraceabilityFormData): Promise<TraceabilityData> {
    await sleep(100);
    const newLot: TraceabilityData = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        lotDescription: lotData.lotDescription,
        name: lotData.name,
        wetCocoaWeight: parseFloat(lotData.wetCocoaWeight) || 0,
        dryCocoaWeight: parseFloat(lotData.dryCocoaWeight) || 0,
        fermentationTime: parseInt(lotData.fermentationTime, 10) || 0,
        dryingTime: parseInt(lotData.dryingTime, 10) || 0,
        isoClassification: lotData.isoClassification,
    };
    localLots.push(newLot);
    return Promise.resolve(newLot);
}

export async function deleteLot(collectionPath: string, lotId: string): Promise<void> {
    await sleep(100);
    localLots = localLots.filter(lot => lot.id !== lotId);
    return Promise.resolve();
}
