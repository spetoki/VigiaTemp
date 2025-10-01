
'use server';

import type { TraceabilityData, TraceabilityFormData } from '@/types';
import { supabase } from '@/lib/supabaseClient';

// Export the types so they can be imported by other modules
export type { TraceabilityData, TraceabilityFormData };

export async function getLots(collectionPath: string): Promise<TraceabilityData[]> {
    const { data, error } = await supabase
        .from('lots')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Supabase getLots error:", error);
        return [];
    }

    return data.map(lot => ({
        id: lot.id,
        createdAt: lot.created_at,
        lotDescription: lot.lot_description,
        name: lot.name,
        wetCocoaWeight: lot.wet_cocoa_weight,
        dryCocoaWeight: lot.dry_cocoa_weight,
        fermentationTime: lot.fermentation_time,
        dryingTime: lot.drying_time,
        isoClassification: lot.iso_classification,
    }));
}

export async function addLot(collectionPath: string, lotData: TraceabilityFormData): Promise<TraceabilityData> {
    const { data, error } = await supabase
        .from('lots')
        .insert([{
            name: lotData.name,
            lot_description: lotData.lotDescription,
            wet_cocoa_weight: parseFloat(lotData.wetCocoaWeight) || 0,
            dry_cocoa_weight: parseFloat(lotData.dryCocoaWeight) || 0,
            fermentation_time: parseInt(lotData.fermentationTime, 10) || 0,
            drying_time: parseInt(lotData.dryingTime, 10) || 0,
            iso_classification: lotData.isoClassification,
        }])
        .select()
        .single();
    
    if (error) {
        console.error("Supabase addLot error:", error);
        throw new Error("Falha ao adicionar lote no Supabase.");
    }

    return {
        id: data.id,
        createdAt: data.created_at,
        lotDescription: data.lot_description,
        name: data.name,
        wetCocoaWeight: data.wet_cocoa_weight,
        dryCocoaWeight: data.dry_cocoa_weight,
        fermentationTime: data.fermentation_time,
        dryingTime: data.drying_time,
        isoClassification: data.iso_classification,
    };
}

export async function deleteLot(collectionPath: string, lotId: string): Promise<void> {
    const { error } = await supabase
        .from('lots')
        .delete()
        .eq('id', lotId);

    if (error) {
        console.error("Supabase deleteLot error:", error);
        throw new Error("Falha ao deletar lote no Supabase.");
    }
}
