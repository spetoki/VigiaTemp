
"use client";

import type { Alert } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, Check, CheckCircle, MessageSquareText, UserCheck } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox"
import React from 'react';

interface AlertsTableProps {
  alerts: Alert[];
  onAcknowledgeRequest: (alert: Alert) => void;
  isLoading: boolean;
  selectedAlerts: string[];
  onSelectedAlertsChange: (ids: string[]) => void;
}

export default function AlertsTable({ 
  alerts, 
  onAcknowledgeRequest, 
  isLoading,
  selectedAlerts,
  onSelectedAlertsChange
}: AlertsTableProps) {
  const { t, language } = useSettings();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedAlertsChange(alerts.map(a => a.id));
    } else {
      onSelectedAlertsChange([]);
    }
  };

  const handleSelectOne = (alertId: string, checked: boolean) => {
    if (checked) {
      onSelectedAlertsChange([...selectedAlerts, alertId]);
    } else {
      onSelectedAlertsChange(selectedAlerts.filter(id => id !== alertId));
    }
  };

  const isAllSelected = alerts.length > 0 && selectedAlerts.length === alerts.length;

  const levelConfig = {
    critical: {
      label: t('alertsTable.level.critical', 'Crítico'),
      icon: AlertTriangle,
      badgeClass: 'bg-destructive text-destructive-foreground',
      iconClass: 'text-destructive-foreground',
    },
    warning: {
      label: t('alertsTable.level.warning', 'Atenção'),
      icon: AlertTriangle,
      badgeClass: 'bg-yellow-500 text-white',
      iconClass: 'text-white',
    },
  };

  return (
    <TooltipProvider>
      <div className="rounded-lg border overflow-hidden shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                 <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Selecionar todos"
                  />
              </TableHead>
              <TableHead className="w-[120px]">{t('alertsTable.header.status', 'Status')}</TableHead>
              <TableHead className="w-[150px]">{t('alertsTable.header.level', 'Nível')}</TableHead>
              <TableHead>{t('alertsTable.header.sensor', 'Sensor')}</TableHead>
              <TableHead>{t('alertsTable.header.message', 'Mensagem do Alerta')}</TableHead>
              <TableHead>{t('alertsTable.header.confirmation', 'Detalhes da Confirmação')}</TableHead>
              <TableHead className="w-[180px]">{t('alertsTable.header.timestamp', 'Horário')}</TableHead>
              <TableHead className="text-right w-[120px]">{t('alertsTable.header.actions', 'Ação')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground h-24">
                  {t('alertsTable.loading', 'Carregando alertas...')}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && alerts.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground h-24">
                  {t('alertsTable.noAlerts', 'Nenhum alerta encontrado.')}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && alerts.map((alert) => {
              const config = levelConfig[alert.level];
              const Icon = config.icon;
              return (
                <TableRow 
                  key={alert.id} 
                  className={cn(
                    !alert.acknowledged && "font-bold bg-primary/5",
                    selectedAlerts.includes(alert.id) && "bg-primary/10"
                  )}
                  data-state={selectedAlerts.includes(alert.id) ? "selected" : "unselected"}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedAlerts.includes(alert.id)}
                      onCheckedChange={(checked) => handleSelectOne(alert.id, Boolean(checked))}
                      aria-label={`Selecionar alerta ${alert.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={alert.acknowledged ? 'secondary' : 'default'} className={cn(alert.acknowledged ? '' : 'bg-accent text-accent-foreground')}>
                        {alert.acknowledged ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {t('alertsTable.status.acknowledged', 'Confirmado')}
                          </>
                        ) : (
                          <>
                           <AlertTriangle className="mr-1 h-3 w-3" />
                           {t('alertsTable.status.unacknowledged', 'Pendente')}
                          </>
                        )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className={cn(config.badgeClass)}>
                      <Icon className={cn("mr-1 h-3 w-3", config.iconClass)} />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{alert.sensorName}</TableCell>
                  <TableCell className="text-muted-foreground font-normal">{alert.message}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-normal">
                    {alert.acknowledged ? (
                      <div>
                        <p className="flex items-center gap-1"><UserCheck className="h-3 w-3" /> <strong>{alert.acknowledgedBy}</strong></p>
                        <p className="mt-1 italic">"{alert.acknowledgementNote}"</p>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(alert.timestamp).toLocaleString(language, {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {!alert.acknowledged ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => onAcknowledgeRequest(alert)}>
                            <MessageSquareText className="h-4 w-4" />
                            <span className="sr-only">{t('alertsTable.acknowledgeAction', 'Confirmar Alerta')}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('alertsTable.acknowledgeAction', 'Confirmar Alerta')}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-sm text-muted-foreground font-normal">{t('alertsTable.actionDone', 'Feito')}</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
