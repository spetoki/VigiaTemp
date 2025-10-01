
'use server';

import type { Alert } from '@/types';

// Emula um banco de dados de alertas na memória.
let inMemoryAlerts: Alert[] = [];


export async function getAlerts(collectionPath: string): Promise<Alert[]> {
    console.log("Modo Demo: Retornando alertas da memória.");
    return Promise.resolve(inMemoryAlerts.sort((a, b) => b.timestamp - a.timestamp));
}

export async function addAlert(collectionPath: string, alertData: Omit<Alert, 'id'>): Promise<Alert> {
    console.log("Modo Demo: Adicionando alerta na memória.");
    const newAlert: Alert = {
      ...alertData,
      id: `alert-${Date.now()}`
    };
    inMemoryAlerts.unshift(newAlert);
    // Limita o número de alertas em memória para evitar sobrecarga
    if (inMemoryAlerts.length > 100) {
        inMemoryAlerts.pop();
    }
    return Promise.resolve(newAlert);
}

export async function updateAlert(collectionPath: string, alertId: string, updateData: Partial<Alert>) {
    console.log(`Modo Demo: Atualizando alerta ${alertId}.`);
    inMemoryAlerts = inMemoryAlerts.map(alert => 
        alert.id === alertId ? { ...alert, ...updateData } : alert
    );
    return Promise.resolve();
}

export async function updateMultipleAlerts(collectionPath: string, alertIds: string[], updateData: Partial<Alert>) {
    console.log("Modo Demo: Atualizando múltiplos alertas.");
    inMemoryAlerts = inMemoryAlerts.map(alert => 
        alertIds.includes(alert.id) ? { ...alert, ...updateData } : alert
    );
    return Promise.resolve();
}


export async function deleteMultipleAlerts(collectionPath: string, alertIds: string[]): Promise<void> {
  console.log("Modo Demo: Deletando múltiplos alertas.");
  inMemoryAlerts = inMemoryAlerts.filter(alert => !alertIds.includes(alert.id));
  return Promise.resolve();
}
