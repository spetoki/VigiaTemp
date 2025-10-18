

"use client";

import type { Sensor, SensorStatus } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, AlertTriangle, CheckCircle2, MapPin, WifiOff } from 'lucide-react';
import { cn, formatTemperature, getSensorStatus } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';
import { Badge } from '@/components/ui/badge';

interface SensorCardProps {
  sensor: Sensor;
}

export default function SensorCard({ sensor }: SensorCardProps) {
  const { temperatureUnit, t } = useSettings();
  const status = getSensorStatus(sensor);

  const statusConfig: Record<SensorStatus, { icon: React.ElementType; colorClass: string; label: string; cardClass?: string; }> = {
    normal: { icon: CheckCircle2, colorClass: 'text-green-600', label: t('sensorCard.label.normal', 'Normal') },
    warning: { icon: AlertTriangle, colorClass: 'text-yellow-500', label: t('sensorCard.label.warning', 'Atenção'), cardClass: 'border-yellow-500' },
    critical: { icon: AlertTriangle, colorClass: 'text-destructive-foreground', label: t('sensorCard.label.critical', 'Crítico'), cardClass: 'bg-destructive text-destructive-foreground animate-flash-bg' },
    offline: { icon: WifiOff, colorClass: 'text-muted-foreground', label: t('sensorCard.label.offline', 'Offline'), cardClass: 'bg-muted/50 border-dashed' },
  };

  const CurrentStatusIcon = statusConfig[status].icon;
  const config = statusConfig[status];


  return (
    <Card className={cn(
      "shadow-lg hover:shadow-xl transition-all duration-300",
      config.cardClass || "border-gray-200"
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-headline">{sensor.name}</CardTitle>
          <Badge variant={status === 'critical' ? 'default' : status === 'warning' ? 'default' : 'secondary'} 
                 className={cn(
                   status === 'warning' && 'bg-yellow-500 text-white', 
                   status === 'critical' && 'bg-destructive-foreground/20 text-destructive-foreground border-destructive-foreground/50',
                   status === 'offline' && 'bg-gray-500 text-white'
                 )}>
            <CurrentStatusIcon className={cn("mr-1 h-4 w-4", 
                status === 'normal' ? 'text-green-600' :
                status === 'warning' ? 'text-white' :
                status === 'critical' ? 'text-destructive-foreground' :
                'text-white'
            )} />
            {config.label}
          </Badge>
        </div>
        <CardDescription className={cn("flex items-center text-sm", status === 'critical' ? 'text-destructive-foreground/80' : 'text-muted-foreground')}>
            <MapPin className="h-4 w-4 mr-1" /> {sensor.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center my-4 gap-2">
          { status !== 'offline' ? (
            <>
              <Thermometer className={cn("h-16 w-16", config.colorClass)} />
              <p className={cn("text-5xl font-bold", config.colorClass)}>
                {formatTemperature(sensor.currentTemperature, temperatureUnit)}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[88px] text-muted-foreground">
                <WifiOff className="h-12 w-12" />
                <p className="mt-2 text-sm font-medium">Sem sinal</p>
            </div>
          )}
        </div>
        <div className={cn("text-xs grid grid-cols-2 gap-2", 
            status === 'critical' ? 'text-destructive-foreground/80' : 
            status === 'offline' ? 'text-muted-foreground/70' : 
            'text-muted-foreground')}>
          <p>{t('sensorCard.lowThreshold', 'Limite Inferior')}: {formatTemperature(sensor.lowThreshold, temperatureUnit)}</p>
          <p>{t('sensorCard.highThreshold', 'Limite Superior')}: {formatTemperature(sensor.highThreshold, temperatureUnit)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
