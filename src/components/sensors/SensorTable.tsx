

"use client";

import type { Sensor } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { cn, formatTemperature, getSensorStatus } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React from 'react';

interface SensorTableProps {
  sensors: Sensor[];
  onEdit: (sensor: Sensor) => void;
  onDelete: (sensorId: string) => void;
}

export default function SensorTable({ sensors, onEdit, onDelete }: SensorTableProps) {
  const { temperatureUnit, t } = useSettings();
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = React.useState(false);
  const [sensorToDelete, setSensorToDelete] = React.useState<Sensor | null>(null);

  const handleDeleteRequest = (sensor: Sensor) => {
    setSensorToDelete(sensor);
    setDeleteConfirmationOpen(true);
  };

  const confirmDelete = () => {
    if (sensorToDelete) {
      onDelete(sensorToDelete.id);
    }
    setDeleteConfirmationOpen(false);
    setSensorToDelete(null);
  };

  const statusTranslations: Record<ReturnType<typeof getSensorStatus>, string> = {
    normal: t('sensorCard.label.normal', 'Normal'),
    warning: t('sensorCard.label.warning', 'Atenção'),
    critical: t('sensorCard.label.critical', 'Crítico'),
  };

  return (
    <>
      <div className="rounded-lg border overflow-hidden shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('sensorsPage.table.name', 'Nome')}</TableHead>
              <TableHead>{t('sensorsPage.table.location', 'Localização')}</TableHead>
              <TableHead className="text-center">{t('sensorsPage.table.currentTemp', 'Temp. Atual')}</TableHead>
              <TableHead className="text-center">{t('sensorsPage.table.lowThreshold', 'Lim. Inferior')}</TableHead>
              <TableHead className="text-center">{t('sensorsPage.table.highThreshold', 'Lim. Superior')}</TableHead>
              <TableHead className="text-center">{t('sensorsPage.table.status', 'Status')}</TableHead>
              <TableHead className="text-right">{t('sensorsPage.table.actions', 'Ações')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sensors.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                  {t('sensorsPage.table.noSensors', 'Nenhum sensor encontrado. Adicione um novo sensor para começar.')}
                </TableCell>
              </TableRow>
            )}
            {sensors.map((sensor) => {
              const status = getSensorStatus(sensor);
              return (
                <TableRow key={sensor.id} className={cn(status === 'critical' ? 'bg-accent/10' : status === 'warning' ? 'bg-yellow-500/10' : '')}>
                  <TableCell className="font-medium">{sensor.name}</TableCell>
                  <TableCell>{sensor.location}</TableCell>
                  <TableCell className="text-center">{formatTemperature(sensor.currentTemperature, temperatureUnit)}</TableCell>
                  <TableCell className="text-center">{formatTemperature(sensor.lowThreshold, temperatureUnit)}</TableCell>
                  <TableCell className="text-center">{formatTemperature(sensor.highThreshold, temperatureUnit)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={status === 'critical' ? 'destructive' : status === 'warning' ? 'default' : 'secondary'}
                           className={cn(status === 'warning' && 'bg-yellow-500 text-white')}>
                      {status === 'critical' || status === 'warning' ? <AlertTriangle className="mr-1 h-3 w-3" /> : <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {statusTranslations[status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(sensor)} aria-label={t('sensorsPage.table.editAction', 'Editar {sensorName}', { sensorName: sensor.name })}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRequest(sensor)} aria-label={t('sensorsPage.table.deleteAction', 'Excluir {sensorName}', { sensorName: sensor.name })}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {sensorToDelete && (
        <AlertDialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('sensorsPage.deleteDialog.title', 'Tem certeza que deseja excluir este sensor?')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('sensorsPage.deleteDialog.description', 'Esta ação não pode ser desfeita. Isso excluirá permanentemente o sensor "{sensorName}" e todos os seus dados associados.', { sensorName: sensorToDelete.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSensorToDelete(null)}>{t('sensorsPage.deleteDialog.cancel', 'Cancelar')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                {t('sensorsPage.deleteDialog.confirm', 'Excluir')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
