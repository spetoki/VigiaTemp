
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Alert } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AlertsTable from '@/components/alerts/AlertsTable';

export default function AlertsPage() {
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('unacknowledged');

  const getAlertsKey = useCallback(() => {
    return currentUser ? `alerts_${currentUser.email}` : null;
  }, [currentUser]);

  const loadAlerts = useCallback(() => {
    const ALERTS_KEY = getAlertsKey();
    if (!ALERTS_KEY) {
      setIsLoading(false);
      return;
    }
    try {
      const storedAlerts = localStorage.getItem(ALERTS_KEY);
      if (storedAlerts) {
        // Data sanitization for alerts
        const parsedAlerts: any[] = JSON.parse(storedAlerts);
        const cleanedAlerts: Alert[] = parsedAlerts.map(a => ({
          id: a.id || `alert-${Date.now()}${Math.random()}`,
          sensorId: a.sensorId || 'unknown-sensor',
          sensorName: a.sensorName || 'Unknown Sensor',
          timestamp: a.timestamp || Date.now(),
          level: a.level === 'critical' || a.level === 'warning' ? a.level : 'warning',
          message: a.message || 'No message provided.',
          acknowledged: typeof a.acknowledged === 'boolean' ? a.acknowledged : false,
          reason: a.reason === 'high' || a.reason === 'low' ? a.reason : undefined,
        }));
        setAlerts(cleanedAlerts);
      } else {
        setAlerts([]);
      }
    } catch (error) {
      console.error("Failed to parse alerts from localStorage, defaulting to empty.", error);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, [getAlertsKey]);

  useEffect(() => {
    if (currentUser) {
      loadAlerts();
      
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === getAlertsKey()) {
          loadAlerts();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [loadAlerts, currentUser, getAlertsKey]);

  const handleAcknowledge = (alertId: string) => {
    const ALERTS_KEY = getAlertsKey();
    if (!ALERTS_KEY) return;
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem(ALERTS_KEY, JSON.stringify(updatedAlerts));
  };

  const handleAcknowledgeAll = () => {
    const ALERTS_KEY = getAlertsKey();
    if (!ALERTS_KEY) return;
    const updatedAlerts = alerts.map(alert => ({ ...alert, acknowledged: true }));
    setAlerts(updatedAlerts);
    localStorage.setItem(ALERTS_KEY, JSON.stringify(updatedAlerts));
  };

  const filteredAlerts = useMemo(() => {
    switch (activeTab) {
      case 'unacknowledged':
        return alerts.filter(alert => !alert.acknowledged);
      case 'critical':
        return alerts.filter(alert => alert.level === 'critical');
      case 'warning':
        return alerts.filter(alert => alert.level === 'warning');
      case 'all':
      default:
        return alerts;
    }
  }, [alerts, activeTab]);

  const unacknowledgedCount = useMemo(() => alerts.filter(a => !a.acknowledged).length, [alerts]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-10 w-44" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <Bell className="mr-3 h-8 w-8" />
            {t('alertsPage.title', 'Painel de Alertas')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('alertsPage.description', 'Monitore e gerencie todos os alertas de sensores do sistema.')}
          </p>
        </div>
        <Button onClick={handleAcknowledgeAll} disabled={unacknowledgedCount === 0}>
          <CheckCheck className="mr-2 h-4 w-4" />
          {t('alertsPage.acknowledgeAllButton', 'Confirmar Todos')} ({unacknowledgedCount})
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 sm:w-auto">
          <TabsTrigger value="unacknowledged">{t('alertsPage.tabs.unacknowledged', 'Não Confirmados')}</TabsTrigger>
          <TabsTrigger value="all">{t('alertsPage.tabs.all', 'Todos')}</TabsTrigger>
          <TabsTrigger value="critical">{t('alertsPage.tabs.critical', 'Críticos')}</TabsTrigger>
          <TabsTrigger value="warning">{t('alertsPage.tabs.warning', 'Atenção')}</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
           <AlertsTable
              alerts={filteredAlerts}
              onAcknowledge={handleAcknowledge}
              isLoading={isLoading}
            />
        </TabsContent>
      </Tabs>
    </div>
  );
}
