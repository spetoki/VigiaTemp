
'use server';

import type { TraceabilityData, TraceabilityFormData } from '@/types';

// Emula um banco de dados de lotes na memória.
let inMemoryLots: TraceabilityData[] = [];

export async function getLots(collectionPath: string): Promise<TraceabilityData[]> {
    console.log("Modo Demo: Retornando lotes da memória.");
    return Promise.resolve(inMemoryLots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
}

export async function addLot(collectionPath: string, lotData: TraceabilityFormData): Promise<TraceabilityData> {
    console.log("Modo Demo: Adicionando lote na memória.");
    
    const newLot: TraceabilityData = {
        id: `lot-${Date.now()}`,
        createdAt: new Date().toISOString(),
        name: lotData.name,
        lotDescription: lotData.lotDescription,
        wetCocoaWeight: parseFloat(lotData.wetCocoaWeight) || 0,
        dryCocoaWeight: parseFloat(lotData.dryCocoaWeight) || 0,
        fermentationTime: parseInt(lotData.fermentationTime, 10) || 0,
        dryingTime: parseInt(lotData.dryingTime, 10) || 0,
        isoClassification: lotData.isoClassification,
    };
    
    inMemoryLots.unshift(newLot);
    
    return Promise.resolve(newLot);
}

export async function deleteLot(collectionPath: string, lotId: string): Promise<void> {
    console.log(`Modo Demo: Deletando lote ${lotId} da memória.`);
    inMemoryLots = inMemoryLots.filter(lot => lot.id !== lotId);
    return Promise.resolve();
}
