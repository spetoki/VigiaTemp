
'use server';

import type { Alert } from '@/types';

// Helper to get alerts from localStorage
const getStoredAlerts = (key: string): Alert[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse alerts from localStorage", error);
    return [];
  }
};

// Helper to save alerts to localStorage
const setStoredAlerts = (key: string, alerts: Alert[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(alerts));
};


export async function getAlerts(accessKey: string): Promise<Alert[]> {
  const storageKey = `${accessKey}_demo_alerts`;
  return getStoredAlerts(storageKey).sort((a, b) => b.timestamp - a.timestamp);
}

export async function addAlert(accessKey: string, alertData: Omit<Alert, 'id'>): Promise<Alert> {
  const storageKey = `${accessKey}_demo_alerts`;
  const alerts = getStoredAlerts(storageKey);
  const newAlert: Alert = {
    ...alertData,
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  // Keep only the latest 100 alerts to prevent localStorage from filling up
  const updatedAlerts = [newAlert, ...alerts].slice(0, 100);
  setStoredAlerts(storageKey, updatedAlerts);
  return newAlert;
}

export async function updateAlert(accessKey: string, alertId: string, updateData: Partial<Alert>) {
  const storageKey = `${accessKey}_demo_alerts`;
  let alerts = getStoredAlerts(storageKey);
  alerts = alerts.map(alert =>
    alert.id === alertId ? { ...alert, ...updateData } : alert
  );
  setStoredAlerts(storageKey, alerts);
}

export async function updateMultipleAlerts(accessKey: string, alertIds: string[], updateData: Partial<Alert>) {
  const storageKey = `${accessKey}_demo_alerts`;
  let alerts = getStoredAlerts(storageKey);
  const idsToUpdate = new Set(alertIds);
  alerts = alerts.map(alert =>
    idsToUpdate.has(alert.id) ? { ...alert, ...updateData } : alert
  );
  setStoredAlerts(storageKey, alerts);
}
