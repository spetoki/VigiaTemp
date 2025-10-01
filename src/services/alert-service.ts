
'use server';

import type { Alert } from '@/types';
import { supabase } from '@/lib/supabaseClient';

export async function getAlerts(collectionPath: string): Promise<Alert[]> {
    const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('timestamp', { ascending: false });

    if (error) {
        console.error("Supabase getAlerts error:", error);
        return [];
    }

    // Map Supabase response to Alert type
    return data.map(a => ({
        id: a.id,
        sensorId: a.sensor_id,
        sensorName: a.sensor_name,
        timestamp: new Date(a.timestamp).getTime(),
        level: a.level,
        message: a.message,
        acknowledged: a.acknowledged,
        reason: a.reason,
    }));
}

export async function addAlert(collectionPath: string, alertData: Omit<Alert, 'id'>): Promise<Alert> {
    const { data, error } = await supabase
        .from('alerts')
        .insert([{
            sensor_id: alertData.sensorId,
            sensor_name: alertData.sensorName,
            timestamp: new Date(alertData.timestamp).toISOString(),
            level: alertData.level,
            message: alertData.message,
            acknowledged: alertData.acknowledged,
            reason: alertData.reason,
        }])
        .select()
        .single();
    
    if (error) {
        console.error("Supabase addAlert error:", error);
        throw new Error("Falha ao adicionar alerta no Supabase.");
    }
    
    return {
        id: data.id,
        sensorId: data.sensor_id,
        sensorName: data.sensor_name,
        timestamp: new Date(data.timestamp).getTime(),
        level: data.level,
        message: data.message,
        acknowledged: data.acknowledged,
        reason: data.reason,
    };
}

export async function updateAlert(collectionPath: string, alertId: string, updateData: Partial<Alert>) {
    const { error } = await supabase
        .from('alerts')
        .update({ acknowledged: updateData.acknowledged })
        .eq('id', alertId);

    if (error) {
        console.error("Supabase updateAlert error:", error);
        throw new Error("Falha ao atualizar alerta no Supabase.");
    }
}

export async function updateMultipleAlerts(collectionPath: string, alertIds: string[], updateData: Partial<Alert>) {
    const { error } = await supabase
        .from('alerts')
        .update({ acknowledged: updateData.acknowledged })
        .in('id', alertIds);

    if (error) {
        console.error("Supabase updateMultipleAlerts error:", error);
        throw new Error("Falha ao atualizar múltiplos alertas no Supabase.");
    }
}

export async function deleteMultipleAlerts(collectionPath: string, alertIds: string[]): Promise<void> {
    const { error } = await supabase
        .from('alerts')
        .delete()
        .in('id', alertIds);
    
    if (error) {
        console.error("Supabase deleteMultipleAlerts error:", error);
        throw new Error("Falha ao deletar múltiplos alertas no Supabase.");
    }
}
