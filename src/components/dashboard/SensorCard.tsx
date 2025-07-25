

"use client";

import type { Sensor, SensorStatus } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react';
import { cn, formatTemperature, getSensorStatus } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';
import { Badge } from '@/components/ui/badge';

interface SensorCardProps {
  sensor: Sensor;
}

export default function SensorCard({ sensor }: SensorCardProps) {
  const { temperatureUnit, t } = useSettings();
  const status = getSensorStatus(sensor);

  const statusConfig: Record<SensorStatus, { icon: React.ElementType; colorClass: string; label: string }> = {
    normal: { icon: CheckCircle2, colorClass: 'text-green-600', label: t('sensorCard.label.normal', 'Normal') },
    warning: { icon: AlertTriangle, colorClass: 'text-yellow-500', label: t('sensorCard.label.warning', 'Atenção') },
    critical: { icon: AlertTriangle, colorClass: 'text-destructive-foreground', label: t('sensorCard.label.critical', 'Crítico') },
  };

  const CurrentStatusIcon = statusConfig[status].icon;

  return (
    <Card className={cn(
      "shadow-lg hover:shadow-xl transition-all duration-300",
      status === 'critical' ? "bg-destructive text-destructive-foreground animate-flash-bg" :
      status === 'warning' ? "border-yellow-500" :
      "border-gray-200"
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-headline">{sensor.name}</CardTitle>
          <Badge variant={status === 'critical' ? 'default' : status === 'warning' ? 'default' : 'secondary'} 
                 className={cn(
                   status === 'warning' && 'bg-yellow-500 text-white', 
                   status === 'critical' && 'bg-destructive-foreground/20 text-destructive-foreground border-destructive-foreground/50'
                 )}>
            <CurrentStatusIcon className={cn("mr-1 h-4 w-4", 
                status === 'normal' ? 'text-green-600' :
                status === 'warning' ? 'text-white' :
                'text-destructive-foreground'
            )} />
            {statusConfig[status].label}
          </Badge>
        </div>
        <CardDescription className={cn("flex items-center text-sm", status === 'critical' ? 'text-destructive-foreground/80' : 'text-muted-foreground')}>
            <MapPin className="h-4 w-4 mr-1" /> {sensor.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center my-4">
          <Thermometer className={cn("h-16 w-16", statusConfig[status].colorClass)} />
          <p className={cn("text-5xl font-bold ml-4", statusConfig[status].colorClass)}>
            {formatTemperature(sensor.currentTemperature, temperatureUnit)}
          </p>
        </div>
        <div className={cn("text-xs grid grid-cols-2 gap-2", status === 'critical' ? 'text-destructive-foreground/80' : 'text-muted-foreground')}>
          <p>{t('sensorCard.lowThreshold', 'Limite Inferior')}: {formatTemperature(sensor.lowThreshold, temperatureUnit)}</p>
          <p>{t('sensorCard.highThreshold', 'Limite Superior')}: {formatTemperature(sensor.highThreshold, temperatureUnit)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
