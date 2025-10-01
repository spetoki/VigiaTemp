
'use server';

import type { Alert } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for alerts, acting as a local database for demonstration purposes.
let localAlerts: Alert[] = [];

// Helper function to simulate network delay.
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getAlerts(collectionPath: string): Promise<Alert[]> {
    await sleep(100); // Simulate async operation
    return Promise.resolve(localAlerts.sort((a, b) => b.timestamp - a.timestamp));
}

export async function addAlert(collectionPath: string, alertData: Omit<Alert, 'id'>): Promise<Alert> {
    await sleep(50);
    const newAlert: Alert = {
        ...alertData,
        id: uuidv4(),
    };
    localAlerts.push(newAlert);
    return Promise.resolve(newAlert);
}

export async function updateAlert(collectionPath: string, alertId: string, updateData: Partial<Alert>): Promise<void> {
    await sleep(50);
    const alertIndex = localAlerts.findIndex(a => a.id === alertId);
    if (alertIndex !== -1) {
        localAlerts[alertIndex] = { ...localAlerts[alertIndex], ...updateData };
    }
    return Promise.resolve();
}

export async function updateMultipleAlerts(collectionPath: string, alertIds: string[], updateData: Partial<Alert>): Promise<void> {
    await sleep(100);
    localAlerts = localAlerts.map(alert => 
        alertIds.includes(alert.id) ? { ...alert, ...updateData } : alert
    );
    return Promise.resolve();
}

export async function deleteMultipleAlerts(collectionPath: string, alertIds: string[]): Promise<void> {
    await sleep(100);
    localAlerts = localAlerts.filter(alert => !alertIds.includes(alert.id));
    return Promise.resolve();
}
