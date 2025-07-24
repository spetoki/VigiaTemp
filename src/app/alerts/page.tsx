
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Alert } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AlertsTable from '@/components/alerts/AlertsTable';
import { getAlerts, updateAlert, updateMultipleAlerts } from '@/services/alert-service';
import { useToast } from '@/hooks/use-toast';

export default function AlertsPage() {
  const { t, activeKey } = useSettings();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('unacknowledged');

  const loadAlerts = useCallback(async () => {
    if (!activeKey) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const fetchedAlerts = await getAlerts(activeKey);
      setAlerts(fetchedAlerts);
    } catch (error) {
      console.error("Failed to fetch alerts from Firestore:", error);
      toast({
        title: "Erro ao carregar alertas",
        description: "Não foi possível buscar os alertas do banco de dados.",
        variant: "destructive",
      });
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeKey, toast]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleAcknowledge = async (alertId: string) => {
    if (!activeKey) return;
    try {
      await updateAlert(activeKey, alertId, { acknowledged: true });
      const updatedAlerts = alerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      );
      setAlerts(updatedAlerts);
    } catch (error) {
       toast({
        title: "Erro ao confirmar alerta",
        description: "Não foi possível atualizar o status do alerta.",
        variant: "destructive",
      });
    }
  };

  const handleAcknowledgeAll = async () => {
    if (!activeKey || unacknowledgedCount === 0) return;
    
    const unacknowledgedIds = alerts
      .filter(alert => !alert.acknowledged)
      .map(alert => alert.id);

    try {
      await updateMultipleAlerts(activeKey, unacknowledgedIds, { acknowledged: true });
      const updatedAlerts = alerts.map(alert => ({ ...alert, acknowledged: true }));
      setAlerts(updatedAlerts);
    } catch (error) {
        toast({
            title: "Erro ao confirmar todos os alertas",
            description: "Não foi possível atualizar o status dos alertas.",
            variant: "destructive",
        });
    }
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
          <TabsTrigger value="critical">{t('alertsPage.tabs.tabs.critical', 'Críticos')}</TabsTrigger>
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
